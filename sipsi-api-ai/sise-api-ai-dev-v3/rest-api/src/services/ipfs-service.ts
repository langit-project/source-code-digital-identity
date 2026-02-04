import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { IPFSResponse } from "../models/ipfs-model";

const metadataFile = path.join(__dirname, 'metadata.json');

export class Client {
  static async add(file: Express.Multer.File): Promise<{ fileHash: string, metadataHash: string } | null> {
    const form = new FormData();
    form.append("file", fs.createReadStream(file.path), file.originalname);

    const headers = form.getHeaders();
    try {
      // Upload file to IPFS
      const fileResponse = await axios.post("http://ipfs-cluster1:9094/add", form, {
        headers,
        timeout: 5000,
      });
      const ipfsFileResponse = fileResponse.data as IPFSResponse;

      // Log the response for debugging
      console.log("IPFS File Response:", ipfsFileResponse);

      // Adjusted to check for 'cid' field
      const fileHash = ipfsFileResponse.cid
      if (!fileHash) {
        throw new Error("Invalid IPFS response for file");
      }

      // Create and upload metadata
      const metadata = {
        name: path.parse(file.originalname).name,
        mimetype: file.mimetype,
        size: file.size,
        extension: path.parse(file.originalname).ext,
        fileHash: fileHash
      };
      fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));

      const metadataForm = new FormData();
      metadataForm.append("file", fs.createReadStream(metadataFile), "metadata.json");

      const metadataResponse = await axios.post("http://ipfs-cluster1:9094/add", metadataForm, {
        headers: metadataForm.getHeaders(),
        timeout: 5000,
      });
      const ipfsMetadataResponse = metadataResponse.data as IPFSResponse;

      // Log the response for debugging
      console.log("IPFS Metadata Response:", ipfsMetadataResponse);

      // Adjusted to check for 'cid' field
      const metadataHash = ipfsMetadataResponse.cid;
      if (!metadataHash) {
        throw new Error("Invalid IPFS response for metadata");
      }

      return { fileHash: fileHash, metadataHash: metadataHash };
    } catch (error) {
      console.error("Error uploading file to IPFS:", error);
      return null;
    }
  }

  static async cat(cid: string): Promise<ArrayBuffer | undefined> {
    try {
      const response = await axios.post(
        `http://ipfs-node1:5001/api/v0/cat?arg=${cid}`,
        null,
        {
          responseType: "arraybuffer",
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error retrieving file from IPFS:", error);
      throw error;
    }
  }
  
  static async getMetadata(cid: string): Promise<any> {
    try {
      const response = await axios.post(
        `http://ipfs-node1:5001/api/v0/cat?arg=${cid}`,
        null,
        {
          responseType: "json",
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error retrieving metadata from IPFS:", error);
      throw error;
    }
  }
}
