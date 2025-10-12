"use client";

import React, { useState, useEffect } from "react";
import { useCjenovnik } from "../context/CjenovnikContext";

// ---- Tipovi ----
type Artikal = {
  naziv: string;
  cijena: number;
  pocetnoStanje: number;
  ulaz: number;
  ukupno: number;
  utroseno: number;
  krajnjeStanje: number;
  vrijednostKM: number;
  zestokoKolicina?: number;
  proizvodnaCijena?: number;
  isKrajnjeSet: boolean;
};

type Rashod = {
  naziv: string;
  cijena: number;
};

type Prihod = {
  naziv: string;
  cijena: number;
};

type ArhiviraniArtikal = {
  naziv: string;
  cijena: number;
  pocetnoStanje: number;
  ulaz: number;
  ukupno: number;
  utroseno: number;
  krajnjeStanje: number;
  vrijednostKM: number;
  zestokoKolicina?: number;
  proizvodnaCijena?: number;
};

type ArhiviraniObracun = {
  datum: string;
  ukupnoArtikli: number;
  ukupnoRashod: number;
  ukupnoPrihod: number;
  neto: number;
  artikli: ArhiviraniArtikal[];
  rashodi: Rashod[];
  prihodi: Prihod[];
};

// ---- CSS Stilovi ----
const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "separate" as const,
  borderSpacing: 0,
  background: "#ffffff",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  marginBottom: "20px",
};

const thStyle: React.CSSProperties = {
  padding: "12px",
  textAlign: "left" as const,
  background: "#f8fafc",
  color: "#1f2937",
  fontSize: "14px",
  fontWeight: 600,
  borderBottom: "1px solid #e5e7eb",
};

const tdStyle: React.CSSProperties = {
  padding: "12px",
  textAlign: "left" as const,
  borderBottom: "1px solid #f3f4f6",
  fontSize: "14px",
  color: "#374151",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "80px",
  padding: "8px",
  border: "1px solid #e5e7eb",
  borderRadius: "6px",
  textAlign: "center",
  fontSize: "14px",
  background: "#fff",
  transition: "border-color 0.2s ease-in-out",
  outline: "none",
  appearance: "none",
  MozAppearance: "textfield",
  WebkitAppearance: "none",
};

const dateInputStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "160px",
  padding: "8px",
  border: "1px solid #e5e7eb",
  borderRadius: "6px",
  fontSize: "14px",
  outline: "none",
  background: "#fff",
};

const containerStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "16px",
  fontFamily: "'Inter', sans-serif",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "160px",
  padding: "8px 16px",
  background: "#3b82f6",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: 500,
  transition: "background-color 0.2s ease-in-out",
  marginRight: "8px",
  marginBottom: "8px",
};

const saveButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  background: "#15803d",
};

const editButtonStyle: React.CSSProperties = {
  padding: "8px",
  background: "none",
  color: "#3b82f6",
  border: "none",
  cursor: "pointer",
  fontSize: "14px",
};

const deleteButtonStyle: React.CSSProperties = {
  padding: "8px",
  background: "none",
  color: "#dc2626",
  border: "none",
  cursor: "pointer",
  fontSize: "14px",
};

const cancelButtonStyle: React.CSSProperties = {
  padding: "8px",
  background: "none",
  color: "#dc2626",
  border: "none",
  cursor: "pointer",
  fontSize: "14px",
};

const rashodInputStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "160px",
  padding: "8px",
  border: "1px solid #e5e7eb",
  borderRadius: "6px",
  fontSize: "14px",
  outline: "none",
  marginRight: "8px",
  marginBottom: "8px",
};

// ---- Glavna komponenta ----
export default function ObracunPage() {
  const { cjenovnik, setCjenovnik } = useCjenovnik();
  const [artikli, setArtikli] = useState<Artikal[]>([]);
  const [rashodi, setRashodi] = useState<Rashod[]>([]);
  const [prihodi, setPrihodi] = useState<Prihod[]>([]);
  const [newRashod, setNewRashod] = useState<Rashod>({ naziv: "", cijena: 0 });
  const [newPrihod, setNewPrihod] = useState<Prihod>({ naziv: "", cijena: 0 });
  const [editRashodIndex, setEditRashodIndex] = useState<number | null>(null);
  const [editPrihodIndex, setEditPrihodIndex] = useState<number | null>(null);
  const [editRashod, setEditRashod] = useState<Rashod>({ naziv: "", cijena: 0 });
  const [editPrihod, setEditPrihod] = useState<Prihod>({ naziv: "", cijena: 0 });
  const [trenutniDatum, setTrenutniDatum] = useState<Date>(new Date());

  // Inicijalizacija artikala na osnovu cjenovnika
  useEffect(() => {
    const inicijalniArtikli = cjenovnik.map((item) => ({
      naziv: item.naziv,
      cijena: item.cijena,
      pocetnoStanje: item.naziv.toLowerCase().includes("kafa") ? 0 : item.pocetnoStanje,
      ulaz: item.naziv.toLowerCase().includes("kafa") ? 0 : 0,
      ukupno: item.naziv.toLowerCase().includes("kafa") ? 0 : item.pocetnoStanje,
      utroseno: 0,
      krajnjeStanje: 0,
      vrijednostKM: 0,
      zestokoKolicina: item.zestokoKolicina,
      proizvodnaCijena: item.proizvodnaCijena,
      isKrajnjeSet: false,
    }));
    setArtikli(inicijalniArtikli);
  }, [cjenovnik]);

  const formatirajDatum = (datum: Date): string => {
    const dan = datum.getDate().toString().padStart(2, "0");
    const mjesec = (datum.getMonth() + 1).toString().padStart(2, "0");
    const godina = datum.getFullYear();
    return `${dan}.${mjesec}.${godina}.`;
  };

  // Funkcija za promjenu datuma
  const handleDatumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(e.target.value);
    if (!isNaN(selectedDate.getTime())) {
      setTrenutniDatum(selectedDate);
    }
  };

  // Funkcije za update artikala
  const handleUlazChange = (index: number, value: number) => {
    setArtikli((prev) =>
      prev.map((a, i) =>
        i === index
          ? {
              ...a,
              ulaz: value,
              ukupno: a.pocetnoStanje + value,
              ...(a.krajnjeStanje > 0
                ? {
                    utroseno: a.pocetnoStanje + value - a.krajnjeStanje,
                    vrijednostKM: a.zestokoKolicina
                      ? ((a.pocetnoStanje + value - a.krajnjeStanje) / a.zestokoKolicina) * a.cijena
                      : (a.pocetnoStanje + value - a.krajnjeStanje) * a.cijena,
                  }
                : {}),
            }
          : a
      )
    );
  };

  const handleKrajnjeStanjeChange = (index: number, value: string) => {
    setArtikli((prev) =>
      prev.map((a, i) => {
        if (i !== index) return a;

        const isSet = value.trim() !== "";
        const broj = isSet ? Number(value) : 0;

        if (a.naziv.toLowerCase().includes("kafa")) {
          const utroseno = broj;
          const vrijednostKM = utroseno * a.cijena;
          return {
            ...a,
            krajnjeStanje: broj,
            utroseno,
            vrijednostKM,
            isKrajnjeSet: isSet,
          };
        } else {
          const utroseno = isSet ? Math.max(a.ukupno - broj, 0) : 0;
          const vrijednostKM = a.zestokoKolicina
            ? (utroseno / a.zestokoKolicina) * a.cijena
            : utroseno * a.cijena;
          return {
            ...a,
            krajnjeStanje: broj,
            utroseno,
            vrijednostKM,
            isKrajnjeSet: isSet,
          };
        }
      })
    );
  };

  const handleAddRashod = () => {
    if (newRashod.naziv && newRashod.cijena >= 0) {
      setRashodi([...rashodi, newRashod]);
      setNewRashod({ naziv: "", cijena: 0 });
    }
  };

  const handleAddPrihod = () => {
    if (newPrihod.naziv && newPrihod.cijena >= 0) {
      setPrihodi([...prihodi, newPrihod]);
      setNewPrihod({ naziv: "", cijena: 0 });
    }
  };

  const handleEditRashod = (index: number) => {
    setEditRashodIndex(index);
    setEditRashod({ ...rashodi[index] });
  };

  const handleEditPrihod = (index: number) => {
    setEditPrihodIndex(index);
    setEditPrihod({ ...prihodi[index] });
  };

  const handleDeleteRashod = (index: number) => {
    setRashodi((prev) => prev.filter((_, i) => i !== index));
    if (editRashodIndex === index) {
      setEditRashodIndex(null);
      setEditRashod({ naziv: "", cijena: 0 });
    }
  };

  const handleDeletePrihod = (index: number) => {
    setPrihodi((prev) => prev.filter((_, i) => i !== index));
    if (editPrihodIndex === index) {
      setEditPrihodIndex(null);
      setEditPrihod({ naziv: "", cijena: 0 });
    }
  };

  const handleSaveEditRashod = () => {
    if (editRashodIndex !== null && editRashod.naziv && editRashod.cijena >= 0) {
      setRashodi((prev) =>
        prev.map((r, i) => (i === editRashodIndex ? { ...editRashod } : r))
      );
      setEditRashodIndex(null);
      setEditRashod({ naziv: "", cijena: 0 });
    }
  };

  const handleSaveEditPrihod = () => {
    if (editPrihodIndex !== null && editPrihod.naziv && editPrihod.cijena >= 0) {
      setPrihodi((prev) =>
        prev.map((p, i) => (i === editPrihodIndex ? { ...editPrihod } : p))
      );
      setEditPrihodIndex(null);
      setEditPrihod({ naziv: "", cijena: 0 });
    }
  };

  const handleCancelEditRashod = () => {
    setEditRashodIndex(null);
    setEditRashod({ naziv: "", cijena: 0 });
  };

  const handleCancelEditPrihod = () => {
    setEditPrihodIndex(null);
    setEditPrihod({ naziv: "", cijena: 0 });
  };

  const handleSaveObracun = () => {
    const ukupnoArtikli = artikli.reduce((sum, a) => sum + a.vrijednostKM, 0);
    const ukupnoRashod = rashodi.reduce((sum, r) => sum + r.cijena, 0);
    const ukupnoPrihod = prihodi.reduce((sum, p) => sum + p.cijena, 0);
    const neto = ukupnoArtikli + ukupnoPrihod - ukupnoRashod;

    const arhiviraniObracun: ArhiviraniObracun = {
      datum: formatirajDatum(trenutniDatum),
      ukupnoArtikli,
      ukupnoRashod,
      ukupnoPrihod,
      neto,
      artikli: artikli.map((a) => ({
        naziv: a.naziv,
        cijena: a.cijena,
        pocetnoStanje: a.pocetnoStanje,
        ulaz: a.ulaz,
        ukupno: a.ukupno,
        utroseno: a.utroseno,
        krajnjeStanje: a.krajnjeStanje,
        vrijednostKM: a.vrijednostKM,
        zestokoKolicina: a.zestokoKolicina,
        proizvodnaCijena: a.proizvodnaCijena,
      })),
      rashodi,
      prihodi,
    };

    // Spremanje obračuna u arhivu
    if (typeof window !== "undefined") {
      const savedArhiva = localStorage.getItem("arhivaObracuna");
      const currentArhiva: ArhiviraniObracun[] = savedArhiva ? JSON.parse(savedArhiva) : [];
      const updatedArhiva = [arhiviraniObracun, ...currentArhiva];
      localStorage.setItem("arhivaObracuna", JSON.stringify(updatedArhiva));
    }

    // Ažuriranje cjenovnika u kontekstu
    setCjenovnik((prev) =>
      prev.map((item) => {
        const artikal = artikli.find((a) => a.naziv === item.naziv);
        if (!artikal) return item;
        const novoPocetnoStanje = artikal.naziv.toLowerCase().includes("kafa")
          ? 0
          : artikal.isKrajnjeSet
          ? artikal.krajnjeStanje
          : artikal.ukupno;
        return {
          ...item,
          pocetnoStanje: novoPocetnoStanje,
        };
      })
    );

    // Povećaj datum za jedan dan
    const noviDatum = new Date(trenutniDatum);
    noviDatum.setDate(noviDatum.getDate() + 1);
    setTrenutniDatum(noviDatum);

    // Resetiranje artikala za sljedeći dan
    setArtikli((prev) =>
      prev.map((a) => {
        if (a.naziv.toLowerCase().includes("kafa")) {
          return {
            ...a,
            pocetnoStanje: 0,
            ulaz: 0,
            ukupno: 0,
            utroseno: 0,
            krajnjeStanje: 0,
            vrijednostKM: 0,
            isKrajnjeSet: false,
          };
        } else {
          const novoPocetnoStanje = a.isKrajnjeSet ? a.krajnjeStanje : a.ukupno;
          return {
            ...a,
            pocetnoStanje: novoPocetnoStanje,
            ulaz: 0,
            ukupno: novoPocetnoStanje,
            utroseno: 0,
            krajnjeStanje: 0,
            vrijednostKM: 0,
            isKrajnjeSet: false,
          };
        }
      })
    );

    // Resetiranje rashoda i prihoda
    setRashodi([]);
    setPrihodi([]);
    setNewRashod({ naziv: "", cijena: 0 });
    setNewPrihod({ naziv: "", cijena: 0 });
    setEditRashodIndex(null);
    setEditPrihodIndex(null);
  };

  const ukupnoRashod = rashodi.reduce((sum, r) => sum + r.cijena, 0);
  const ukupnoPrihod = prihodi.reduce((sum, p) => sum + p.cijena, 0);
  const ukupnoArtikli = artikli.reduce((sum, a) => sum + a.vrijednostKM, 0);
  const neto = ukupnoArtikli + ukupnoPrihod - ukupnoRashod;

  const formatDateForInput = (datum: Date): string => {
    const godina = datum.getFullYear();
    const mjesec = (datum.getMonth() + 1).toString().padStart(2, "0");
    const dan = datum.getDate().toString().padStart(2, "0");
    return `${godina}-${mjesec}-${dan}`;
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
        .save-button:hover {
          background-color: #166534;
        }
        .edit-button:hover {
          color: #1d4ed8;
        }
        .delete-button:hover {
          color: #b91c1c;
        }
        .cancel-button:hover {
          color: #b91c1c;
        }
        @media (max-width: 768px) {
          /* Responsive container */
          div[style*="maxWidth: 1200px"] {
            padding: 8px;
          }
          /* Artikli table - switch to card layout */
          table:first-of-type {
            display: flex;
            flex-direction: column;
            overflow: visible;
          }
          table:first-of-type thead {
            display: none;
          }
          table:first-of-type tbody {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          table:first-of-type tr {
            display: flex;
            flex-direction: column;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            padding: 12px;
          }
          table:first-of-type td {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: none;
            font-size: 13px;
          }
          table:first-of-type td:before {
            content: attr(data-label);
            font-weight: 600;
            color: #1f2937;
            width: 50%;
          }
          table:first-of-type td input {
            max-width: 100%;
            width: 100%;
          }
          /* Rashodi and Prihodi tables */
          table:not(:first-of-type) {
            overflow-x: auto;
          }
          table:not(:first-of-type) th,
          table:not(:first-of-type) td {
            min-width: 120px;
            font-size: 13px;
            padding: 8px;
          }
          /* Inputs and buttons */
          input, button {
            width: 100%;
            max-width: 100%;
            margin-bottom: 8px;
            font-size: 13px;
          }
          input[type="date"] {
            max-width: 100%;
          }
          /* Flex layouts for forms */
          div[style*="display: flex"] {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }
          /* Headings and text */
          h1 {
            font-size: 20px;
            margin-bottom: 16px;
          }
          h2 {
            font-size: 16px;
            margin-bottom: 12px;
          }
          h3 {
            font-size: 14px;
            margin: 6px 0;
          }
        }
      `}</style>

      <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#1f2937", marginBottom: "24px" }}>
        Obračun
      </h1>

      <div style={{ marginBottom: "20px", display: "flex", alignItems: "center" }}>
        <label style={{ fontSize: "14px", color: "#1f2937", marginRight: "8px" }}>
          Datum obračuna:
        </label>
        <input
          type="date"
          value={formatDateForInput(trenutniDatum)}
          onChange={handleDatumChange}
          style={dateInputStyle}
        />
        <button style={saveButtonStyle} onClick={handleSaveObracun} className="save-button">
          Sačuvaj obračun
        </button>
      </div>

      {/* Artikli */}
      <h2 style={{ fontSize: "18px", fontWeight: 500, color: "#1f2937", marginBottom: "16px" }}>
        Artikli
      </h2>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Artikal</th>
            <th style={thStyle}>Cijena</th>
            <th style={thStyle}>Zestoko Količina (ml)</th>
            <th style={thStyle}>Proizvodna Cijena</th>
            <th style={thStyle}>Početno stanje</th>
            <th style={thStyle}>Ulaz</th>
            <th style={thStyle}>Ukupno</th>
            <th style={thStyle}>Utrošeno</th>
            <th style={thStyle}>Krajnje stanje</th>
            <th style={thStyle}>Vrijednost KM</th>
          </tr>
        </thead>
        <tbody>
          {artikli.map((a, index) => (
            <tr key={index}>
              <td style={tdStyle} data-label="Artikal">{a.naziv}</td>
              <td style={tdStyle} data-label="Cijena">{a.cijena.toFixed(2)}</td>
              <td style={tdStyle} data-label="Zestoko Količina (ml)">{a.zestokoKolicina ? a.zestokoKolicina.toFixed(3) : "-"}</td>
              <td style={tdStyle} data-label="Proizvodna Cijena">{a.proizvodnaCijena ? a.proizvodnaCijena.toFixed(2) : "-"}</td>
              <td style={tdStyle} data-label="Početno stanje">{a.pocetnoStanje}</td>
              <td style={tdStyle} data-label="Ulaz">
                <input
                  type="number"
                  value={a.ulaz === 0 ? "" : a.ulaz}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => handleUlazChange(index, Number(e.target.value) || 0)}
                  style={inputStyle}
                  className="no-spin"
                />
              </td>
              <td style={tdStyle} data-label="Ukupno">{a.ukupno}</td>
              <td style={tdStyle} data-label="Utrošeno">{a.utroseno}</td>
              <td style={tdStyle} data-label="Krajnje stanje">
                <input
                  type="number"
                  value={a.krajnjeStanje === 0 ? "" : a.krajnjeStanje}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => handleKrajnjeStanjeChange(index, e.target.value)}
                  style={inputStyle}
                  className="no-spin"
                />
              </td>
              <td style={tdStyle} data-label="Vrijednost KM">{a.vrijednostKM.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Rashodi */}
      <h2 style={{ fontSize: "18px", fontWeight: 500, color: "#1f2937", marginBottom: "16px" }}>
        Rashodi
      </h2>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Naziv</th>
            <th style={thStyle}>Cijena</th>
            <th style={thStyle}>Akcija</th>
          </tr>
        </thead>
        <tbody>
          {rashodi.map((r, index) => (
            <tr key={index}>
              {editRashodIndex === index ? (
                <>
                  <td style={tdStyle}>
                    <input
                      type="text"
                      value={editRashod.naziv}
                      onChange={(e) => setEditRashod({ ...editRashod, naziv: e.target.value })}
                      style={rashodInputStyle}
                    />
                  </td>
                  <td style={tdStyle}>
                    <input
                      type="number"
                      value={editRashod.cijena === 0 ? "" : editRashod.cijena}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setEditRashod({ ...editRashod, cijena: Number(e.target.value) || 0 })}
                      style={rashodInputStyle}
                      className="no-spin"
                    />
                  </td>
                  <td style={tdStyle}>
                    <button style={buttonStyle} onClick={handleSaveEditRashod}>
                      Spremi
                    </button>
                    <button style={cancelButtonStyle} onClick={handleCancelEditRashod} className="cancel-button">
                      Otkaži
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td style={tdStyle}>{r.naziv}</td>
                  <td style={tdStyle}>{r.cijena.toFixed(2)}</td>
                  <td style={tdStyle}>
                    <button
                      style={editButtonStyle}
                      onClick={() => handleEditRashod(index)}
                      className="edit-button"
                    >
                      Uredi
                    </button>
                    <button
                      style={deleteButtonStyle}
                      onClick={() => handleDeleteRashod(index)}
                      className="delete-button"
                    >
                      Izbriši
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: "20px", display: "flex", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Naziv rashoda"
          value={newRashod.naziv}
          onChange={(e) => setNewRashod({ ...newRashod, naziv: e.target.value })}
          style={rashodInputStyle}
        />
        <input
          type="number"
          placeholder="Cijena"
          value={newRashod.cijena === 0 ? "" : newRashod.cijena}
          onFocus={(e) => e.target.select()}
          onChange={(e) => setNewRashod({ ...newRashod, cijena: Number(e.target.value) || 0 })}
          style={rashodInputStyle}
          className="no-spin"
        />
        <button style={buttonStyle} onClick={handleAddRashod}>
          Dodaj rashod
        </button>
      </div>

      {/* Prihodi */}
      <h2 style={{ fontSize: "18px", fontWeight: 500, color: "#1f2937", marginBottom: "16px" }}>
        Prihodi
      </h2>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Naziv</th>
            <th style={thStyle}>Cijena</th>
            <th style={thStyle}>Akcija</th>
          </tr>
        </thead>
        <tbody>
          {prihodi.map((p, index) => (
            <tr key={index}>
              {editPrihodIndex === index ? (
                <>
                  <td style={tdStyle}>
                    <input
                      type="text"
                      value={editPrihod.naziv}
                      onChange={(e) => setEditPrihod({ ...editPrihod, naziv: e.target.value })}
                      style={rashodInputStyle}
                    />
                  </td>
                  <td style={tdStyle}>
                    <input
                      type="number"
                      value={editPrihod.cijena === 0 ? "" : editPrihod.cijena}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setEditPrihod({ ...editPrihod, cijena: Number(e.target.value) || 0 })}
                      style={rashodInputStyle}
                      className="no-spin"
                    />
                  </td>
                  <td style={tdStyle}>
                    <button style={buttonStyle} onClick={handleSaveEditPrihod}>
                      Spremi
                    </button>
                    <button style={cancelButtonStyle} onClick={handleCancelEditPrihod} className="cancel-button">
                      Otkaži
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td style={tdStyle}>{p.naziv}</td>
                  <td style={tdStyle}>{p.cijena.toFixed(2)}</td>
                  <td style={tdStyle}>
                    <button
                      style={editButtonStyle}
                      onClick={() => handleEditPrihod(index)}
                      className="edit-button"
                    >
                      Uredi
                    </button>
                    <button
                      style={deleteButtonStyle}
                      onClick={() => handleDeletePrihod(index)}
                      className="delete-button"
                    >
                      Izbriši
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: "20px", display: "flex", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Naziv prihoda"
          value={newPrihod.naziv}
          onChange={(e) => setNewPrihod({ ...newPrihod, naziv: e.target.value })}
          style={rashodInputStyle}
        />
        <input
          type="number"
          placeholder="Cijena"
          value={newPrihod.cijena === 0 ? "" : newPrihod.cijena}
          onFocus={(e) => e.target.select()}
          onChange={(e) => setNewPrihod({ ...newPrihod, cijena: Number(e.target.value) || 0 })}
          style={rashodInputStyle}
          className="no-spin"
        />
        <button style={buttonStyle} onClick={handleAddPrihod}>
          Dodaj prihod
        </button>
      </div>

      {/* Ukupno */}
      <div style={{ marginTop: "24px", fontSize: "16px", color: "#1f2937" }}>
        <h3 style={{ margin: "8px 0", fontWeight: 500 }}>
          Ukupno rashod: {ukupnoRashod.toFixed(2)} KM
        </h3>
        <h3 style={{ margin: "8px 0", fontWeight: 500 }}>
          Ukupno prihod: {ukupnoPrihod.toFixed(2)} KM
        </h3>
        <h3 style={{ margin: "8px 0", fontWeight: 500 }}>
          Ukupno artikli: {ukupnoArtikli.toFixed(2)} KM
        </h3>
        <h3
          style={{
            margin: "8px 0",
            fontWeight: 600,
            color: neto >= 0 ? "#15803d" : "#dc2626",
          }}
        >
          Neto: {neto.toFixed(2)} KM
        </h3>
      </div>
    </div>
  );
}