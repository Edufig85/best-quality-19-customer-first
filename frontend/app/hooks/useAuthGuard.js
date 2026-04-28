"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function useAuthGuard() {
  const router = useRouter();
  useEffect(() => {
    if (!localStorage.getItem("logged")) {
      router.push("/login");
    }
  }, [router]);
}
