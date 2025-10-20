"use client";

import React, { useState, useEffect } from "react";
import { AppNameProvider } from "./context/AppNameContext"; // Dodaj AppNameProvider
import { CjenovnikProvider } from "./context/CjenovnikContext";
import Sidebar from "./sidebar/Sidebar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setIsSidebarOpen(false); // Zatvori sidebar na mobilu po defaultu
    };
    handleResize(); // Pozovi odmah
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <html lang="bs">
      <body style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', sans-serif", margin: 0, padding: 0 }}>
        <AppNameProvider>
          <CjenovnikProvider>
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <main
              style={{
                flex: 1,
                padding: "0",
                backgroundColor: "#f4f5f7",
                minHeight: "100vh",
                transition: "margin-left 0.3s ease, margin-right 0.3s ease",
                marginLeft: isSidebarOpen ? "220px" : "0", // Nema margine kad je zatvoren
                marginRight: isSidebarOpen ? "0" : "0", // Prilagođeno za chart
                overflowX: "hidden", // Sprječava horizontalni scroll
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
                  margin-left: 0 !important; /* Ukloni margin na mobilu */
                  width: 100%; /* Osiguraj punu širinu */
                }
                div[style*="padding: 20px"] {
                  padding: 10px; /* Smanji padding na mobilu */
                }
              }
            `}</style>
          </CjenovnikProvider>
        </AppNameProvider>
      </body>
    </html>
  );
}