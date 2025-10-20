"use client";

import React, { useState, useEffect } from "react";
import { AppNameProvider } from "./context/AppNameContext";
import { CjenovnikProvider } from "./context/CjenovnikContext";
import Sidebar from "./sidebar/Sidebar";
import { auth } from "../lib/firebase";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <html lang="bs">
      <body style={{ margin: 0, padding: 0, minHeight: "100vh", fontFamily: "'Inter', sans-serif", overflowX: "hidden", position: "relative" }}>
        <AppNameProvider>
          <CjenovnikProvider>
            {isAuthenticated && <Sidebar />}
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