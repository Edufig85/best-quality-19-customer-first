
"use client";
import { useState } from "react";

export default function PainelAdmin(){
  const [file,setFile]=useState(null);
  const [msg,setMsg]=useState("");
  const enviar=async()=>{
    const fd=new FormData();
    fd.append("file",file);
    const r=await fetch(process.env.NEXT_PUBLIC_API_URL+"/import-users",{method:"POST",body:fd});
    const j=await r.json();
    setMsg("Usuários criados: "+j.users_created);
  };
  return (<div><h1>Painel Admin</h1><input type="file" onChange={e=>setFile(e.target.files[0])}/><button onClick={enviar}>Enviar</button><p>{msg}</p></div>);
}
