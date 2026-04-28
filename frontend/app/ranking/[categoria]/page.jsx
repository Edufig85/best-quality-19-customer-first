"use client";

import { useEffect, useState } from "react";
import useAuthGuard from "../../hooks/useAuthGuard";

export default function RankingCategoria({ params }) {
  useAuthGuard();

  const { categoria } = params;
  const [ranking, setRanking] = useState([]);
  const [msg, setMsg] = useState("Carregando ranking...");

  useEffect(() => {
    const carregarRanking = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/ranking/${decodeURIComponent(
            categoria
          )}`
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
  }, [categoria]);

  const top5 = ranking.slice(0, 5);
  const restante = ranking.slice(5);

  return (
    <div style={{ padding: 40 }}>
      <h1>🏆 Ranking – {decodeURIComponent(categoria)}</h1>

