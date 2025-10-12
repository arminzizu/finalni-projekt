"use client";

import React, { useState, useEffect, useRef } from "react";

// ---- Tipovi ----
type ArhiviraniArtikal = {
  naziv: string;
  cijena?: number;
  pocetnoStanje?: number;
  ulaz?: number;
  ukupno?: number;
  utroseno?: number;
  krajnjeStanje?: number;
  vrijednostKM: number;
  zestokoKolicina?: number;
  proizvodnaCijena?: number;
};

type Rashod = {
  naziv: string;
  cijena: number;
  placeno?: boolean;
};

type Prihod = {
  naziv: string;
  cijena: number;
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

const buttonStyle: React.CSSProperties = {
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
};

const deleteButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  background: "#dc2626",
};

const editFormStyle: React.CSSProperties = {
  background: "#fff",
  padding: "16px",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  marginTop: "16px",
};

const inputStyle: React.CSSProperties = {
  padding: "8px",
  border: "1px solid #e5e7eb",
  borderRadius: "6px",
  fontSize: "14px",
  marginRight: "8px",
  width: "200px",
};

const checkboxStyle: React.CSSProperties = {
  marginRight: "8px",
};

const obracunContainerStyle: React.CSSProperties = {
  marginBottom: "32px",
  border: "2px solid #e5e7eb",
  borderRadius: "12px",
  padding: "16px",
  background: "#f9fafb",
};

// ---- Glavna komponenta ----
export default function ArhivaPage() {
  const [arhiva, setArhiva] = useState<ArhiviraniObracun[]>([]);
  const [editingObracunDatum, setEditingObracunDatum] = useState<string | null>(null);
  const [editedRashodi, setEditedRashodi] = useState<Rashod[]>([]);
  const [editedPrihodi, setEditedPrihodi] = useState<Prihod[]>([]);
  const obracunRefs = useRef<{ [key: string]: React.RefObject<HTMLDivElement | null> }>({});

  // Učitavanje arhive iz localStorage
  useEffect(() => {
    const savedArhiva = localStorage.getItem("arhivaObracuna");
    if (savedArhiva) {
      const parsedArhiva: ArhiviraniObracun[] = JSON.parse(savedArhiva)
        .map((item: any) => ({
          ...item,
          prihodi: item.prihodi ?? [],
          ukupnoPrihod: item.ukupnoPrihod ?? 0,
        }))
        .sort((a: ArhiviraniObracun, b: ArhiviraniObracun) => {
          const dateA = new Date(a.datum.split(".").reverse().join("-")).getTime();
          const dateB = new Date(b.datum.split(".").reverse().join("-")).getTime();
          return dateB - dateA;
        });
      setArhiva(parsedArhiva);
      parsedArhiva.forEach((item) => {
        if (!obracunRefs.current[item.datum]) {
          obracunRefs.current[item.datum] = React.createRef<HTMLDivElement>();
        }
      });
    }
  }, []);

  // Spremanje arhive u localStorage i slanje događaja
  useEffect(() => {
    if (arhiva.length > 0) {
      localStorage.setItem("arhivaObracuna", JSON.stringify(arhiva));
      window.dispatchEvent(new Event("arhivaChanged"));
    }
  }, [arhiva]);

  // Brisanje obračuna
  const deleteObracun = (datum: string) => {
    if (window.confirm(`Jeste li sigurni da želite obrisati obračun za ${datum}?`)) {
      setArhiva(arhiva.filter((item) => item.datum !== datum));
      delete obracunRefs.current[datum];
      setEditingObracunDatum(null);
    }
  };

  // Početak uređivanja obračuna
  const startEditingObracun = (datum: string, rashodi: Rashod[], prihodi: Prihod[]) => {
    setEditingObracunDatum(datum);
    setEditedRashodi(rashodi.map(r => ({ ...r, placeno: r.placeno ?? false })));
    setEditedPrihodi([...prihodi]);
  };

  // Promjena rashoda u obrascu
  const handleRashodChange = (index: number, field: keyof Rashod, value: string | boolean) => {
    const updatedRashodi = [...editedRashodi];
    if (field === "naziv") {
      updatedRashodi[index].naziv = value as string;
    } else if (field === "cijena") {
      updatedRashodi[index].cijena = parseFloat(value as string) || 0;
    } else if (field === "placeno") {
      updatedRashodi[index].placeno = value as boolean;
    }
    setEditedRashodi(updatedRashodi);
  };

  // Promjena prihoda u obrascu
  const handlePrihodChange = (index: number, field: keyof Prihod, value: string) => {
    const updatedPrihodi = [...editedPrihodi];
    if (field === "naziv") {
      updatedPrihodi[index].naziv = value;
    } else if (field === "cijena") {
      updatedPrihodi[index].cijena = parseFloat(value) || 0;
    }
    setEditedPrihodi(updatedPrihodi);
  };

  // Spremanje uređenih rashoda i prihoda
  const saveEditedObracun = (datum: string) => {
    const updatedArhiva = arhiva
      .map((item) => {
        if (item.datum === datum) {
          const ukupnoRashod = editedRashodi.reduce((sum, r) => sum + r.cijena, 0);
          const ukupnoPrihod = editedPrihodi.reduce((sum, p) => sum + p.cijena, 0);
          return {
            ...item,
            rashodi: editedRashodi,
            prihodi: editedPrihodi,
            ukupnoRashod,
            ukupnoPrihod,
            neto: item.ukupnoArtikli + ukupnoPrihod - ukupnoRashod,
          };
        }
        return item;
      })
      .sort((a, b) => {
        const dateA = new Date(a.datum.split(".").reverse().join("-")).getTime();
        const dateB = new Date(b.datum.split(".").reverse().join("-")).getTime();
        return dateB - dateA;
      });
    setArhiva(updatedArhiva);
    setEditingObracunDatum(null);
    setEditedRashodi([]);
    setEditedPrihodi([]);
  };

  // Odustajanje od uređivanja
  const cancelEditing = () => {
    setEditingObracunDatum(null);
    setEditedRashodi([]);
    setEditedPrihodi([]);
  };

  return (
    <div style={containerStyle}>
      <style jsx>{`
        button:hover {
          background-color: #2563eb;
        }
        .delete-button:hover {
          background-color: #b91c1c;
        }
        .edit-button:hover {
          background-color: #059669;
        }
        @media (max-width: 768px) {
          div[style*='padding: 24px'] {
            padding: 15px; /* Smanjen padding na mobilu */
          }
          h1 {
            font-size: 20px; /* Smanjen font za naslove */
          }
          table {
            overflow-x: auto; /* Horizontalni scroll za tablice */
            display: block;
          }
          th, td {
            font-size: 12px; /* Smanjen font za tablice */
            padding: 10px; /* Smanjen padding za ćelije */
          }
          button {
            width: 100%;
            margin: 5px 0; /* Kompaktniji razmak */
            padding: 8px;
            font-size: 14px; /* Smanjen font za dugmadi */
            min-height: 48px; /* Minimalna visina za touch target */
          }
          div[style*='display: flex'] {
            flex-direction: column; /* Stack-anje elemenata vertikalno */
            gap: 8px;
          }
          input {
            width: 100%;
            margin: 5px 0;
            padding: 8px;
            font-size: 14px;
          }
          .edit-form {
            padding: 10px; /* Smanjen padding za edit formu */
          }
        }
      `}</style>

      <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#1f2937", marginBottom: "24px" }}>
        Arhiva
      </h1>

      {arhiva.length === 0 ? (
        <p style={{ fontSize: "14px", color: "#6b7280", textAlign: "center", padding: "16px" }}>
          Nema arhiviranih obračuna.
        </p>
      ) : (
        <div>
          {arhiva.map((item, index) => (
            <div
              key={index}
              ref={obracunRefs.current[item.datum]!}
              style={obracunContainerStyle}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#1f2937" }}>
                  Obračun - {item.datum}
                </h2>
                <div>
                  <button
                    style={{ ...buttonStyle, background: "#10b981" }}
                    className="edit-button"
                    onClick={() => startEditingObracun(item.datum, item.rashodi, item.prihodi)}
                  >
                    Uredi obračun
                  </button>
                  <button
                    style={deleteButtonStyle}
                    className="delete-button"
                    onClick={() => deleteObracun(item.datum)}
                  >
                    Obriši obračun
                  </button>
                </div>
              </div>

              {/* Obrazac za uređivanje rashoda i prihoda */}
              {editingObracunDatum === item.datum && (
                <div style={editFormStyle} className="edit-form">
                  <h3 style={{ fontSize: "16px", fontWeight: 500, marginBottom: "12px" }}>
                    Uređivanje rashoda
                  </h3>
                  {editedRashodi.map((rashod, i) => (
                    <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
                      <input
                        type="text"
                        value={rashod.naziv}
                        onChange={(e) => handleRashodChange(i, "naziv", e.target.value)}
                        style={inputStyle}
                        placeholder="Naziv rashoda"
                      />
                      <input
                        type="number"
                        value={rashod.cijena}
                        onChange={(e) => handleRashodChange(i, "cijena", e.target.value)}
                        style={inputStyle}
                        placeholder="Cijena"
                        step="0.01"
                      />
                      <label style={{ display: "flex", alignItems: "center", fontSize: "14px" }}>
                        <input
                          type="checkbox"
                          checked={rashod.placeno ?? false}
                          onChange={(e) => handleRashodChange(i, "placeno", e.target.checked)}
                          style={checkboxStyle}
                        />
                        Plaćeno
                      </label>
                    </div>
                  ))}
                  <h3 style={{ fontSize: "16px", fontWeight: 500, marginBottom: "12px", marginTop: "16px" }}>
                    Uređivanje prihoda
                  </h3>
                  {editedPrihodi.map((prihod, i) => (
                    <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
                      <input
                        type="text"
                        value={prihod.naziv}
                        onChange={(e) => handlePrihodChange(i, "naziv", e.target.value)}
                        style={inputStyle}
                        placeholder="Naziv prihoda"
                      />
                      <input
                        type="number"
                        value={prihod.cijena}
                        onChange={(e) => handlePrihodChange(i, "cijena", e.target.value)}
                        style={inputStyle}
                        placeholder="Cijena"
                        step="0.01"
                      />
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                    <button
                      style={buttonStyle}
                      onClick={() => saveEditedObracun(item.datum)}
                    >
                      Spremi
                    </button>
                    <button
                      style={{ ...buttonStyle, background: "#6b7280" }}
                      onClick={cancelEditing}
                    >
                      Odustani
                    </button>
                  </div>
                </div>
              )}

              {/* Artikli */}
              <h3 style={{ fontSize: "16px", fontWeight: 500, color: "#1f2937", marginBottom: "8px" }}>
                Artikli
              </h3>
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
                  {item.artikli.map((a, i) => (
                    <tr key={i}>
                      <td style={tdStyle}>{a.naziv}</td>
                      <td style={tdStyle}>{a.cijena?.toFixed(2) ?? "-"}</td>
                      <td style={tdStyle}>{a.zestokoKolicina?.toFixed(3) ?? "-"}</td>
                      <td style={tdStyle}>{a.proizvodnaCijena?.toFixed(2) ?? "-"}</td>
                      <td style={tdStyle}>{a.pocetnoStanje ?? "-"}</td>
                      <td style={tdStyle}>{a.ulaz ?? "-"}</td>
                      <td style={tdStyle}>{a.ukupno ?? "-"}</td>
                      <td style={tdStyle}>{a.utroseno ?? "-"}</td>
                      <td style={tdStyle}>{a.krajnjeStanje ?? "-"}</td>
                      <td style={tdStyle}>{a.vrijednostKM.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Rashodi */}
              <h3 style={{ fontSize: "16px", fontWeight: 500, color: "#1f2937", marginBottom: "8px" }}>
                Rashodi
              </h3>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Naziv</th>
                    <th style={thStyle}>Cijena</th>
                    <th style={thStyle}>Plaćeno</th>
                  </tr>
                </thead>
                <tbody>
                  {item.rashodi.map((r, i) => (
                    <tr key={i}>
                      <td style={tdStyle}>{r.naziv}</td>
                      <td style={tdStyle}>{r.cijena.toFixed(2)}</td>
                      <td style={tdStyle}>{r.placeno ? "Da" : "Ne"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Prihodi */}
              <h3 style={{ fontSize: "16px", fontWeight: 500, color: "#1f2937", marginBottom: "8px" }}>
                Prihodi
              </h3>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Naziv</th>
                    <th style={thStyle}>Cijena</th>
                  </tr>
                </thead>
                <tbody>
                  {item.prihodi.map((p, i) => (
                    <tr key={i}>
                      <td style={tdStyle}>{p.naziv}</td>
                      <td style={tdStyle}>{p.cijena.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Ukupno */}
              <div style={{ fontSize: "16px", color: "#1f2937", marginTop: "16px", fontWeight: 600 }}>
                <div style={{ marginBottom: "12px", color: "#0284c7" }}>
                  <strong>Ukupno artikli:</strong> {item.ukupnoArtikli.toFixed(2)} KM
                </div>
                <div style={{ marginBottom: "12px", color: "#dc2626" }}>
                  <strong>Ukupno rashod:</strong> {item.ukupnoRashod.toFixed(2)} KM
                </div>
                <div style={{ marginBottom: "12px", color: "#15803d" }}>
                  <strong>Ukupno prihod:</strong> {item.ukupnoPrihod.toFixed(2)} KM
                </div>
                <div style={{ color: item.neto >= 0 ? "#15803d" : "#dc2626" }}>
                  <strong>Neto:</strong> {item.neto.toFixed(2)} KM
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}