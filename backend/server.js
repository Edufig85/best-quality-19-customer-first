import express from 'express'
import cors from 'cors'
import multer from 'multer'
import * as XLSX from 'xlsx'
import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'

const app = express()
app.use(cors({
  origin: "https://best-quality-19-customer-first.vercel.app",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));
app.use(express.json())

const upload = multer({ dest: 'uploads/' })
const db = new Database('bq19.db')

const DEFAULT_PASSWORD = 'BQ19@2026'

// table
db.prepare(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cpf TEXT UNIQUE,
  nome TEXT,
  password TEXT
)`).run()

app.post('/admin/import-users', upload.single('file'), (req, res) => {
  const wb = XLSX.readFile(req.file.path)
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(sheet)

  const exists = db.prepare('SELECT id FROM users WHERE cpf = ?')
  const insert = db.prepare('INSERT INTO users (cpf, nome, password) VALUES (?, ?, ?)')

  let created = 0
  for (const r of rows) {
    const cpf = String(r.CPF)
    if (!exists.get(cpf)) {
      insert.run(cpf, r.Nome, bcrypt.hashSync(DEFAULT_PASSWORD, 10))
      created++
    }
  }
  res.json({ users_created: created })
})

app.get('/', (_, res) => res.send('API BQ19 ATIVA'))

app.listen(3001, () => console.log('API rodando'))
