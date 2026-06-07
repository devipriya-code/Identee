import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

let gfsBucket;

export const initGridFS = () => {
  const db = mongoose.connection.db;
  gfsBucket = new GridFSBucket(db, {
    bucketName: "videos",
  });
};

export const getGridFSBucket = () => gfsBucket;
