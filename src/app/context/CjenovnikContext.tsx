"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
  pendingCjenovnik: ArtiklCijena[]; // Privremeni cjenovnik za nove artikle
  setCjenovnik: React.Dispatch<React.SetStateAction<ArtiklCijena[]>>;
  addArtikal: (artikal: ArtiklCijena) => void;
  updateCjenovnik: () => void; // Potvrda promjena
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
    if (typeof window === "undefined") {
      return initialCjenovnik;
    }
    const savedCjenovnik = localStorage.getItem("cjenovnik");
    return savedCjenovnik ? JSON.parse(savedCjenovnik) : initialCjenovnik;
  });
  const [pendingCjenovnik, setPendingCjenovnik] = useState<ArtiklCijena[]>([]); // Privremeni cjenovnik

  // Učitaj cjenovnik iz API-ja pri učitavanju
  useEffect(() => {
    const loadCjenovnik = async () => {
      try {
        const response = await fetch("/api/cjenovnik");
        if (response.ok) {
          const data = await response.json();
          if (data.cjenovnik && data.cjenovnik.length > 0) {
            setCjenovnik(data.cjenovnik);
            if (typeof window !== "undefined") {
              localStorage.setItem("cjenovnik", JSON.stringify(data.cjenovnik));
            }
          }
        }
      } catch (error) {
        console.warn("Greška pri učitavanju cjenovnika iz API-ja, koristi localStorage:", error);
      }
    };
    loadCjenovnik();
  }, []);

  // Spremi cjenovnik u localStorage i API svaki put kad se promijeni
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cjenovnik", JSON.stringify(cjenovnik));
      
      // Spremi u API
      fetch("/api/cjenovnik", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cjenovnik }),
      }).catch((error) => {
        console.warn("Greška pri spremanju cjenovnika u API:", error);
      });
    }
  }, [cjenovnik]);

  const addArtikal = (artikal: ArtiklCijena) => {
    setPendingCjenovnik((prev) => [...prev, artikal]); // Dodaj u privremeni cjenovnik
  };

  const updateCjenovnik = () => {
    setCjenovnik((prev) => [...prev, ...pendingCjenovnik]); // Potvrdi promjene
    setPendingCjenovnik([]); // Očisti privremeni cjenovnik
  };

  return (
    <CjenovnikContext.Provider value={{ cjenovnik, pendingCjenovnik, setCjenovnik, addArtikal, updateCjenovnik }}>
      {children}
    </CjenovnikContext.Provider>
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