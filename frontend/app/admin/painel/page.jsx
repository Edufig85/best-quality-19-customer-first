"use client";

import { useState } from "react";

/**
 * URL FIXA DO BACKEND (Render)
 * CONFIRMADA PELO USUÁRIO
 */
const BACKEND_URL = "https://best-quality-19-customer-first.onrender.com";

export default function PainelAdmin() {
  const [rankingFile, setRankingFile] = useState(null);
  const [msg, setMsg] = useState("");

  async function enviarRanking() {
    if (!rankingFile) {
      setMsg("❌ Selecione a planilha de ranking");
      return;
    }

    const formData = new FormData();
    formData.append("file", rankingFile);

    setMsg("⏳ Enviando ranking...");

    try {
      console.log("Enviando para:", BACKEND_URL + "/import-ranking");

      const response = await fetch(
        BACKEND_URL + "/import-ranking",
        {
          method: "POST",
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }

      const data = await response.json();

      setMsg(
        `✅ Ranking atualizado (${data.ranking_gerado} registros)`
      );
    } catch (error) {
      console.error("ERRO REAL:", error);
      setMsg("❌ Erro de conexão com o backend");
    }
  }

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
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
