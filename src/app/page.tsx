"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // LOGIN ISKLJUČEN - idi direktno na dashboard
    router.push("/dashboard");
  }, [router]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <p>Učitavanje...</p>
    </div>
  );
}