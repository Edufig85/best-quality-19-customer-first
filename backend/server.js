import express from "express";
import cors from "cors";
import multer from "multer";
import * as XLSX from "xlsx";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";

/* ===============================
   APP (PRIMEIRO DE TUDO)
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
   MULTER (MEMÓRIA)
   =============================== */
const upload = multer({
  storage: multer.memoryStorage(),
});

/* ===============================
   BANCO DE DADOS
   =============================== */
const db = new Database("bq19.db");

db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cpf TEXT UNIQUE,
    nome TEXT,
    password TEXT,
    must_change_password INTEGER DEFAULT 1
  )
`).run();

const DEFAULT_PASSWORD = "BQ19@2026";

/* ===============================
   ROTAS
   =============================== */

app.get("/", (req, res) => {
  res.send("API BQ19 ATIVA");
});

app.post("/admin/import-users", upload.single("file"), (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "Arquivo não recebido" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    const exists = db.prepare("SELECT id FROM users WHERE cpf = ?");
    const insert = db.prepare(
      "INSERT INTO users (cpf, nome, password) VALUES (?, ?, ?)"
    );

    let created = 0;

    rows.forEach((row) => {
      const cpf = String(row.CPF || row.cpf || "")
        .replace(/\D/g, "")
        .trim();
      const nome = String(row.Nome || row.nome || "").trim();

      if (cpf.length === 11 && nome) {
        if (!exists.get(cpf)) {
          insert.run(
            cpf,
            nome,
            bcrypt.hashSync(DEFAULT_PASSWORD, 10)
          );
          created++;
        }
      }
    });

    res.json({ users_created: created });
  } catch (err) {
    console.error("ERRO IMPORT:", err);
    res.status(500).json({ error: "Erro ao importar usuários" });
  }
});

app.post("/login", (req, res) => {
  try {
    let { cpf, password } = req.body;

    cpf = String(cpf || "").replace(/\D/g, "").trim();

    const user = db
      .prepare("SELECT * FROM users WHERE cpf = ?")
      .get(cpf);

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "CPF ou senha inválidos" });
    }

    res.json({
      must_change_password: user.must_change_password === 1,
    });
  } catch (err) {
    console.error("ERRO LOGIN:", err);
    res.status(500).json({ error: "Erro interno" });
  }
});

/* ===============================
   START
   =============================== */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("Backend BQ19 rodando na porta", PORT);
});
