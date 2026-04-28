import express from "express";import express from "express "cors";
import multer from "multer";
import * as XLSX from "xlsx";
import bcrypt from "bcryptjs";
import pkg from "pg";

const { Pool } = pkg;

/* ==========================
   APP E MIDDLEWARE
========================== */
const app = express();

app.use(cors({
  origin: "https://best-quality-19-customer-first.vercel.app",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));

app.use(express.json());

/* ==========================
   POSTGRES (NEON)
========================== */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/* ==========================
   INIT DATABASE
========================== */
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      cpf TEXT UNIQUE NOT NULL,
      nome TEXT NOT NULL,
      password TEXT NOT NULL,
      must_change_password BOOLEAN DEFAULT TRUE
    );
  `);
}

initDB();

/* ==========================
   MULTER (MEMÓRIA)
========================== */
const upload = multer({
  storage: multer.memoryStorage(),
});

const DEFAULT_PASSWORD = "BQ19@2026";

/* ==========================
   HEALTH CHECK
========================== */
app.get("/", (req, res) => {
  res.send("API BQ19 ATIVA");
});

/* ==========================
   IMPORTAR USUÁRIOS (EXCEL)
========================== */
app.post("/admin/import-users", upload.single("file"), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "Arquivo não recebido" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    let created = 0;
    let ignored = 0;

    for (const row of rows) {
      const normalized = {};
      Object.keys(row).forEach(k => {
        normalized[k.trim().toLowerCase()] = row[k];
      });

      const cpf = String(normalized.cpf || "")
        .replace(/\D/g, "")
        .trim();

      const nome = String(
        normalized.nome || normalized["nome completo"] || ""
      ).trim();

      if (cpf.length !== 11 || !nome) {
        ignored++;
        continue;
      }

      const hash = bcrypt.hashSync(DEFAULT_PASSWORD, 10);

      const result = await pool.query(
        `
        INSERT INTO users (cpf, nome, password)
        VALUES ($1, $2, $3)
        ON CONFLICT (cpf) DO NOTHING
        RETURNING id
        `,
        [cpf, nome, hash]
      );

      if (result.rowCount === 1) created++;
    }

    res.json({
      users_created: created,
      ignored_rows: ignored,
      total_rows: rows.length,
    });
  } catch (err) {
    console.error("ERRO IMPORT USERS:", err);
    res.status(500).json({ error: "Erro ao importar usuários" });
  }
});

/* ==========================
   LOGIN
========================== */
app.post("/login", async (req, res) => {
  try {
    let { cpf, password } = req.body;
    cpf = String(cpf || "").replace(/\D/g, "").trim();

    if (!cpf || cpf.length !== 11 || !password) {
      return res.status(401).json({ error: "CPF ou senha inválidos" });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE cpf = $1",
      [cpf]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: "CPF ou senha inválidos" });
    }

    const senhaOk = bcrypt.compareSync(password, user.password);
    if (!senhaOk) {
      return res.status(401).json({ error: "CPF ou senha inválidos" });
    }

    res.json({
      must_change_password: user.must_change_password,
    });
  } catch (err) {
    console.error("ERRO LOGIN:", err);
    res.status(500).json({ error: "Erro interno no login" });
  }
});

/* ==========================
   TROCA OBRIGATÓRIA DE SENHA
========================== */
app.post("/change-password", async (req, res) => {
  try {
    let { cpf, newPassword } = req.body;
    cpf = String(cpf || "").replace(/\D/g, "").trim();

    if (!cpf || !newPassword || newPassword.length < 6) {
      return res.status(400).json({
        error: "Senha deve ter pelo menos 6 caracteres"
      });
    }

    const hash = bcrypt.hashSync(newPassword, 10);

    const result = await pool.query(
      `
      UPDATE users
      SET password = $1, must_change_password = FALSE
      WHERE cpf = $2
      `,
      [hash, cpf]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("ERRO CHANGE PASSWORD:", err);
    res.status(500).json({ error: "Erro ao trocar senha" });
  }
});

/* ==========================
   RANKING
========================== */
app.get("/ranking", async (req, res) => {
  try {
    // Ranking simples (mock de pontos)
    const result = await pool.query(`
      SELECT nome
      FROM users
      ORDER BY nome
      LIMIT 20
    `);

    const ranking = result.rows.map((row, index) => ({
      posicao: index + 1,
      nome: row.nome,
      pontos: 100 // Pontuação fixa (placeholder)
    }));

    res.json(ranking);
  } catch (err) {
    console.error("ERRO RANKING:", err);
    res.status(500).json({ error: "Erro ao carregar ranking" });
  }
});

/* ==========================
   START SERVER
========================== */
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log("API BQ19 rodando na porta", PORT);
});
