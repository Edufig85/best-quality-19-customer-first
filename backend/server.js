import express from "express";
import cors from "cors";
import multer from "multer";
import * as XLSX from "xlsx";
import bcrypt from "bcryptjs";
import pkg from "pg";

const { Pool } = pkg;
const app = express();

/* ================= MIDDLEWARE ================= */


app.use(cors({
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));
``
app.use(express.json());

/* ================= DATABASE ================= */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/* ================= INIT TABLES ================= */
async function initDB() {
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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_badges (
      id SERIAL PRIMARY KEY,
      cpf TEXT,
      categoria TEXT,
      badge TEXT,
      ano INTEGER,
      mes INTEGER,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
}
initDB();

/* ================= LOGIN ================= */
app.post("/login", async (req, res) => {
  let { cpf, password } = req.body;
  cpf = String(cpf || "").replace(/\D/g, "");

  const r = await pool.query(
    "SELECT cpf, nome, password, must_change_password FROM users WHERE cpf=$1",
    [cpf]
  );
  const user = r.rows[0];

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "CPF ou senha inválidos" });
  }

  res.json({
    must_change_password: user.must_change_password,
    nome: user.nome
  });
});

/* ================= TROCAR SENHA ================= */
app.post("/change-password", async (req, res) => {
  const { cpf, newPassword } = req.body;
  const hash = bcrypt.hashSync(newPassword, 10);

  await pool.query(
    "UPDATE users SET password=$1, must_change_password=false WHERE cpf=$2",
    [hash, cpf]
  );
  res.json({ ok: true });
});

/* ================= ADMIN: UPLOAD RANKING ================= */
const upload = multer({ storage: multer.memoryStorage() });

app.post("/admin/import-ranking", upload.single("file"), async (req, res) => {
  const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
  const sheet = workbook.Sheets["Resultado"];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  const now = new Date();
  const ano = now.getFullYear();
  const mes = now.getMonth() + 1;

  await pool.query("DELETE FROM ranking_results");
  await pool.query(
    "DELETE FROM user_badges WHERE ano=$1 AND mes=$2",
    [ano, mes]
  );

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

  // ===== CALCULAR BADGES =====
  const categorias = await pool.query(
    "SELECT DISTINCT categoria FROM ranking_results"
  );

  for (const c of categorias.rows) {
    const top = await pool.query(
      `
      SELECT cpf
      FROM ranking_results
      WHERE categoria=$1 AND ano=$2 AND mes=$3
      ORDER BY pontos DESC
      LIMIT 5
      `,
      [c.categoria, ano, mes]
    );

    for (let i = 0; i < top.rows.length; i++) {
      let badge = null;
      if (i === 0) badge = "Diamante";
      else if (i <= 2) badge = "Ouro";
      else badge = "Bronze";

      await pool.query(
        `
        INSERT INTO user_badges (cpf, categoria, badge, ano, mes)
        VALUES ($1,$2,$3,$4,$5)
        `,
        [top.rows[i].cpf, c.categoria, badge, ano, mes]
      );
    }
  }

  res.json({ ok: true });
});

/* ================= CATEGORIAS ================= */
app.get("/ranking/categorias", async (_, res) => {
  const r = await pool.query(
    "SELECT DISTINCT categoria FROM ranking_results ORDER BY categoria"
  );
  res.json(r.rows.map(x => x.categoria));
});

/* ================= RANKING ================= */
app.get("/ranking/:categoria", async (req, res) => {
  const { categoria } = req.params;
  const { ano, mes } = req.query;

  const r = await pool.query(
    `
    SELECT nome, pontos
    FROM ranking_results
    WHERE categoria=$1
      AND ($2::int IS NULL OR ano=$2)
      AND ($3::int IS NULL OR mes=$3)
    ORDER BY pontos DESC
    `,
    [categoria, ano || null, mes || null]
  );

  res.json(
    r.rows.map((row, i) => ({
      posicao: i + 1,
      nome: row.nome,
      pontos: row.pontos
    }))
  );
});

/* ================= BADGES DO USUÁRIO ================= */
app.get("/badges/:cpf", async (req, res) => {
  const { cpf } = req.params;

  const r = await pool.query(
    `
    SELECT categoria, badge, ano, mes
    FROM user_badges
    WHERE cpf=$1
    ORDER BY ano DESC, mes DESC
    `,
    [cpf]
  );

  res.json(r.rows);
});

/* ================= DASHBOARD ================= */
app.get("/admin/dashboard/overview", async (_, res) => {
  const u = await pool.query("SELECT COUNT(*) FROM users");
  const p = await pool.query("SELECT COUNT(DISTINCT cpf) FROM ranking_results");
  const c = await pool.query("SELECT COUNT(DISTINCT categoria) FROM ranking_results");

  res.json({
    usuarios: u.rows[0].count,
    participantes: p.rows[0].count,
    categorias: c.rows[0].count
  });
});

app.get("/admin/dashboard/badges", async (_, res) => {
  const r = await pool.query(
    "SELECT badge, COUNT(*) total FROM user_badges GROUP BY badge"
  );
  res.json(r.rows);
});

app.get("/admin/dashboard/por-mes", async (_, res) => {
  const r = await pool.query(
    `
    SELECT ano, mes, COUNT(DISTINCT cpf) participantes
    FROM ranking_results
    GROUP BY ano, mes
    ORDER BY ano, mes
    `
  );
  res.json(r.rows);
});
app.get("/", (req, res) => {
  res.send("API BQ19 ATIVA");
});

/* ================= START ================= */
app.listen(process.env.PORT || 3001, () =>
  console.log("API BQ19 rodando (Ranking + Gamificação + Dashboard)")
);
