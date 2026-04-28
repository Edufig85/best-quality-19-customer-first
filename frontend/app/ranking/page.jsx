"use client";

import { useEffect, useState } from "react";
import useAuthGuard from "../hooks/useAuthGuard";

export default function Ranking() {
  useAuthGuard();

  const [ranking, setRanking] = useState([]);
  const [msg, setMsg] = useState("Carregando ranking...");

  useEffect(() => {
    const carregarRanking = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/ranking`
        );

        const data = await res.json();

        if (!res.ok) {
          setMsg("Erro ao carregar ranking");
          return;
        }

        setRanking(data);
        setMsg("");
      } catch {
        setMsg("Erro de conexão");
      }
    };

    carregarRanking();
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>🏆 Ranking</h1>

      {msg && <p>{msg}</p>}

      {!msg && (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Posição</th>
              <th>Nome</th>
              <th>Pontos</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((item) => (
              <tr key={item.posicao}>
                <td>{item.posicao}</td>
                <td>{item.nome}</td>
                <td>{item.pontos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <br />

      <button
        onClick={() => {
          localStorage.removeItem("logged");
          localStorage.removeItem("cpf");
          window.location.href = "/login";
        }}
      >
        Sair
      </button>
    </div>
  );
}
