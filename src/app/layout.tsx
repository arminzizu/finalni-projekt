"use client";

import React, { useState, useEffect } from "react";
import { AppNameProvider } from "./context/AppNameContext"; // Dodaj AppNameProvider
import { CjenovnikProvider } from "./context/CjenovnikContext";
import Sidebar from "./sidebar/Sidebar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setIsSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <html lang="bs">
      <body style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
        <AppNameProvider> {/* Dodaj AppNameProvider */}
          <CjenovnikProvider>
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <main
              style={{
                flex: 1,
                padding: "0",
                backgroundColor: "#f4f5f7",
                minHeight: "100vh",
                transition: "margin-left 0.3s ease",
                marginLeft: isSidebarOpen ? "220px" : "60px",
              }}
            >
              <div style={{ padding: "20px" }}>{children}</div>
            </main>
            <style jsx>{`
              .sidebar-link:hover {
                background-color: #3b82f6;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
              }
            `}</style>
          </CjenovnikProvider>
        </AppNameProvider>
      </body>
    </html>
  );
}