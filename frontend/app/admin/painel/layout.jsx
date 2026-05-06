"use client";

import { useState } from "react";

const BACKEND_URL = "https://best-quality-19-customer-first.onrender.com";

export default function PainelAdmin() {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");

  async function enviarRanking() {
    if (!file) {
      setMsg("❌ Selecione a planilha de ranking");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setMsg("⏳ Enviando ranking...");

    try {
      const response = await fetch(
        BACKEND_URL + "/import-ranking",
        {
          method: "POST",
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error("Erro HTTP " + response.status);
      }

      const data = await response.json();
      setMsg(`✅ Ranking atualizado (${data.ranking_gerado} registros)`);
    } catch (error) {
      console.error(error);
      setMsg("❌ Erro de conexão");
    }
  }

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>🛠️ Painel Admin</h1>

      <h2>🏆 Importação de Ranking</h2>

      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br /><br />

      <button onClick={enviarRanking}>
        Enviar pontuação para ranking
      </button>

      <p>{msg}</p>
    </div>
  );
}
