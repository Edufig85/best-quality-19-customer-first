
import express from "express";
import cors from "cors";
import multer from "multer";
import * as XLSX from "xlsx";
import pkg from "pg";

const { Pool } = pkg;
const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const upload = multer({ storage: multer.memoryStorage() });

app.get("/", (req, res) => res.send("API BQ19 ATIVA"));

app.post("/import-users", upload.single("file"), async (req, res) => {
  const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);
  let count = 0;
  for (const r of rows) {
    if (!r.cpf || !r.nome) continue;
    await pool.query(
      "INSERT INTO users (cpf,nome) VALUES ($1,$2) ON CONFLICT (cpf) DO NOTHING",
      [r.cpf, r.nome]
    );
    count++;
  }
  res.json({ users_created: count });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log("API BQ19 NA PORTA", PORT));
