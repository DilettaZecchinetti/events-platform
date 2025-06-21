// import dotenv from "dotenv";
// dotenv.config();
// import { fileURLToPath } from "url";
// import { dirname } from "path";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
// console.log("JWT_SECRET:", process.env.JWT_SECRET ? "defined" : "undefined");
// console.log("MONGO_URI:", process.env.MONGO_URI ? "defined" : "undefined");

// export const MONGO_URI = process.env.MONGO_URI;

// if (!MONGO_URI) {
//   throw new Error("MONGO_URI is not defined in environment variables");
// }
// // dotenv.config({ path: `${__dirname}/.env` });

// export const JWT_SECRET = process.env.JWT_SECRET;
// export const PORT = process.env.PORT || 5000;

// config.js

import dotenv from "dotenv";
dotenv.config();

console.log("=== CONFIG.JS ===");
console.log("MONGO_URI:", process.env.MONGO_URI ? "defined" : "undefined");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "defined" : "undefined");

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const MONGO_URI = process.env.MONGO_URI;
export const JWT_SECRET = process.env.JWT_SECRET;
export const PORT = process.env.PORT || 5000;

if (!MONGO_URI) {
  throw new Error("MONGO_URI is not defined in environment variables");
}

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}
