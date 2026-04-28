"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthGuard from "../../hooks/useAuthGuard";

export default function Categorias() {
  useAuthGuard();
  const router = useRouter();
  const [categorias, setCategorias] = useState([]);
  const [msg, setMsg] = useState("Carregando categorias...");

  useEffect(() => {
    const carregar = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/ranking/categorias`
        );
        const data = await res.json();
        setCategorias(data);
        setMsg("");
      } catch {
        setMsg("Erro ao carregar categorias");
      }
    };

    carregar();
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>🏆 Categorias</h1>

      {msg && <p>{msg}</p>}

      {categorias.map((cat) => (
        <div
          key={cat}
          style={{
            padding: 16,
            marginTop: 12,
            border: "1px solid #ddd",
            borderRadius: 8,
            cursor: "pointer",
            background: "#fafafa",
          }}
          onClick={() =>
            router.push(`/ranking/${encodeURIComponent(cat)}`)
          }
        >
          {cat}
        </div>
      ))}
    </div>
  );
}
``
