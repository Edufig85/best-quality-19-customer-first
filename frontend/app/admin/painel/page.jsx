"use client";

import { use = "https://best-quality-19-customer-first.onrender.com";import { useState } from "react";

export default function PainelAdmin() {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");

  async function enviarRanking() {
    if (!file) {
      setMsg("❌ Selecione a planilha de ranking");
      return;
    }

    setMsg("⏳ Convertendo arquivo...");

    try {
      // converte arquivo em base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () =>
          resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setMsg("⏳ Enviando ranking...");

      const response = await fetch(
        BACKEND_URL + "/import-ranking",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            fileBase64: base64
          })
        }
      );

      if (!response.ok) {
        throw new Error("Erro HTTP");
      }

      const data = await response.json();
      setMsg(`✅ Ranking atualizado (${data.ranking_gerado} registros)`);
    } catch (err) {
      console.error(err);
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
