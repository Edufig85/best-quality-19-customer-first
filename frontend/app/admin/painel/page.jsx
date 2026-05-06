"use client";

import { useState }");import { useState } from "react";
    }
  }

  return (
    <div>
      <h1>🛠️ Painel Admin</h1>
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <button onClick={enviarRanking}>Enviar pontuação</button>
      <p>{msg}</p>
    </div>
  );
}

const BACKEND = "https://best-quality-19-customer-first.onrender.com";

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

    try {
      const res = await fetch(`${BACKEND}/import-ranking`, {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      setMsg(`✅ Ranking atualizado (${data.ranking_gerado} registros)`);
    } catch {
