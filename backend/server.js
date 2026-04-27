import express from "express";
import cors from "cors";
import multer from "multer";
import * as XLSX from "xlsx";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";

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
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

/* ===============================
   MULTER (MEMÓRIA)
   =============================== */
const upload = multer({
  storage: multer.memoryStorage()
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

app.post("/login", (req, res) => {
  try {
    const { cpf, password } = req.body;

    if (!cpf || !password) {
      return res.status(400).json({ error: "CPF e senha obrigatórios" });
    }

    const user = db
      .prepare("SELECT * FROM users WHERE cpf = ?")
      .get(cpf);

    if (!user) {
      return res.status(401).json({ error: "CPF ou senha inválidos" });
    }

    const senhaOk = bcrypt.compareSync(password, user.password);

    if (!senhaOk) {
      return res.status(401).json({ error: "CPF ou senha inválidos" });
    }

    return res.json({
      must_change_password: user.must_change_password === 1
    });
  } catch (err) {
    console.error("ERRO NO LOGIN:", err);
    return res.status(500).json({ error: "Erro interno no login" });
  }
});
/* ===============================
   START
   =============================== */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("Backend BQ19 rodando na porta", PORT);
});
``
