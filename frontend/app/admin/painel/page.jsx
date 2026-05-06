"use client";
import { useState } from "react";

const BACKEND_URL = "https://best-quality-19-customer-first.onrender.com";

export default function PainelAdmin() {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");

  async function enviarRanking() {
    if (!file) { setMsg("❌ Selecione a planilha"); return; }
    const fd = new FormData(); fd.append("file", file);
    try {
      const r = await fetch(BACKEND_URL + "/import-ranking", { method: "POST", body: fd });
      const j = await r.json();
      setMsg("✅ Ranking atualizado (" + j.ranking_gerado + " registros)");
    } catch {
      setMsg("❌ Erro de conexão");
    }
  }

  return (
    <div style={{ padding: 40, fontFamily: 'Arial' }}>
      <h1>🛠️ Painel Admin</h1>
      <h2>🏆 Importação de Ranking</h2>
      <input type="file" accept=".xlsx,.xls" onChange={e=>setFile(e.target.files[0])}/>
      <br/><br/>
      <button onClick={enviarRanking}>Enviar pontuação para ranking</button>
      <p>{msg}</p>
    </div>
  );
}