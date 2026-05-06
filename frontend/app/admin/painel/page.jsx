"use client";

import { useState } from "react";

const BACKEND_URL = "https://best-quality-19-customer-first.onrender.com";

export default function PainelAdmin() {
  const [rankingFile, setRankingFile] = useState(null);
  const [msgRanking, setMsgRanking] = useState("");

  async function enviarRanking() {
    try {
      // 🔥 WARM-UP DO RENDER (corrige erro de conexão por cold start)
      await fetch(BACKEND_URL, { method: "GET" });
    } catch (_) {
      // mesmo se falhar, continua tentando o upload
    }

    if (!rankingFile) {
      setMsgRanking("❌ Selecione a planilha de ranking");
      return;
    }

    const formData = new FormData();
    formData.append("file", rankingFile);

    setMsgRanking("⏳ Enviando e processando ranking...");

    try {
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
      setMsgRanking(
        `✅ Ranking atualizado (${data.ranking_gerado} registros)`
      );
    } catch (error) {
      console.error(error);
      setMsgRanking("❌ Erro de conexão com o backend");
    }
  }

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>🛠️ Painel Admin</h1>

      <hr />

      <h2>🏆 Importação de Ranking</h2>

      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => setRankingFile(e.target.files[0])}
      />

      <br /><br />

      <button onClick={enviarRanking}>
        Enviar pontuação para ranking
      </button>

      <p>{msgRanking}</p>
    </div>
  );
}
``
