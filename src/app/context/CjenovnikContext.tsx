"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AppNameProvider } from "./AppNameContext";

// ---- Tip artikla ----
type ArtiklCijena = {
  naziv: string;
  cijena: number;
  jeZestoko: boolean;
  zestokoKolicina?: number;
  proizvodnaCijena?: number;
  nabavnaCijena: number;
  nabavnaCijenaFlase?: number;
  zapreminaFlase?: number;
  pocetnoStanje: number;
};

// ---- Tip contexta ----
type CjenovnikContextType = {
  cjenovnik: ArtiklCijena[];
  setCjenovnik: React.Dispatch<React.SetStateAction<ArtiklCijena[]>>;
};

const CjenovnikContext = createContext<CjenovnikContextType | undefined>(undefined);

// ---- Početni podaci ----
const initialCjenovnik: ArtiklCijena[] = [
  {
    naziv: "Kafa",
    cijena: 2.5,
    jeZestoko: false,
    proizvodnaCijena: 1.5,
    nabavnaCijena: 1.2,
    pocetnoStanje: 10,
  },
  {
    naziv: "Čaj",
    cijena: 2,
    jeZestoko: false,
    proizvodnaCijena: 1.0,
    nabavnaCijena: 0.8,
    pocetnoStanje: 15,
  },
  {
    naziv: "Vodka",
    cijena: 2,
    jeZestoko: true,
    zestokoKolicina: 0.04,
    proizvodnaCijena: 1.2,
    nabavnaCijena: 0.9,
    pocetnoStanje: 1000,
  },
  {
    naziv: "Rakija",
    cijena: 2,
    jeZestoko: true,
    zestokoKolicina: 0.03,
    proizvodnaCijena: 1.1,
    nabavnaCijena: 0.85,
    pocetnoStanje: 800,
  },
];

// ---- Provider ----
export function CjenovnikProvider({ children }: { children: ReactNode }) {
  const [cjenovnik, setCjenovnik] = useState<ArtiklCijena[]>(() => {
    // Provjeravamo da li smo u pregledaču prije pristupa localStorage
    if (typeof window === "undefined") {
      return initialCjenovnik;
    }
    const savedCjenovnik = localStorage.getItem("cjenovnik");
    return savedCjenovnik ? JSON.parse(savedCjenovnik) : initialCjenovnik;
  });

  // Spremi cjenovnik u localStorage svaki put kad se promijeni
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cjenovnik", JSON.stringify(cjenovnik));
    }
  }, [cjenovnik]);

  return (
    <AppNameProvider>
      <CjenovnikContext.Provider value={{ cjenovnik, setCjenovnik }}>
        {children}
      </CjenovnikContext.Provider>
    </AppNameProvider>
  );
}

// ---- Hook za korištenje contexta ----
export function useCjenovnik() {
  const context = useContext(CjenovnikContext);
  if (!context) {
    throw new Error("useCjenovnik mora biti korišten unutar CjenovnikProvider");
  }
  return context;
}