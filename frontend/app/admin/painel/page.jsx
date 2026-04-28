"use client";

import {(null);import { useState } from "react";
  const [rankingFile, setRankingFile] = useState(null);

  const [msgUsers, setMsgUsers] = useState("");
  const [msgRanking, setMsgRanking] = useState("");

  const enviarUsuarios = async () => {
    if (!usersFile) {
      setMsgUsers("Selecione um arquivo de usuários");
      return;
    }

    setMsgUsers("Enviando usuários...");

    const formData = new FormData();
    formData.append("file", usersFile);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/import-users`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMsgUsers(data.error || "Erro ao importar usuários");
        return;
      }

      setMsgUsers(`Usuários criados: ${data.users_created}`);
    } catch (err) {
      console.error(err);
      setMsgUsers("Erro de conexão com o servidor");
    }
  };

  const enviarRanking = async () => {
    if (!rankingFile) {
      setMsgRanking("Selecione um arquivo de ranking");
      return;
    }

    setMsgRanking("Enviando ranking...");

    const formData = new FormData();
    formData.append("file", rankingFile);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/import-ranking`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMsgRanking(data.error || "Erro ao importar ranking");
        return;
      }

      setMsgRanking("Ranking importado com sucesso ✅");
    } catch (err) {
      console.error(err);
      setMsgRanking("Erro de conexão com o servidor");
    }
  };

  return (
    <div style={{ padding: 40, maxWidth: 600 }}>
      <h1>🛠 Painel Administrativo</h1>

      <section style={styles.box}>
        <h2>📁 Importação de Usuários</h2>

        <input
          type="file"
          accept=".xls,.xlsx"
          onChange={(e) => setUsersFile(e.target.files[0])}
        />

        <br /><br />

        <button onClick={enviarUsuarios}>
          Enviar usuários
        </button>

        <p>{msgUsers}</p>
      </section>

      <section style={styles.box}>
        <h2>🏆 Importação de Ranking</h2>

        <input
          type="file"
          accept=".xls,.xlsx"
          onChange={(e) => setRankingFile(e.target.files[0])}
        />

        <br /><br />

        <button onClick={enviarRanking}>
          Enviar ranking
        </button>

        <p>{msgRanking}</p>
      </section>
    </div>
  );
}

const styles = {
  box: {
    border: "1px solid #ddd",
    padding: 20,
    marginTop: 30,
    borderRadius: 10,
    background: "#fafafa",
  },
};
``
import useAuthGuard from "../../hooks/useAuthGuard";

export default function PainelAdmin() {
  useAuthGuard();

