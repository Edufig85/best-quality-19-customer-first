"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function useAuthGuard() {
  const router = useRouter();

  useEffect(() => {
    const logged = localStorage.getItem("logged");
    if (!logged) {
      router.push("/login");
    }
  }, [router]);
}
``
