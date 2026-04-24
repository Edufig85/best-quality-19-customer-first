
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import * as XLSX from 'xlsx';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });
const db = new Database('bq19.db');

// TABLE
db.prepare(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cpf TEXT UNIQUE,
  nome TEXT,
  password TEXT,
  must_change_password INTEGER DEFAULT 1
)`).run();

const DEFAULT_PASSWORD = 'BQ19@2026';

// IMPORT USERS
app.post('/admin/import-users', upload.single('file'), (req, res) => {
  const workbook = XLSX.readFile(req.file.path);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);

  const insert = db.prepare('INSERT INTO users (cpf, nome, password) VALUES (?,?,?)');
  const exists = db.prepare('SELECT id FROM users WHERE cpf = ?');

  let created = 0;

  rows.forEach(row => {
    const cpf = String(row.CPF).trim();
    const nome = row.Nome;
    if (!exists.get(cpf)) {
      const hash = bcrypt.hashSync(DEFAULT_PASSWORD, 10);
      insert.run(cpf, nome, hash);
      created++;
    }
  });

  res.json({ status: 'ok', users_created: created });
});

// LOGIN
app.post('/login', (req, res) => {
  const { cpf, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE cpf = ?').get(cpf);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Credenciais invalidas' });
  }
  res.json({ must_change_password: user.must_change_password });
});

app.get('/', (_, res) => res.send('API BQ19 ATIVA'));

app.listen(3001, () => console.log('Backend BQ19 rodando'));
