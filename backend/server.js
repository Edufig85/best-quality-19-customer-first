import express from "express";
import cors from "cors";
import multer from "multer";
import * as XLSX from "xlsx";
import pkg from "pg";
import bcrypt from "bcryptjs";

/* =========================
   APP
========================= */

const app = express();
app.use(cors());
app.use(express.json());

/* =========================
   DATABASE
========================= */

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

/* =========================
   UPLOAD
========================= */

const upload = multer({
  storage: multer.memoryStorage(),
});

/* =========================
   HEALTHCHECK
========================= */

app.get("/", (req, res) => {
  res.send("API BQ19 ATIVA");
});

/* =========================
   IMPORT USERS
========================= */

app.post("/import-users", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Arquivo não enviado" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    let created = 0;
    const passwordHash = await bcrypt.hash("123456", 10);

    for (const rawRow of rawRows) {
      const row = {};
      for (const key in rawRow) {
        const normalizedKey = key
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, "");

        row[normalizedKey] = rawRow[key];
      }

      const cpf = String(
        row.cpf || row.documento || ""
      ).replace(/\D/g, "");

      const nome = String(
        row.nome || row.nomecompleto || row.colaborador || ""
      ).trim();

      if (!cpf || !nome) continue;

      const result = await pool.query(
        `
        INSERT INTO users (cpf, nome, password)
