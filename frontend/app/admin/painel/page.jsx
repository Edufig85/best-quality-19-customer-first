"use client";

import { useState } from "react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function PainelAdmin() {
  const [rankingFile, setRankingFile] = useState(null);
  const [msg, setMsg] = useState("");

  async function enviarRanking() {
    if (!rankingFile) {
      setMsg("❌ Selecione a planilha");
      return;
    }

    const formData = new FormData();
    formData.append("file", rankingFile);

    setMsg("⏳ Processando ranking...");

    try {
      const res = await fetch(`${BACKEND}/import-ranking`, {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (data.ranking_gerado !== undefined) {
        setMsg(`✅ Ranking atualizado (${data.ranking_gerado} registros)`);
      } else {
        setMsg("❌ Erro ao processar ranking");
      }
    } catch {
      setMsg("❌ Erro de conexão com o backend");
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>🛠️ Painel Admin</h1>

      <h2>🏆 Importação de Ranking</h2>

      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={e => setRankingFile(e.target.files[0])}
      />
      <br /><br />

      <button onClick={enviarRanking}>
        Enviar pontuação para ranking
      </button>

      <p>{msg}</p>
    </div>
  );
}
