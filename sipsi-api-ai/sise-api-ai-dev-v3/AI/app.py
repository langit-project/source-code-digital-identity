from flask import Flask, request, jsonify, render_template, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import pdfplumber
import requests
import io
import os
import re
import transformers
import logging
from transformers import TFAutoModelForTokenClassification, AutoTokenizer, pipeline, TFRobertaForSequenceClassification, RobertaTokenizer
import tensorflow as tf
import ekstraktor
import warnings
import webbrowser
from threading import Timer
from typing import List, Tuple, Pattern

# Minimal log noise
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

# Hindari TensorFlow menggunakan semua thread CPU
tf.config.threading.set_intra_op_parallelism_threads(1)
tf.config.threading.set_inter_op_parallelism_threads(1)

# Hindari crash akibat alokasi memori besar
os.environ["TF_FORCE_GPU_ALLOW_GROWTH"] = "true"

app = Flask(__name__)
CORS(app)

transformers.logging.set_verbosity_error()
logging.getLogger('tensorflow').setLevel(logging.ERROR)
warnings.filterwarnings("ignore", category=ResourceWarning)

# Define the directory to save PDF files
SAVE_DIRECTORY = 'pdfFile'
os.makedirs(SAVE_DIRECTORY, exist_ok=True)

# Database configuration
print("Connecting to database...")
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://ananthayullian:1234@db:5432/classification_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# ==== regex dasar ====
ROMAN = r"[IVXLCDM]+"

NOMOR_REGEX = re.compile(
    rf"(?:Nomor(?:\s+Registrasi)?\s*[:;]?\s*)"
    rf"([0-9]{{2,4}}\s*/\s*{ROMAN}(?:\s*/\s*[A-Z-]+)*\s*/\s*\d{{4}}|[0-9A-Z/\-]{{6,}})",
    flags=re.IGNORECASE
)

# === label tegas & generik (tanpa duplikasi) ===
NAMA_PEMOHON_LABEL   = re.compile(r"(?mi)^\s*Nama\s+Pemohon\s*:\s*(\S.+)$")
NAMA_TERMOHON_STRICT = re.compile(r"(?mi)^\s*Nama\s+Termohon\s*:\s*(\S.+)$")
GENERIC_NAMA         = re.compile(r"(?mi)^\s*Nama\s*:\s*(\S.+)$")  # dipakai HANYA saat scanning per-blok

# === judul blok ===
PEMOHON_MARK     = re.compile(r"(?mi)^\s*PEMOHON\s*$")
TERMOHON_MARK    = re.compile(r"(?mi)^\s*TERMOHON\s*$")
TERHADAP_MELAWAN = re.compile(r"(?mi)^\s*(TERHADAP|MELAWAN)\b")

# --- stopwords tetap dipakai agar tidak menangkap kuasa/perwakilan ---
PEMOHON_STOP = re.compile(
    r"(?i)\b(Kuasa( Hukum)?|Advokat|Pengacara|Lawyer|Paralegal|Selaku|"
    r"yang bertindak untuk dan atas nama|bertindak untuk dan atas nama|"
    r"untuk dan atas nama|Perwakilan|Wali|Alamat|Berkedudukan di)\b"
)

# === narasi termohon ===
NARASI_TERMOHON = re.compile(
    r"(?is)(?:^|\n)\s*(?:Terhadap|Melawan)\s*:?\s*(.+?)"
    r"(?:\n\s*Selanjutnya\s+disebut\s+sebagai\s+Termohon\b|\n\s*TERMOHON\b|\n\s*PEMOHON\b|\n\n|$)"
)

# === kamus badan publik & penanda nama orang ===
ORG_HINT = re.compile(
    r"\b("
    r"PT\s+.*Persero|BUMN|BUMD|Perum|Perseroan|"
    r"Kementerian|Kemen\w+|Direktorat\s+Jenderal|Ditjen|Sekretariat|"
    r"Pemerintah|Pemprov|Pemkot|Pemkab|Provinsi|Kabupaten|Kota|Kecamatan|Kelurahan|"
    r"Komisi|Komisi\s+Informasi|Badan|Dinas|Inspektorat|Bappeda|BPN|BPJS|BPK|BPKP|"
    r"Kejaksaan|Kejari|Kejati|Kepolisian|Polri|TNI|Mahkamah|Pengadilan|"
    r"Universitas|Institut|Politeknik|Sekolah\s+Tinggi|"
    r"RSUD|Rumah\s+Sakit|Puskesmas|PDAM|PLN|Pertamina|Telkom"
    r")\b", re.IGNORECASE
)

PERSON_HINT = re.compile(
    r"\b(Dr\.?|Dra\.?|Ir\.?|H\.|Hj\.?|Bapak|Ibu|Sdr\.?|Sdri\.?)\b|"
    r"\b(S\.E\.|S\.H\.|S\.Kom\.?|S\.Si\.?|M\.H\.?|M\.Si\.?)\b",
    re.IGNORECASE
)
# header blok (kalau suatu saat ikut tercapture ke dalam blok)
HEADER_MARK = re.compile(r"(?mi)^\s*(PEMOHON|TERMOHON)\s*:?\s*$")

# perluas daftar label yang harus dilewati jika sendirian
LABEL_WORDS = {
    "nama", "nama pemohon", "nama termohon",  # ← tambahkan ini
    "alamat", "jabatan", "kuasa", "badan publik", "kedudukan hukum",
    "pemohon", "termohon"                     # ← dan ini (jaga-jaga)
}

# ==== util ====
def _normalize_text(s: str) -> str:
    if not s: return ""
    s = (s.replace("\xa0"," ").replace("\u00A0"," ").replace("\uf0b7"," ")
           .replace("•"," ").replace("●"," ").replace("：",":").replace("–","-").replace("—","-"))
    s = re.sub(r"(\w)-\n(\w)", r"\1\2", s)  # gabung kata terpotong
    s = s.replace("\r","")
    s = re.sub(r"[ \t]+", " ", s)
    s = re.sub(r"\s*:\s*", ": ", s)
    s = re.sub(r"\n{3,}", "\n\n", s)
    return s.strip()

def _clean_value(v: str) -> str:
    if not v: return ""
    v = v.strip(" .;,")
    # buang label yang ikut tercapture
    v = re.sub(r"(?i)^\s*Nama(?:\s+(Pemohon|Termohon))?\s*:?\s*", "", v).strip(" .;,")
    # buang “Selanjutnya disebut …”
    v = re.sub(r"(?is)\bSelanjutnya\s+disebut\s+sebagai\s+.*$", "", v).strip(" .;,")
    return re.sub(r"\s{2,}", " ", v)

def _extract_block(text: str, start_pat: Pattern, end_pats: List[Pattern]) -> str:
    m = start_pat.search(text)
    if not m: return ""
    start = m.end()
    ends = [ep.search(text, start).start() for ep in end_pats if ep.search(text, start)]
    end = min(ends) if ends else len(text)
    return text[start:end].strip()

def _first_nonlabel_line(block: str) -> str:
    for line in block.splitlines():
        if HEADER_MARK.match(line):        # ← lewati "PEMOHON"/"TERMOHON"
            continue
        L = _clean_value(line)
        if not L: 
            continue
        if L.lower() in LABEL_WORDS:       # ← lewati "nama", "pemohon", dst (tanpa isi)
            continue
        if re.match(r"(?i)^\s*Nama(?:\s+(Pemohon|Termohon))?\s*:?\s*$", line.strip()):
            continue
        return L
    return ""

def _pick_pemohon_line(block: str) -> str:
    for line in block.splitlines():
        if HEADER_MARK.match(line):        # ← lewati header blok
            continue
        L = _clean_value(line)
        if not L:
            continue
        if L.lower() in LABEL_WORDS:       # ← lewati label sendirian
            continue
        if re.match(r"(?i)^\s*Nama(?:\s+(Pemohon|Termohon))?\s*:?\s*$", line.strip()):
            continue
        if PEMOHON_STOP.search(L):
            continue
        return L
    return ""

def _pick_public_body_line(snippet: str) -> str:
    # cari baris “instansi” (bukan nama orang)
    for line in snippet.splitlines():
        L = _clean_value(line)
        if L and ORG_HINT.search(L) and not PERSON_HINT.search(L):
            return L
    # berikutnya: baris pertama yang bukan nama orang
    for line in snippet.splitlines():
        L = _clean_value(line)
        if L and not PERSON_HINT.search(L):
            return L
    # fallback
    return _first_nonlabel_line(snippet)

def _first_group(regex: Pattern, s: str) -> str:
    m = regex.search(s)
    return _clean_value(m.group(1)) if m else ""

# === scanner “Nama:” generik berbasis blok ===
def _scan_generic_nama_by_block(text: str) -> Tuple[str, str]:
    pemohon, termohon = "", ""
    current = None
    for raw in text.splitlines():
        line = raw.strip()
        if PEMOHON_MARK.match(line):  current = 'PEMOHON';  continue
        if TERMOHON_MARK.match(line): current = 'TERMOHON'; continue
        if not current:               continue

        m = GENERIC_NAMA.match(raw)
        if not m: continue
        val = _clean_value(m.group(1))
        if not val: continue

        if current == 'PEMOHON' and not pemohon:
            pemohon = val  # ← TIDAK difilter org/person
            continue
        if current == 'TERMOHON' and not termohon:
            # tetap wajib badan publik
            termohon = _pick_public_body_line(val)
    return _clean_value(pemohon), _clean_value(termohon)


# ==== ekstraksi field utama ====
def _extract_nomor(text: str) -> str:
    m = NOMOR_REGEX.search(text)
    if not m: return ""
    nomor = re.sub(r"\s+", "", m.group(1))
    return re.sub(r"[.;,]+$", "", nomor)

def _extract_pemohon_termohon(text: str) -> Tuple[str, str]:
    # 0) label spesifik global
    pemohon  = _first_group(NAMA_PEMOHON_LABEL,   text)
    termohon = _first_group(NAMA_TERMOHON_STRICT, text)

    # 1) “Nama:” generik tapi HANYA jika berada di dalam blok
    if not pemohon or not termohon:
        p2, t2 = _scan_generic_nama_by_block(text)
        if not pemohon and p2:   pemohon = p2
        if not termohon and t2:  termohon = t2

    # 2) blok PEMOHON / TERMOHON (tanpa label)
    if not pemohon:
        pb = _extract_block(text, PEMOHON_MARK, [TERHADAP_MELAWAN, TERMOHON_MARK])
        if pb:
            pemohon = _pick_pemohon_line(pb)  # ← menerima orang ATAU organisasi
    if not termohon:
        tb = _extract_block(text, TERMOHON_MARK, [PEMOHON_MARK, TERHADAP_MELAWAN])
        if tb:
            termohon = _pick_public_body_line(tb)

    # 3) narasi TERHADAP/MELAWAN … (Termohon) & “diajukan oleh …” (Pemohon)
    if not termohon:
        m = NARASI_TERMOHON.search(text)
        if m:
            termohon = _pick_public_body_line(m.group(1))
    if not pemohon:
        m = re.search(r"(?is)diajukan\s+oleh\s*:?\s*(.+?)(?:\bSelanjutnya\b|\bPemohon\b|\n\n|$)", text)
        if m:
            pemohon = _clean_value(m.group(1).splitlines()[0])

    # 4) kebersihan akhir & aturan KIP
    pemohon  = _clean_value(pemohon)
    termohon = _clean_value(termohon)

    # Termohon tak boleh nama orang
    if termohon and PERSON_HINT.search(termohon):
        termohon = ""
    # Anti-dobel
    if pemohon and termohon and pemohon.lower() == termohon.lower():
        termohon = ""

    return pemohon, termohon

# Define the ClassificationResult model
class ClassificationResult(db.Model):
    __tablename__ = 'classification_result'
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    predicted_category = db.Column(db.Text, nullable=True)
    corrected_category = db.Column(db.Text, nullable=True)
    validated_category = db.Column(db.Text, nullable=True)

print("Database connected successfully...")

# Define the paths for saving/loading
ner_model_path = "pretrainedModel/BERT"
ner_tokenizer_path = "pretrainedModel/BERT"
classification_model_path = "pretrainedModel/ROBERTA"
classification_tokenizer_path = "pretrainedModel/ROBERTA"

# NER model setup
print("Loading NER model...")
id2label = {0: 'B-CRD', 1: 'B-DAT', 2: 'B-EVT', 3: 'B-FAC', 4: 'B-GPE', 5: 'B-LAN', 6: 'B-LAW', 7: 'B-LOC', 8: 'B-MON', 9: 'B-NOR', 10: 'B-ORD', 11: 'B-ORG', 12: 'B-PER', 13: 'B-PRC', 14: 'B-PRD', 15: 'B-QTY', 16: 'B-REG', 17: 'B-TIM', 18: 'B-WOA', 19: 'I-CRD', 20: 'I-DAT', 21: 'I-EVT', 22: 'I-FAC', 23: 'I-GPE', 24: 'I-LAN', 25: 'I-LAW', 26: 'I-LOC', 27: 'I-MON', 28: 'I-NOR', 29: 'I-ORD', 30: 'I-ORG', 31: 'I-PER', 32: 'I-PRC', 33: 'I-PRD', 34: 'I-QTY', 35: 'I-REG', 36: 'I-TIM', 37: 'I-WOA', 38: 'O'}
label2id = {v: k for k, v in id2label.items()}

# Load or save the NER model and tokenizer
try:
    verificationModel = TFAutoModelForTokenClassification.from_pretrained(ner_model_path, num_labels=39, id2label=id2label, label2id=label2id)
    tokenizer = AutoTokenizer.from_pretrained(ner_tokenizer_path)
    print("NER model loaded successfully from local storage.")
except:
    pretrainedBert = 'indolem/indobert-base-uncased'
    verificationModel = TFAutoModelForTokenClassification.from_pretrained(pretrainedBert, num_labels=39, id2label=id2label, label2id=label2id, from_pt=True)
    tokenizer = AutoTokenizer.from_pretrained(pretrainedBert)
    verificationModel.save_pretrained(ner_model_path)
    tokenizer.save_pretrained(ner_tokenizer_path)
    print("NER model downloaded and saved locally.")

verificationModel.load_weights("NER-INDO/INDO-NER-weights")

# NER pipeline (lazy init biar nggak duplikasi & ringan)
ner_pipeline = None
def get_ner():
    global ner_pipeline
    if ner_pipeline is None:
        # grouped_entities=True biar output lebih rapi ke ekstraktor
        try:
            from transformers import pipeline
            ner_pipeline = pipeline("ner", tokenizer=tokenizer, model=verificationModel, grouped_entities=True)
        except Exception:
            ner_pipeline = None
    return ner_pipeline


# Classification model setup
print("Loading classification model...")
try:
    recomendationModel = TFRobertaForSequenceClassification.from_pretrained(classification_model_path, num_labels=13)
    roberta_tokenizer = RobertaTokenizer.from_pretrained(classification_tokenizer_path)
    print("Classification model loaded successfully from local storage.")
except:
    pretrainedRoberta = 'cahya/roberta-base-indonesian-522M'
    recomendationModel = TFRobertaForSequenceClassification.from_pretrained(pretrainedRoberta, num_labels=13)
    roberta_tokenizer = RobertaTokenizer.from_pretrained(pretrainedRoberta)
    recomendationModel.save_pretrained(classification_model_path)
    roberta_tokenizer.save_pretrained(classification_tokenizer_path)
    print("Classification model downloaded and saved locally.")

recomendationModel.load_weights('SavedWeight/Roberta Weight Run 4.1')

category_mapping = {
    0: {"category": "Kategori 1", "detail_category":"Pasal 9 ayat (2) UU Nomor 14 Tahun 2008", "pasal": "Informasi yang Wajib Disediakan dan Diumumkan Secara Berkala", "informasi": "INFORMASI YANG WAJIB DISEDIAKAN DAN DIUMUMKAN"},
    1: {"category": "Kategori 10", "detail_category":"Pasal 17 poin g UU Nomor 14 Tahun 2008", "pasal": "Informasi Publik yang apabila dibuka dapat mengungkapkan isi akta otentik yang bersifat pribadi dan kemauan terakhir ataupun wasiat seseorang", "informasi": "INFORMASI YANG DIKECUALIKAN"},
    2: {"category": "Kategori 11", "detail_category":"Pasal 17 poin h UU Nomor 14 Tahun 2008", "pasal": "Informasi Publik yang apabila dibuka dan diberikan kepada Pemohon Informasi Publik dapat mengungkap rahasia pribadi", "informasi": "INFORMASI YANG DIKECUALIKAN"},
    3: {"category": "Kategori 12", "detail_category":"Pasal 17 poin i UU Nomor 14 Tahun 2008", "pasal": "Memorandum atau surat-surat antar Badan Publik atau intra Badan Publik, yang menurut sifatnya dirahasiakan kecuali atas putusan Komisi Informasi atau pengadilan", "informasi": "INFORMASI YANG DIKECUALIKAN"},
    4: {"category": "Kategori 13", "detail_category":"Pasal 17 poin j UU Nomor 14 Tahun 2008", "pasal": "Informasi yang tidak boleh diungkapkan berdasarkan Undang-Undang", "informasi": "INFORMASI YANG DIKECUALIKAN"},
    5: {"category": "Kategori 2", "detail_category":"Pasal 10 ayat (1) UU Nomor 14 Tahun 2008", "pasal": "Informasi yang Wajib Diumumkan secara Serta-merta", "informasi": "INFORMASI YANG WAJIB DISEDIAKAN DAN DIUMUMKAN"},
    6: {"category": "Kategori 3", "detail_category":"Pasal 11 ayat (1) UU Nomor 14 Tahun 2008", "pasal": "Informasi yang Wajib Tersedia Setiap Saat", "informasi": "INFORMASI YANG WAJIB DISEDIAKAN DAN DIUMUMKAN"},
    7: {"category": "Kategori 4", "detail_category":"Pasal 17 poin a UU Nomor 14 Tahun 2008", "pasal": "Informasi Publik yang apabila dibuka dan diberikan kepada Pemohon Informasi Publik dapat menghambat proses penegakan hukum", "informasi": "INFORMASI YANG DIKECUALIKAN"},
    8: {"category": "Kategori 5", "detail_category":"Pasal 17 poin b UU Nomor 14 Tahun 2008", "pasal": "Informasi Publik yang apabila dibuka dan diberikan kepada Pemohon Informasi Publik dapat mengganggu kepentingan perlindungan hak atas kekayaan intelektual dan perlindungan dari persaingan usaha tidak sehat", "informasi": "INFORMASI YANG DIKECUALIKAN"},
    9: {"category": "Kategori 6", "detail_category":"Pasal 17 poin c UU Nomor 14 Tahun 2008", "pasal": "Informasi Publik yang apabila dibuka dan diberikan kepada Pemohon Informasi Publik dapat membahayakan pertahanan dan keamanan negara", "informasi": "INFORMASI YANG DIKECUALIKAN"},
    10: {"category": "Kategori 7", "detail_category":"Pasal 17 poin d UU Nomor 14 Tahun 2008", "pasal": "Informasi Publik yang apabila dibuka dan diberikan kepada Pemohon Informasi Publik dapat mengungkapkan kekayaan alam Indonesia", "informasi": "INFORMASI YANG DIKECUALIKAN"},
    11: {"category": "Kategori 8", "detail_category":"Pasal 17 poin e UU Nomor 14 Tahun 2008", "pasal": "Informasi Publik yang apabila dibuka dan diberikan kepada Pemohon Informasi Publik, dapat merugikan ketahanan ekonomi nasional", "informasi": "INFORMASI YANG DIKECUALIKAN"},
    12: {"category": "Kategori 9", "detail_category":"Pasal 17 poin f UU Nomor 14 Tahun 2008", "pasal": "Informasi Publik yang apabila dibuka dan diberikan kepada Pemohon Informasi Publik, dapat merugikan kepentingan hubungan luar negeri", "informasi": "INFORMASI YANG DIKECUALIKAN"}
}

with app.app_context():
    db.create_all()

def classify_texts(kalimat):
    inputs = roberta_tokenizer(kalimat, padding=True, truncation=True, return_tensors="tf")
    outputs = recomendationModel(inputs.data)
    predictions = tf.nn.softmax(outputs.logits, axis=-1)
    predicted_classes = tf.argmax(predictions, axis=1).numpy()
    predicted_categories = [category_mapping[pred]['category'] for pred in predicted_classes]
    predicted_detail_categories = [category_mapping[pred]['detail_category'] for pred in predicted_classes]
    predicted_pasals = [category_mapping[pred]['pasal'] for pred in predicted_classes]
    predicted_informasi = [category_mapping[pred]['informasi'] for pred in predicted_classes]
    return predicted_categories, predicted_detail_categories, predicted_pasals, predicted_informasi, predictions.numpy()

# Route for serving the index.html
@app.route('/')
@app.route('/index')
def index():
    print("Index route accessed")
    return render_template('index.html')

# Additional routes for serving other HTML files
@app.route('/validasi-data')
def validasi():
    return render_template('validasi.html')

@app.route('/verifikasi-dokumen')
def verifikasi():
    return render_template('verifikasi.html')

# API to get all validation data
@app.route('/api/validasi-data', methods=['GET'])
def api_validasi_data():
    results = ClassificationResult.query.filter(
        ClassificationResult.corrected_category.isnot(None),
        ClassificationResult.validated_category.is_(None)
    ).all()
    result_data = [
        {
            "id": result.id,
            "text": result.text,
            "corrected_category": result.corrected_category
        }
        for result in results
    ]
    return jsonify(result_data)

# ===== API untuk ekstraksi nomor, pemohon, termohon (tanpa OCR) =====
@app.route('/api/extract', methods=['POST'])
def api_extract_text():
    if 'pdf_file' not in request.files:
        return jsonify({'error': 'No file in request!'}), 400

    pdf_file = request.files['pdf_file']
    if not pdf_file.filename:
        return jsonify({'error': 'No file selected!'}), 400
    if not pdf_file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'File is not a PDF!'}), 400

    pdf_bytes = pdf_file.read()

    # Baca teks dari beberapa halaman awal (tanpa OCR)
    text = ""
    try:
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            pages = min(6, len(pdf.pages))  # banyak putusan: identitas di 1–3
            for i in range(pages):
                t = pdf.pages[i].extract_text() or ""
                text += t + "\n"
    except Exception:
        text = ""

    if not text.strip():
        # Tetap 200 agar front-end bisa bedakan "image-only" case tanpa exception
        return jsonify({'error': 'PDF contains no extractable text (probably image-only).'}), 200

    raw_text = text
    text = _normalize_text(text)

    nomor = _extract_nomor(text) or "Not found"
    pemohon_name, termohon_name = _extract_pemohon_termohon(text)

    # === OPTIONAL: gunakan NER + ekstraktor kamu untuk "polishing" ===
    # Hanya dijalankan kalau pipeline siap; kalau tidak, hasil regex sudah cukup.
    try:
        ner = get_ner()
        if ner and pemohon_name:
            pemohon_entities = ner(pemohon_name)
            # ekstraktor.py milikmu: menerima output pipeline untuk ekstraksi tipe entitas
            try:
                names = ekstraktor.extract_names(pemohon_entities)
                if names:
                    pemohon_name = " ".join(names)
            except Exception:
                pass

        if ner and termohon_name:
            termohon_entities = ner(termohon_name)
            try:
                orgs = ekstraktor.extract_organization(termohon_entities)
                if orgs:
                    termohon_name = " ".join(orgs)
            except Exception:
                pass
    except Exception:
        # kalau NER/ekstraktor gagal, hasil regex tetap dipakai
        pass

    return jsonify({
        'Nomor': nomor,
        'Pemohon': pemohon_name or "Not found",
        'Termohon': termohon_name or "Not found",
        'debug': {
            'raw_len': len(raw_text),
            'normalized_len': len(text)
        }
    }), 200

# API to classify text
@app.route('/api/classify', methods=['POST'])
def classify():
    data = request.json
    text = data.get('text')
    predicted_categories, predicted_detail_categories, predicted_pasals, predicted_informasi, _ = classify_texts([text])
    
    result = {
        "text": text,
        "predicted_category": predicted_categories[0],
        "predicted_detail_category": predicted_detail_categories[0],
        "predicted_pasal": predicted_pasals[0],
        "informasi": predicted_informasi[0]
    }
    
    return jsonify(result)

# API to confirm classification
@app.route('/api/confirm', methods=['POST'])
def api_confirm():
    data = request.json
    text = data.get('text')
    predicted_category = data.get('predicted_category')

    classification_result = ClassificationResult(
        text=text,
        predicted_category=predicted_category
    )
    db.session.add(classification_result)
    db.session.commit()

    return jsonify({"message": "Classification confirmed and saved successfully!"})

# API to correct classification
@app.route('/api/correct', methods=['POST'])
def api_correct():
    data = request.json
    text = data.get('text')
    corrected_category_index = int(data.get('corrected_category'))
    corrected_category = category_mapping[corrected_category_index]['category']

    classification_result = ClassificationResult(
        text=text,
        corrected_category=corrected_category
    )
    db.session.add(classification_result)
    db.session.commit()

    return jsonify({"message": "Correction saved successfully!"})

# API to validate corrected data
@app.route('/api/validate', methods=['POST'])
def api_validate():
    for item_id, validated_category in request.form.items():
        result = ClassificationResult.query.get(item_id)
        if result:
            result.validated_category = validated_category
            db.session.commit()
    return jsonify({"message": "Validation successful!"})

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=3001)
