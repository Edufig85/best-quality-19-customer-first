import express from "express";
import cors from "cors";
import multer from "multer";
import * as XLSX from "xlsx";
import bcrypt from "bcryptjs";
import pkg from "pg";

const { Pool } = pkg;
const app = express();

/* ===================== MIDDLEWARE ===================== */
app.use(cors({
  origin: "https://best-quality-19-customer-first.vercel.app",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));
app.use(express.json());

/* ===================== DATABASE ===================== */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function initDB()
CREATE TABLE IF NOT EXISTS user_badges (
  id SERIAL PRIMARY KEY,
  cpf TEXT,
  categoria TEXT,
  badge TEXT,
  ano INTEGER,
  mes INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
{
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      cpf TEXT UNIQUE,
      nome TEXT,
      password TEXT,
      must_change_password BOOLEAN DEFAULT TRUE
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ranking_results (
      id SERIAL PRIMARY KEY,
      cpf TEXT,
      nome TEXT,
      categoria TEXT,
      pontos INTEGER,
      ano INTEGER,
      mes INTEGER,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
}
initDB();

/* ===================== LOGIN ===================== */
app.post("/login", async (req, res) => {
  let { cpf, password } = req.body;
  cpf = String(cpf || "").replace(/\D/g, "");

  const result = await pool.query(
    "SELECT cpf, nome, password, must_change_password FROM users WHERE cpf=$1",
    [cpf]
  );
  const user = result.rows[0];

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "CPF ou senha inválidos" });
  }

  res.json({
    must_change_password: user.must_change_password,
    nome: user.nome
  });
});

/* ===================== CHANGE PASSWORD ===================== */
app.post("/change-password", async (req, res) => {
  const { cpf, newPassword } = req.body;
  const hash = bcrypt.hashSync(newPassword, 10);

  await pool.query(
    "UPDATE users SET password=$1, must_change_password=false WHERE cpf=$2",
    [hash, cpf]
  );
  res.json({ ok: true });
});

/* ===================== ADMIN UPLOAD RANKING ===================== */
const upload = multer({ storage: multer.memoryStorage() });

app.post("/admin/import-ranking", upload.single("file"), async (req, res) => {
  const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
  const sheet = workbook.Sheets["Resultado"];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = agora.getMonth() + 1;

  await pool.query("DELETE FROM ranking_results");

  for (const r of rows) {
    await pool.query(
      `INSERT INTO ranking_results (cpf, nome, categoria, pontos, ano, mes)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [
        String(r.CPF).replace(/\D/g, ""),
        r.Nome,
        r.Categoria,
        Number(r.Pontos),
        ano,
        mes
      ]
    );
  }

  res.json({ ok: true });
});

/* ===================== CATEGORIAS ===================== */
app.get("/ranking/categorias", async (_, res) => {
  const r = await pool.query(
    "SELECT DISTINCT categoria FROM ranking_results ORDER BY categoria"
  );
  res.json(r.rows.map(x => x.categoria));
});

/* ===================== RANKING ===================== */
app.get("/ranking/:categoria", async (req, res) => {
  const { categoria } = req.params;
  const { ano, mes } = req.query;

  const r = await pool.query(`
    SELECT nome, pontos
    FROM ranking_results
    WHERE categoria=$1
      AND ($2::int IS NULL OR ano=$2)
      AND ($3::int IS NULL OR mes=$3)
    ORDER BY pontos DESC
  `, [categoria, ano || null, mes || null]);

  res.json(
    r.rows.map((row, i) => ({
      posicao: i + 1,
      nome: row.nome,
      pontos: row.pontos
    }))
  );
});

/* ===================== START ===================== */
app.listen(process.env.PORT || 3001);
``
