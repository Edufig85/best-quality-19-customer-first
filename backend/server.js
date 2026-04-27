import express from "express";
import cors from "cors";
import multer from "multer";
import * as XLSX from "xlsx";
import bcrypt from "bcryptjs";
import pkg from "pg";

const { Pool } = pkg;

/* ===============================
   APP
=============================== */
const app = express();

/* ===============================
   MIDDLEWARE
=============================== */
app.use(cors({
  origin: "https://best-quality-19-customer-first.vercel.app",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));

app.use(express.json());

/* ===============================
   POSTGRES (NEON)
=============================== */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

/* ===============================
