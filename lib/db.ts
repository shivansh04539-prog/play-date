import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("Please define the MONGO_URI environment variable");
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  const start = Date.now();

  if (cached.conn) {
    console.log("⚡ DB: Using existing connection (Fast)");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("🚀 DB: Establishing new connection...");
    cached.promise = mongoose
      .connect(MONGO_URI!, {
        dbName: "Tictak",
        bufferCommands: false,
      })
      .then((mongoose) => {
        console.log(`✅ DB: Connected in ${Date.now() - start}ms`);
        return mongoose;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("❌ DB: Connection Error:", e);
    throw e;
  }

  return cached.conn;
}
