import mongoose from "mongoose";
import { Readable } from "stream";

const getCVBucket = () => {
  if (!mongoose.connection.db) {
    throw new Error("MongoDB is not connected");
  }

  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "cvs",
  });
};

export const uploadCVToGridFS = async (file, userId) => {
  return new Promise((resolve, reject) => {
    const bucket = getCVBucket();

    const uniqueFilename = `${Date.now()}-${file.originalname}`;

    const uploadStream = bucket.openUploadStream(uniqueFilename, {
      contentType: file.mimetype,
      metadata: {
        userId,
        originalName: file.originalname,
      },
    });

    const readableStream = Readable.from(file.buffer);

    readableStream
      .pipe(uploadStream)
      .on("error", (error) => {
        reject(error);
      })
      .on("finish", () => {
        resolve({
          fileId: uploadStream.id,
          filename: uniqueFilename,
          originalName: file.originalname,
          contentType: file.mimetype,
          size: file.size,
        });
      });
  });
};

export const deleteCVFromGridFS = async (fileId) => {
  const bucket = getCVBucket();

  await bucket.delete(new mongoose.Types.ObjectId(fileId));
};

export const getCVDownloadStream = (fileId) => {
  const bucket = getCVBucket();

  return bucket.openDownloadStream(
    new mongoose.Types.ObjectId(fileId)
  );
};