"use client";

import React, { useState, useEffect } from "react";
import { useCjenovnik } from "../context/CjenovnikContext";
import { FaTrash, FaPlus } from "react-icons/fa";

// ---- Tipovi ----
type Artikl = {
  naziv: string;
  cijena: number;
  jeZestoko: boolean;
  pocetnoStanje: number;
  nabavnaCijena: number;
  zestokoKolicina?: number;
  proizvodnaCijena?: number;
  nabavnaCijenaFlase?: number;
  zapreminaFlase?: number;
};

// ---- CSS Stilovi ----
const containerStyle: React.CSSProperties = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "24px",
  fontFamily: "'Inter', sans-serif",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "separate" as "separate",
  borderSpacing: 0,
  background: "#ffffff",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  marginBottom: "20px",
};

const thStyle: React.CSSProperties = {
  padding: "16px",
  textAlign: "left" as "left",
  background: "#f8fafc",
  color: "#1f2937",
  fontSize: "14px",
  fontWeight: 600,
  borderBottom: "1px solid #e5e7eb",
};

const tdStyle: React.CSSProperties = {
  padding: "16px",
  textAlign: "left" as "left",
  borderBottom: "1px solid #f3f4f6",
  fontSize: "14px",
  color: "#374151",
};

const inputStyle: React.CSSProperties = {
  width: "80px",
  padding: "8px",
  border: "1px solid #e5e7eb",
  borderRadius: "6px",
  textAlign: "center",
  fontSize: "14px",
  background: "#fff",
};

const formInputStyle: React.CSSProperties = {
  padding: "8px",
  border: "1px solid #e5e7eb",
  borderRadius: "6px",
  fontSize: "14px",
  marginRight: "8px",
  outline: "none",
  width: "120px",
};

const disabledInputStyle: React.CSSProperties = {
  ...formInputStyle,
  background: "#f3f4f6",
  cursor: "not-allowed",
};

const selectStyle: React.CSSProperties = {
  padding: "8px",
  border: "1px solid #e5e7eb",
  borderRadius: "6px",
  fontSize: "14px",
  marginRight: "8px",
  outline: "none",
  background: "#fff",
  width: "120px",
};

const buttonStyle: React.CSSProperties = {
  padding: "8px 16px",
  background: "#3b82f6",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: 500,
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const deleteButtonStyle: React.CSSProperties = {
  padding: "8px",
  background: "none",
  color: "#dc2626",
  border: "none",
  cursor: "pointer",
  fontSize: "14px",
};

const errorStyle: React.CSSProperties = {
  padding: "12px",
  background: "#fef2f2",
  color: "#dc2626",
  borderRadius: "6px",
  border: "1px solid #fee2e2",
  marginBottom: "16px",
  fontSize: "14px",
};

const checkboxStyle: React.CSSProperties = {
  width: "16px",
  height: "16px",
  marginRight: "8px",
};

// ---- Glavna komponenta ----
export default function CjenovnikPage() {
  const { cjenovnik, setCjenovnik } = useCjenovnik();

  const [newArtiklNaziv, setNewArtiklNaziv] = useState<string>("");
  const [newArtiklCijena, setNewArtiklCijena] = useState<string>("");
  const [newArtiklNabavnaCijena, setNewArtiklNabavnaCijena] = useState<string>("");
  const [newArtiklJeZestoko, setNewArtiklJeZestoko] = useState<boolean>(false);
  const [newArtiklZestokoKolicina, setNewArtiklZestokoKolicina] = useState<string>("0.03");
  const [newArtiklProizvodnaCijena, setNewArtiklProizvodnaCijena] = useState<string>("");
  const [newArtiklNabavnaCijenaFlase, setNewArtiklNabavnaCijenaFlase] = useState<string>("");
  const [newArtiklZapreminaFlase, setNewArtiklZapreminaFlase] = useState<string>("");
  const [newArtiklPocetnoStanje, setNewArtiklPocetnoStanje] = useState<string>("");
  const [error, setError] = useState<string>("");

  // ---- Automatski izračun nabavne cijene po dozi za žestoka pića ----
  const calculateNabavnaPoDozi = () => {
    const flasaL = parseFloat(newArtiklZapreminaFlase) || 1; // default 1L
    const nabavnaFlase = parseFloat(newArtiklNabavnaCijenaFlase) || 0;
    const dozaL = parseFloat(newArtiklZestokoKolicina) || 0.03;
    return (nabavnaFlase / flasaL) * dozaL;
  };

  // ---- Sinkronizacija cijena za žestoka pića ----
  useEffect(() => {
    if (newArtiklJeZestoko) {
      setNewArtiklCijena(newArtiklProizvodnaCijena);
      setNewArtiklNabavnaCijena(calculateNabavnaPoDozi().toFixed(2));
    } else {
      setNewArtiklCijena("");
      setNewArtiklNabavnaCijena("");
    }
  }, [
    newArtiklJeZestoko,
    newArtiklProizvodnaCijena,
    newArtiklNabavnaCijenaFlase,
    newArtiklZapreminaFlase,
    newArtiklZestokoKolicina,
  ]);

  // ---- Dodavanje artikla ----
  const addArtikl = () => {
    if (!newArtiklNaziv.trim()) {
      setError("Naziv artikla je obavezan!");
      return;
    }
    if (!newArtiklCijena || parseFloat(newArtiklCijena) <= 0) {
      setError("Unesite valjanu prodajnu cijenu!");
      return;
    }
    if (!newArtiklNabavnaCijena || parseFloat(newArtiklNabavnaCijena) < 0) {
      setError("Unesite valjanu nabavnu cijenu!");
      return;
    }
    if (!newArtiklPocetnoStanje || parseFloat(newArtiklPocetnoStanje) < 0) {
      setError("Unesite valjanu početnu količinu!");
      return;
    }
    if (newArtiklJeZestoko && (!newArtiklProizvodnaCijena || parseFloat(newArtiklProizvodnaCijena) < 0)) {
      setError("Unesite valjanu proizvodnu cijenu za žestoko piće!");
      return;
    }
    if (newArtiklJeZestoko && (!newArtiklNabavnaCijenaFlase || parseFloat(newArtiklNabavnaCijenaFlase) < 0)) {
      setError("Unesite valjanu nabavnu cijenu flaše za žestoko piće!");
      return;
    }
    if (newArtiklJeZestoko && (!newArtiklZapreminaFlase || parseFloat(newArtiklZapreminaFlase) <= 0)) {
      setError("Unesite valjanu zapreminu flaše za žestoko piće!");
      return;
    }
    if (cjenovnik.some((artikl) => artikl.naziv.toLowerCase() === newArtiklNaziv.trim().toLowerCase())) {
      setError("Artikl s tim nazivom već postoji!");
      return;
    }

    const noviArtikl: Artikl = {
      naziv: newArtiklNaziv.trim(),
      cijena: parseFloat(newArtiklCijena) || 0,
      nabavnaCijena: newArtiklJeZestoko ? calculateNabavnaPoDozi() : parseFloat(newArtiklNabavnaCijena) || 0,
      pocetnoStanje: parseFloat(newArtiklPocetnoStanje) || 0,
      jeZestoko: newArtiklJeZestoko,
      ...(newArtiklJeZestoko
        ? {
            zestokoKolicina: parseFloat(newArtiklZestokoKolicina) || 0.03,
            proizvodnaCijena: parseFloat(newArtiklProizvodnaCijena) || 0,
            nabavnaCijenaFlase: parseFloat(newArtiklNabavnaCijenaFlase) || 0,
            zapreminaFlase: parseFloat(newArtiklZapreminaFlase) || 1,
          }
        : {}),
    };

    setCjenovnik([...cjenovnik, noviArtikl]);
    setNewArtiklNaziv("");
    setNewArtiklCijena("");
    setNewArtiklNabavnaCijena("");
    setNewArtiklJeZestoko(false);
    setNewArtiklZestokoKolicina("0.03");
    setNewArtiklProizvodnaCijena("");
    setNewArtiklNabavnaCijenaFlase("");
    setNewArtiklZapreminaFlase("");
    setNewArtiklPocetnoStanje("");
    setError("");
  };

  // ---- Brisanje artikla ----
  const deleteArtikl = (naziv: string) => {
    setCjenovnik(cjenovnik.filter((artikl) => artikl.naziv !== naziv));
  };

  return (
    <div style={containerStyle}>
      <style jsx>{`
        input.no-spin::-webkit-inner-spin-button,
        input.no-spin::-webkit-outer-spin-button {
          display: none;
        }
        button:hover {
          background-color: #2563eb;
        }
        .delete-button:hover {
          color: #b91c1c;
        }
      `}</style>

      <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#1f2937", marginBottom: "24px" }}>
        Cjenovnik
      </h1>

      {/* Obrazac za dodavanje artikla */}
      <div
        style={{
          marginBottom: "20px",
          background: "#ffffff",
          padding: "16px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h2 style={{ fontSize: "18px", fontWeight: 500, color: "#1f2937", marginBottom: "16px" }}>
          Dodaj novi artikal
        </h2>
        {error && <div style={errorStyle}>{error}</div>}
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
          <input
            type="text"
            placeholder="Naziv artikla"
            value={newArtiklNaziv}
            onChange={(e) => setNewArtiklNaziv(e.target.value)}
            style={formInputStyle}
          />
          <input
            type="number"
            step="0.01"
            placeholder="Prodajna cijena"
            value={newArtiklCijena}
            onChange={(e) => setNewArtiklCijena(e.target.value)}
            style={newArtiklJeZestoko ? disabledInputStyle : formInputStyle}
            disabled={newArtiklJeZestoko}
            className="no-spin"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Nabavna cijena"
            value={newArtiklNabavnaCijena}
            onChange={(e) => setNewArtiklNabavnaCijena(e.target.value)}
            style={newArtiklJeZestoko ? disabledInputStyle : formInputStyle}
            disabled={newArtiklJeZestoko}
            className="no-spin"
          />
          <input
            type="number"
            step={newArtiklJeZestoko ? "0.01" : "1"}
            placeholder={newArtiklJeZestoko ? "Količina (L)" : "Količina (kom)"}
            value={newArtiklPocetnoStanje}
            onChange={(e) => setNewArtiklPocetnoStanje(e.target.value)}
            style={formInputStyle}
            className="no-spin"
          />
          <div style={{ display: "flex", alignItems: "center", marginRight: "8px" }}>
            <input
              type="checkbox"
              checked={newArtiklJeZestoko}
              onChange={(e) => setNewArtiklJeZestoko(e.target.checked)}
              style={checkboxStyle}
            />
            <span style={{ fontSize: "14px", color: "#374151" }}>Žestoko piće</span>
          </div>
          {newArtiklJeZestoko && (
            <>
              <select
                value={newArtiklZestokoKolicina}
                onChange={(e) => setNewArtiklZestokoKolicina(e.target.value)}
                style={selectStyle}
              >
                <option value="0.03">0.03 L</option>
                <option value="0.04">0.04 L</option>
                <option value="0.05">0.05 L</option>
              </select>
              <input
                type="number"
                step="0.01"
                placeholder="Proizvodna cijena po dozi"
                value={newArtiklProizvodnaCijena}
                onChange={(e) => setNewArtiklProizvodnaCijena(e.target.value)}
                style={formInputStyle}
                className="no-spin"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Nabavna cijena flaše"
                value={newArtiklNabavnaCijenaFlase}
                onChange={(e) => setNewArtiklNabavnaCijenaFlase(e.target.value)}
                style={formInputStyle}
                className="no-spin"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Zapremina flaše (L)"
                value={newArtiklZapreminaFlase}
                onChange={(e) => setNewArtiklZapreminaFlase(e.target.value)}
                style={formInputStyle}
                className="no-spin"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Nabavna cijena po dozi"
                value={calculateNabavnaPoDozi().toFixed(2)}
                disabled
                style={formInputStyle}
                className="no-spin"
              />
            </>
          )}
          <button style={buttonStyle} onClick={addArtikl}>
            <FaPlus /> Dodaj
          </button>
        </div>
      </div>

      {/* Lista artikala */}
      <h2 style={{ fontSize: "18px", fontWeight: 500, color: "#1f2937", marginBottom: "16px" }}>
        Lista artikala
      </h2>
      {cjenovnik.length === 0 ? (
        <p style={{ fontSize: "14px", color: "#6b7280", textAlign: "center", padding: "16px" }}>
          Nema artikala u cjenovniku.
        </p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Artikal</th>
              <th style={thStyle}>Prodajna cijena</th>
              <th style={thStyle}>Nabavna cijena</th>
              <th style={thStyle}>Početna količina</th>
              <th style={thStyle}>Žestoko Količina (L)</th>
              <th style={thStyle}>Proizvodna Cijena</th>
              <th style={thStyle}>Akcija</th>
            </tr>
          </thead>
          <tbody>
            {cjenovnik.map((artikl) => (
              <tr key={artikl.naziv}>
                <td style={tdStyle}>{artikl.naziv}</td>
                <td style={tdStyle}>{artikl.cijena.toFixed(2)}</td>
                <td style={tdStyle}>{artikl.nabavnaCijena.toFixed(2)}</td>
                <td style={tdStyle}>
                  {artikl.pocetnoStanje.toFixed(artikl.jeZestoko ? 2 : 0)}
                  {artikl.jeZestoko ? " L" : " kom"}
                </td>
                <td style={tdStyle}>{artikl.jeZestoko ? (artikl.zestokoKolicina || 0).toFixed(2) : "-"}</td>
                <td style={tdStyle}>{artikl.jeZestoko ? (artikl.proizvodnaCijena || 0).toFixed(2) : "-"}</td>
                <td style={tdStyle}>
                  <button
                    style={deleteButtonStyle}
                    onClick={() => deleteArtikl(artikl.naziv)}
                    className="delete-button"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}