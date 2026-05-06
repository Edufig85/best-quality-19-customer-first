"use client";

import { useState } from "react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function PainelAdmin() {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");

  async function enviarRanking() {
    if (!file) {
      setMsg("❌ Selecione a planilha");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setMsg("⏳ Enviando ranking...");

    try {
      const res = await fetch(`${BACKEND}/import-ranking`, {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        throw new Error("Erro HTTP");
      }

      const data = await res.json();

      setMsg(
        `✅ Ranking atualizado (${data.ranking_gerado} registros)`
      );
    } catch (err) {
      console.error(err);
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
        onChange={e => setFile(e.target.files[0])}
      />

      <br /><br />

      <button onClick={enviarRanking}>
        Enviar pontuação para ranking
      </button>

      <p>{msg}</p>
    </div>
  );
}
