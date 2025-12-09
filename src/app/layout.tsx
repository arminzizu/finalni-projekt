"use client";

import React, { useState, useEffect } from "react";
import { AppNameProvider } from "./context/AppNameContext";
import { CjenovnikProvider } from "./context/CjenovnikContext";
import Sidebar from "./sidebar/Sidebar";
import { usePathname, useRouter } from "next/navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null = loading
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // LOGIN ISKLJUČEN ZA DEVELOPMENT - omogućava pristup bez autentifikacije
    const offlineUser = typeof window !== "undefined" ? localStorage.getItem("offlineUser") : null;
    const authenticated = !!offlineUser;

    // Ako nema usera, kreiraj defaultnog
    if (!offlineUser && typeof window !== "undefined") {
      const defaultUser = {
        email: "gitara.zizu@gmail.com",
        userId: "admin-user",
        displayName: "Admin",
        appName: "Moja Aplikacija",
        loggedInAt: Date.now(),
      };
      localStorage.setItem("offlineUser", JSON.stringify(defaultUser));
    }
    
    setIsAuthenticated(true); // Uvijek authenticated za sada
    setIsLoading(false);
  }, []);

  // LOGIN ISKLJUČEN - prikaži app direktno
  if (isLoading) {
    return (
      <html lang="bs">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <style>{`* { -webkit-tap-highlight-color: transparent; }`}</style>
        </head>
        <body style={{ margin: 0, padding: 0, minHeight: "100vh", fontFamily: "'Inter', sans-serif", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#f4f5f7", WebkitTapHighlightColor: "transparent" }}>
          <div style={{ fontSize: "16px", color: "#6b7280" }}>Učitavanje...</div>
        </body>
      </html>
    );
  }

  // Ako je korisnik prijavljen, prikaži normalnu app sa sidebarom
  return (
    <html lang="bs">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>{`* { -webkit-tap-highlight-color: transparent; }`}</style>
      </head>
      <body style={{ margin: 0, padding: 0, minHeight: "100vh", fontFamily: "'Inter', sans-serif", overflowX: "hidden", position: "relative", WebkitTapHighlightColor: "transparent" }}>
        <AppNameProvider>
          <CjenovnikProvider>
            <Sidebar />
            <main
              style={{
                flex: 1,
                padding: "0",
                backgroundColor: "#f4f5f7",
                minHeight: "100vh",
                paddingBottom: "60px", // Prostor za bottom bar
                width: "100%",
              }}
            >
              <div style={{ padding: "20px", width: "100%", boxSizing: "border-box" }}>{children}</div>
            </main>
            <style jsx>{`
              .sidebar-link:hover {
                background-color: #3b82f6;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
              }
              @media (max-width: 768px) {
                main {
                  padding-bottom: 60px; /* Zadrži prostor za bottom bar */
                }
                div[style*="padding: 20px"] {
                  padding: 10px; /* Smanji padding na mobilu */
                }
              }
              @media (min-width: 768px) {
                main {
                  padding-bottom: 0; /* Bez paddinga na desktopu */
                }
              }
            `}</style>
          </CjenovnikProvider>
        </AppNameProvider>
      </body>
    </html>
  );
}