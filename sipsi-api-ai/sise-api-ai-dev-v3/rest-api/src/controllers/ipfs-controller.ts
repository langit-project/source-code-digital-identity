import { Request, Response } from "express";
import { Client } from "../services/ipfs-service";

export const addFileToIPFS = async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send("File is required");
  }
  const ipfsResponse = await Client.add(file);
  if (ipfsResponse) {
    res.json(ipfsResponse);
  } else {
    res.status(500).send("Error uploading file to IPFS");
  }
};

export const getFileFromIPFS = async (req: Request, res: Response) => {
  const { cid } = req.params;
  if (!cid) {
    return res.status(400).send("CID is required");
  }
  try {
    // Ambil metadata menggunakan hash metadata
    const metadata = await Client.getMetadata(cid);
    if (!metadata || !metadata.fileHash) {
      return res.status(404).send("Metadata not found or invalid");
    }

    // Ambil file asli menggunakan hash file dari metadata
    const fileResponse = await Client.cat(metadata.fileHash);
    if (fileResponse) {
      const filename = `${metadata.name}${metadata.extension}`;
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Type", metadata.mimetype || "application/octet-stream");
      res.type("application/octet-stream"); // Set response type to binary
      res.end(Buffer.from(fileResponse)); // Ensure response is sent as a buffer
    } else {
      res.status(404).send("File not found");
    }
  } catch (error) {
    console.error("Error retrieving file from IPFS:", error); // Log the error
    res.status(500).send("Error retrieving file from IPFS");
  }
};
