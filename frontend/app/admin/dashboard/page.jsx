"use client";
import { useEffect, useState } from "react";
import useAuthGuard from "../../hooks/useAuthGuard";

export default function Dashboard() {
  useAuthGuard();
  const [data, setData] = useState({});

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard/overview`)
      .then(r => r.json())
      .then(setData);
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>📊 Dashboard Executivo</h1>

      <div>Usuários cadastrados: {data.usuarios}</div>
      <div>Participantes ativos: {data.participantes}</div>
      <div>Categorias: {data.categorias}</div>
    </div>
  );
}
