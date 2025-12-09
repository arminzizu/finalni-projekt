"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AppNameContextType {
  appName: string;
  setAppName: React.Dispatch<React.SetStateAction<string>>;
}

const AppNameContext = createContext<AppNameContextType | undefined>(undefined);

export function AppNameProvider({ children }: { children: React.ReactNode }) {
  // Učitaj iz localStorage (fallback)
  const [appName, setAppName] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("appName") || "Moja Aplikacija";
    }
    return "Moja Aplikacija";
  });

  // Učitaj iz API-ja pri mount-u
  useEffect(() => {
    const loadAppName = async () => {
      try {
        const resp = await fetch("/api/app-name");
        if (resp.ok) {
          const data = await resp.json();
          if (data.appName) {
            setAppName(data.appName);
            localStorage.setItem("appName", data.appName);
          }
        }
      } catch (err) {
        console.warn("Nije moguće učitati appName iz API-ja, koristi localStorage");
      }
    };
    loadAppName();
  }, []);

  // Spremi u localStorage i API
  useEffect(() => {
    if (appName.trim() !== "" && typeof window !== "undefined") {
      localStorage.setItem("appName", appName);
      
      // Spremi i na server (async, ne blokira)
      fetch("/api/app-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appName }),
      }).catch((err) => {
        console.warn("Nije moguće spremiti appName na server:", err);
      });
    }
  }, [appName]);

  return (
    <AppNameContext.Provider value={{ appName, setAppName }}>
      {children}
    </AppNameContext.Provider>
  );
}

export const useAppName = () => {
  const context = useContext(AppNameContext);
  if (!context) {
    throw new Error("useAppName must be used within an AppNameProvider");
  }
  return context;
};