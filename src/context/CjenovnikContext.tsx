"use client";

import React, { createContext, useContext, useState } from "react";

export type ArtiklCijena = {
  naziv: string;
  cijena: number;
  jeZestoko?: boolean;
  zestokoKolicina?: number;
  proizvodnaCijena?: number;
  nabavnaCijena?: number;
  pocetnoStanje?: number;
};

type CjenovnikContextType = {
  cjenovnik: ArtiklCijena[];
  setCjenovnik: React.Dispatch<React.SetStateAction<ArtiklCijena[]>>;
};

const CjenovnikContext = createContext<CjenovnikContextType | undefined>(undefined);

export function CjenovnikProvider({ children }: { children: React.ReactNode }) {
  const [cjenovnik, setCjenovnik] = useState<ArtiklCijena[]>([
    { naziv: "Kafa", cijena: 2.5, jeZestoko: false, proizvodnaCijena: 1.5, nabavnaCijena: 1.0, pocetnoStanje: 10 },
    { naziv: "Čaj", cijena: 2, jeZestoko: false, proizvodnaCijena: 1.0, nabavnaCijena: 0.8, pocetnoStanje: 15 },
    { naziv: "Vodka", cijena: 2, jeZestoko: true, zestokoKolicina: 0.04, proizvodnaCijena: 1.2, nabavnaCijena: 1.5, pocetnoStanje: 5 },
    { naziv: "Rakija", cijena: 2, jeZestoko: true, zestokoKolicina: 0.03, proizvodnaCijena: 1.1, nabavnaCijena: 1.3, pocetnoStanje: 6 },
  ]);

  return (
    <CjenovnikContext.Provider value={{ cjenovnik, setCjenovnik }}>
      {children}
    </CjenovnikContext.Provider>
  );
}

export function useCjenovnik() {
  const context = useContext(CjenovnikContext);
  if (!context) {
    throw new Error("useCjenovnik mora biti korišten unutar CjenovnikProvider");
  }
  return context;
}
