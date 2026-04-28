"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const realizarLogin = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cpf, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.error || "CPF ou senha inválidos");
        return;
      }

      // ✅ A PARTIR DAQUI É 100% CLIENT-SIDE
      if (typeof window !== "undefined") {
        localStorage.setItem("logged", "true");
        localStorage.setItem("cpf", cpf);
        localStorage.setItem("userName", data.nome);
      }

      if (data.must_change_password) {
        router.push("/change-password");
        return;
      }

      router.push("/categorias");
    } catch {
      setMsg("Erro ao conectar com o servidor");
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Login</h1>

      <input
        type="text"
        placeholder="CPF"
        value={cpf}
        onChange={(e) => setCpf(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={realizarLogin}>
        Entrar
      </button>

      <p>{msg}</p>
    </div>
  );
}
