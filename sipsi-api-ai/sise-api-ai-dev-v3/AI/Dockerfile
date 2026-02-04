# Use the official Python image from the Docker Hub
FROM python:3.8

# ===== Maintainability: env standar Python & pip =====
# - Non-buffered log, tanpa bytecode .pyc, pip tanpa cache untuk layer yang bersih.
# - PIP_DEFAULT_TIMEOUT & mirror standar (boleh ganti ke internal mirror kalau punya).
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DEFAULT_TIMEOUT=100 \
    PIP_INDEX_URL=https://pypi.org/simple

# Direktori kerja
WORKDIR /app

# ===== Layer cache-friendly =====
# Salin requirements lebih dulu agar build cepat saat source code berubah (pip tak perlu re-run kalau req tak berubah).
COPY requirements.txt /app/requirements.txt

# ===== Dependensi OS minimal =====
# Perubahan utama:
# - HAPUS paket python3-* (sudah ada di image Python).
# - TAMBAH libpq5 + libpq-dev (stabil untuk psycopg2/Postgres).
# - Pakai --no-install-recommends agar image ramping.
# - Bersihkan cache apt agar layer kecil.
# build-essential = toolchain utk build wheel; nanti di-purge
# gcc = compiler; nanti di-purge
# libpq5 = runtime lib PostgreSQL (psycopg2)
# libpq-dev = header PostgreSQL saat build; nanti di-purge
# libhdf5-dev = hdf5 stack (sesuai aslinya)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    libpq5 \
    libpq-dev \
    libhdf5-dev \
    libhdf5-serial-dev \
    hdf5-tools \
    libssl-dev \
    libffi-dev \
 && rm -rf /var/lib/apt/lists/*

# ===== Install Python deps =====
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ===== Slim-down setelah build =====
# Perubahan utama:
# - PURGE toolchain (build-essential, gcc, libpq-dev) setelah pip install → image lebih kecil & permukaan serangan berkurang.
RUN apt-get purge -y build-essential gcc libpq-dev && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*

# ===== Salin source code =====
# Catatan maintainability:
# - Kalau di docker-compose kamu sudah mount volume ./AI:/app,
#   step COPY ini akan “tertindih” saat runtime (bagus untuk dev).
# - Kalau ingin image jauh lebih kecil, PERTIMBANGKAN untuk TIDAK menyalin folder model besar
#   dan mengandalkan volume (lihat contoh di bawah).
COPY . /app

# (OPSIONAL) Jika ingin menghindari duplikasi layer besar:
# # COPY hanya kode, BUKAN model (karena dimount via volume):
# # COPY app.py ekstraktor.py ... /app/
# # (biarkan pretrainedModel/NER-INDO/ SavedWeight di-mount oleh compose)

# ===== Port & Env =====
# FLASK_ENV=development -> dev mode; untuk production lihat CMD alternatif di bawah
# EXPOSE 3001

# Define environment variable
# ENV FLASK_APP=app.py \
#     FLASK_RUN_HOST=0.0.0.0 \
#     FLASK_RUN_PORT=3001 \
#     FLASK_ENV=development \
#     FLASK_DEBUG=1

# ===== Run command (dev) =====
# CMD ["python", "-m", "flask", "run", "--host=0.0.0.0", "--port=3001"]
# Dev, tanpa redundansi ENV
# CMD ["flask", "--app", "app:app", "run", "--debug", "--host=0.0.0.0", "--port=3001"]

# ===== (PRODUCTION READY) alternatif CMD =====
# Rekomendasi saat nanti pindah ke produksi:
#  - Gunakan Gunicorn multi-worker agar lebih stabil, bukan flask dev server.
#  - Buka dua baris di bawah dan comment baris CMD "flask run" di atas.
RUN pip install --no-cache-dir gunicorn
EXPOSE 3001
CMD ["gunicorn", "--bind", "0.0.0.0:3001", "--workers", "2", "--threads", "2", "--timeout", "120", "app:app"]
