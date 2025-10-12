"use client";

import React, { useEffect, useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
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
};

type Obracun = {
  datum: string;
  artikli: Artikal[];
  rashodi: { naziv: string; cijena: number }[];
  prihodi: { naziv: string; cijena: number }[];
};

type ArtikalProfit = {
  naziv: string;
  nabavnaCijena: number;
  prodajnaCijena: number;
  kolicina: number;
  bruto: number;
  neto: number;
  profit: number;
  zestokoKolicina?: number;
};

type ObracunProfit = {
  datum: string;
  artikliProfit: ArtikalProfit[];
  ukupnoBruto: number;
  ukupnoNeto: number;
  ukupnoRashod: number;
};

type ArtiklProfitData = {
  datum: string;
  bruto: number; // prodajnaCijena * kolicina
  neto: number;  // (prodajnaCijena - nabavnaCijena) * kolicina
};

// ---- CSS ----
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
  marginBottom: "12px",
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

const summaryStyle: React.CSSProperties = {
  display: "flex",
  gap: "24px",
  marginTop: "12px",
  padding: "12px",
  background: "#f3f4f6",
  borderRadius: "6px",
};

const summaryItemStyle = (color: string): React.CSSProperties => ({
  fontSize: "14px",
  fontWeight: 600,
  color,
});

const buttonStyle: React.CSSProperties = {
  padding: "8px 16px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: 500,
  transition: "all 0.2s ease-in-out",
};

const formInputStyle: React.CSSProperties = {
  padding: "8px",
  border: "1px solid #e5e7eb",
  borderRadius: "6px",
  fontSize: "14px",
  outline: "none",
  width: "150px",
};

// ---- Filter komponenta ----
const FilterSection: React.FC<{
  filter: "trenutnaSedmica" | "proslaSedmica" | "prosliMjesec" | "custom";
  setFilter: (value: "trenutnaSedmica" | "proslaSedmica" | "prosliMjesec" | "custom") => void;
  customPeriod: { from: string; to: string };
  setCustomPeriod: (value: { from: string; to: string }) => void;
  label?: string;
}> = ({ filter, setFilter, customPeriod, setCustomPeriod, label = "Filter arhive" }) => (
  <div style={{ marginBottom: "20px", background: "#fff", padding: "16px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
    <h2 style={{ fontSize: "18px", fontWeight: 500, marginBottom: "12px" }}>{label}</h2>
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
      {["trenutnaSedmica", "proslaSedmica", "prosliMjesec", "custom"].map((f) => (
        <button
          key={f}
          onClick={() => setFilter(f as any)}
          style={{
            ...buttonStyle,
            backgroundColor: filter === f ? "#3b82f6" : "#e5e7eb",
            color: filter === f ? "#fff" : "#374151",
          }}
        >
          {f === "trenutnaSedmica" ? "Trenutna sedmica" :
           f === "proslaSedmica" ? "Prošla sedmica" :
           f === "prosliMjesec" ? "Prošli mjesec" :
           "Custom"}
        </button>
      ))}
      {filter === "custom" && (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="date" value={customPeriod.from} onChange={(e) => setCustomPeriod({ ...customPeriod, from: e.target.value })} style={formInputStyle} />
          <span>do</span>
          <input type="date" value={customPeriod.to} onChange={(e) => setCustomPeriod({ ...customPeriod, to: e.target.value })} style={formInputStyle} />
        </div>
      )}
    </div>
  </div>
);

// ---- Glavna komponenta ----
export default function ProfitPage() {
  const [obracuniProfit, setObracuniProfit] = useState<ObracunProfit[]>([]);
  const [filter, setFilter] = useState<"trenutnaSedmica" | "proslaSedmica" | "prosliMjesec" | "custom">("trenutnaSedmica");
  const [customPeriod, setCustomPeriod] = useState<{ from: string; to: string }>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });
  const [filteredObracuni, setFilteredObracuni] = useState<ObracunProfit[]>([]);
  const [selectedArtikl, setSelectedArtikl] = useState<string>("");
  const [artiklFilter, setArtiklFilter] = useState<"trenutnaSedmica" | "proslaSedmica" | "prosliMjesec" | "custom">("trenutnaSedmica");

  const { cjenovnik } = useCjenovnik();

  // ---- funkcija za učitavanje arhive i generisanje profita ----
  const loadArhiva = () => {
    const savedArhiva = localStorage.getItem("arhivaObracuna");
    if (savedArhiva && cjenovnik.length > 0) {
      const parsed: Obracun[] = JSON.parse(savedArhiva)
        .sort((a: Obracun, b: Obracun) => {
          const dateA = new Date(a.datum.split(".").reverse().join("-")).getTime();
          const dateB = new Date(b.datum.split(".").reverse().join("-")).getTime();
          return dateB - dateA; // Silazni redoslijed (najnoviji prvo)
        });

      const profiti: ObracunProfit[] = parsed.map((obracun) => {
        const artikliProfit: ArtikalProfit[] = obracun.artikli.map((a) => {
          const cjenovnikArtikl = cjenovnik.find((c) => c.naziv === a.naziv);
          const kolicina = a.zestokoKolicina ? a.utroseno / (a.zestokoKolicina || 0.03) : a.krajnjeStanje;
          const prodajna = a.cijena || 0;
          const nabavna = cjenovnikArtikl?.nabavnaCijena || 0;
          const bruto = prodajna * kolicina;
          const neto = (prodajna - nabavna) * kolicina;
          const profit = prodajna - nabavna;

          return {
            naziv: a.naziv,
            nabavnaCijena: nabavna,
            prodajnaCijena: prodajna,
            kolicina,
            bruto,
            neto,
            profit,
            zestokoKolicina: a.zestokoKolicina,
          };
        });

        const ukupnoRashod = (obracun.rashodi?.reduce((sum, r) => sum + r.cijena, 0) || 0) + 
                             (obracun.prihodi?.reduce((sum, p) => sum + p.cijena, 0) || 0);
        const ukupnoBruto = artikliProfit.reduce((sum, a) => sum + a.bruto, 0);
        const ukupnoNeto = artikliProfit.reduce((sum, a) => sum + a.neto, 0) - ukupnoRashod;

        return {
          datum: obracun.datum,
          artikliProfit,
          ukupnoBruto,
          ukupnoNeto,
          ukupnoRashod,
        };
      });

      setObracuniProfit(profiti);
    } else {
      setObracuniProfit([]);
    }
  };

  // ---- inicijalno učitavanje + listener za promjene arhive ----
  useEffect(() => {
    loadArhiva();
    const handler = () => loadArhiva();
    window.addEventListener("arhivaChanged", handler);
    return () => window.removeEventListener("arhivaChanged", handler);
  }, [cjenovnik]);

  // ---- filtriranje po periodu za glavni grafikon i tablice ----
  useEffect(() => {
    const danas = new Date();

    const filtered = obracuniProfit.filter((o) => {
      const [d, m, y] = o.datum.split(".").map(Number);
      const datumO = new Date(y, m - 1, d);

      if (filter === "trenutnaSedmica") {
        const firstDay = new Date(danas);
        firstDay.setDate(danas.getDate() - danas.getDay() + 1); // ponedeljak
        return datumO >= firstDay && datumO <= danas;
      }
      if (filter === "proslaSedmica") {
        const firstDayPrev = new Date(danas);
        firstDayPrev.setDate(danas.getDate() - danas.getDay() - 6); // ponedeljak prošle sedmice
        const lastDayPrev = new Date(danas);
        lastDayPrev.setDate(danas.getDate() - danas.getDay()); // nedelja prošle sedmice
        return datumO >= firstDayPrev && datumO <= lastDayPrev;
      }
      if (filter === "prosliMjesec") {
        const firstDayPrevMonth = new Date(danas.getFullYear(), danas.getMonth() - 1, 1);
        const lastDayPrevMonth = new Date(danas.getFullYear(), danas.getMonth(), 0);
        return datumO >= firstDayPrevMonth && datumO <= lastDayPrevMonth;
      }
      if (filter === "custom") {
        return datumO >= new Date(customPeriod.from) && datumO <= new Date(customPeriod.to);
      }
      return true;
    });

    setFilteredObracuni(filtered);
  }, [filter, customPeriod, obracuniProfit]);

  // ---- dobijanje svih artikala za dropdown ----
  const allArtikli = useMemo(() => {
    return [...new Set(obracuniProfit.flatMap((o) => o.artikliProfit.map((a) => a.naziv)))];
  }, [obracuniProfit]);

  // ---- agregacija podataka za grafikon profita po artiklu ----
  const aggregateArtiklProfitData = (
    selectedArtikl: string,
    selectedFilter: "trenutnaSedmica" | "proslaSedmica" | "prosliMjesec" | "custom"
  ): ArtiklProfitData[] => {
    let filteredData = obracuniProfit
      .map((o) => {
        const artikal = o.artikliProfit.find((a) => a.naziv === selectedArtikl);
        return {
          datum: o.datum,
          bruto: artikal ? artikal.bruto : 0, // prodajnaCijena * kolicina
          neto: artikal ? artikal.neto : 0,   // (prodajnaCijena - nabavnaCijena) * kolicina
        };
      })
      .filter((o) => o.bruto > 0 || o.neto > 0)
      .sort((a, b) => {
        const dateA = new Date(a.datum.split(".").reverse().join("-")).getTime();
        const dateB = new Date(b.datum.split(".").reverse().join("-")).getTime();
        return dateA - dateB; // Uzlazni redoslijed
      });

    const danas = new Date();

    if (selectedFilter === "trenutnaSedmica") {
      const firstDay = new Date(danas);
      firstDay.setDate(danas.getDate() - danas.getDay() + 1); // ponedeljak
      filteredData = filteredData.filter((o) => {
        const dTime = new Date(o.datum.split(".").reverse().join("-")).getTime();
        return dTime >= firstDay.getTime() && dTime <= danas.getTime();
      });
    } else if (selectedFilter === "proslaSedmica") {
      const firstDayPrev = new Date(danas);
      firstDayPrev.setDate(danas.getDate() - danas.getDay() - 6); // ponedeljak prošle sedmice
      const lastDayPrev = new Date(danas);
      lastDayPrev.setDate(danas.getDate() - danas.getDay()); // nedelja prošle sedmice
      filteredData = filteredData.filter((o) => {
        const dTime = new Date(o.datum.split(".").reverse().join("-")).getTime();
        return dTime >= firstDayPrev.getTime() && dTime <= lastDayPrev.getTime();
      });
    } else if (selectedFilter === "prosliMjesec") {
      const firstDayPrevMonth = new Date(danas.getFullYear(), danas.getMonth() - 1, 1);
      const lastDayPrevMonth = new Date(danas.getFullYear(), danas.getMonth(), 0);
      filteredData = filteredData.filter((o) => {
        const dTime = new Date(o.datum.split(".").reverse().join("-")).getTime();
        return dTime >= firstDayPrevMonth.getTime() && dTime <= lastDayPrevMonth.getTime();
      });
    } else if (selectedFilter === "custom") {
      const fromTime = new Date(customPeriod.from).getTime();
      const toTime = new Date(customPeriod.to).getTime();
      filteredData = filteredData.filter((o) => {
        const dTime = new Date(o.datum.split(".").reverse().join("-")).getTime();
        return dTime >= fromTime && dTime <= toTime;
      });
    }

    return filteredData.map((o) => ({
      datum: o.datum,
      bruto: Number(o.bruto),
      neto: Number(o.neto),
    }));
  };

  // ---- sortiranje podataka za glavni grafikon u uzlaznom redoslijedu ----
  const chartData = useMemo(() => {
    return [...filteredObracuni]
      .sort((a, b) => {
        const dateA = new Date(a.datum.split(".").reverse().join("-")).getTime();
        const dateB = new Date(b.datum.split(".").reverse().join("-")).getTime();
        return dateA - dateB; // Uzlazni redoslijed za grafikon (stariji prvo)
      })
      .map((o) => ({
        datum: o.datum,
        bruto: o.ukupnoBruto,
        neto: o.ukupnoNeto,
        rashod: o.ukupnoRashod,
      }));
  }, [filteredObracuni]);

  // ---- podaci za grafikon profita odabranog artikla ----
  const selectedArtiklData = aggregateArtiklProfitData(selectedArtikl, artiklFilter);

  // ---- ukupni bruto i neto za odabrani artikal ----
  const totalArtiklSummary = useMemo(() => {
    return selectedArtiklData.reduce(
      (acc, o) => {
        acc.bruto += Number(o.bruto);
        acc.neto += Number(o.neto);
        return acc;
      },
      { bruto: 0, neto: 0 }
    );
  }, [selectedArtiklData]);

  const ukupnoPeriod = useMemo(() => {
    return filteredObracuni.reduce(
      (acc, o) => {
        acc.rashod += o.ukupnoRashod;
        acc.bruto += o.ukupnoBruto;
        acc.neto += o.ukupnoNeto;
        return acc;
      },
      { rashod: 0, bruto: 0, neto: 0 }
    );
  }, [filteredObracuni]);

  // ---- Custom Tooltip za grafikon ----
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any; label?: string }) => {
    if (active && payload && payload.length) {
      const dataSource = payload[0].dataKey === "bruto" && payload[0].name !== "Bruto" ? selectedArtiklData : chartData;
      const prevIndex = dataSource.findIndex((d) => d.datum === label) - 1;
      const prev = dataSource[prevIndex] || dataSource[0];

      return (
        <div style={{ backgroundColor: "#1f2937", color: "#fff", padding: 12, borderRadius: 8 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
          {payload.map((p: any) => {
            const key = p.dataKey as "bruto" | "neto" | "rashod";
            const prevValue = dataSource === chartData
              ? (prev as typeof chartData[0])[key] || 0
              : (prev as ArtiklProfitData)[key as "bruto" | "neto"] || 0;
            const percent = prevValue === 0 ? 0 : ((p.value - prevValue) / prevValue * 100).toFixed(1);
            const color = Number(percent) >= 0 ? "#16a34a" : "#dc2626";

            return (
              <div key={key} style={{ marginBottom: 4 }}>
                <span style={{ color: p.color, fontWeight: 500 }}>{p.name}: </span>
                {p.value.toFixed(2)} KM{" "}
                <span style={{ color, fontSize: 12 }}>
                  {Number(percent) >= 0 ? "▲" : "▼"} {Math.abs(Number(percent))}%
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return (
      <div style={{ backgroundColor: "#1f2937", color: "#fff", padding: 12, borderRadius: 8 }}>
        <div style={{ fontWeight: 600 }}>Odaberite artikal za prikaz podataka</div>
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>Profit</h1>

      <FilterSection
        filter={filter}
        setFilter={setFilter}
        customPeriod={customPeriod}
        setCustomPeriod={setCustomPeriod}
        label="Filter ukupnog profita"
      />

      {/* ---- Chart ukupnog profita ---- */}
      <div style={{ width: "100%", height: 300, marginBottom: 20 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="datum" tick={{ fill: "#6b7280", fontSize: 13 }} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 13 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} />
            <Line type="monotone" dataKey="bruto" name="Bruto" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="neto" name="Neto" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="rashod" name="Rashod" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ---- Ukupno odmah ispod charta ---- */}
      <div style={{ ...summaryStyle, background: "#e5e7eb", marginBottom: 30 }}>
        <div style={summaryItemStyle("#ef4444")}>Ukupno rashod: {ukupnoPeriod.rashod.toFixed(2)} KM</div>
        <div style={summaryItemStyle("#3b82f6")}>Ukupno bruto: {ukupnoPeriod.bruto.toFixed(2)} KM</div>
        <div style={summaryItemStyle("#10b981")}>Ukupno neto: {ukupnoPeriod.neto.toFixed(2)} KM</div>
      </div>

      {/* ---- Odabir artikla i filter za grafikon profita po artiklu ---- */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
          <label style={{ marginRight: 10, fontWeight: 500 }}>Odaberi artikal:</label>
          <select
            value={selectedArtikl}
            onChange={(e) => setSelectedArtikl(e.target.value)}
            style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #d1d5db" }}
          >
            <option value="">Odaberi artikal</option>
            {allArtikli.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <FilterSection
          filter={artiklFilter}
          setFilter={setArtiklFilter}
          customPeriod={customPeriod}
          setCustomPeriod={setCustomPeriod}
          label="Filter profita po artiklu"
        />
      </div>

      {/* ---- Grafikon profita odabranog artikla ---- */}
      <div
        style={{
          width: "100%",
          height: 300,
          backgroundColor: "#fff",
          borderRadius: 12,
          padding: 20,
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          marginBottom: 10,
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={selectedArtiklData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="datum" tick={{ fill: "#6b7280", fontSize: 13 }} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 13 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} />
            <Line type="monotone" dataKey="bruto" name="Bruto artikal" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="neto" name="Neto artikal" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ ...summaryStyle, marginBottom: 30 }}>
        <div style={summaryItemStyle("#3b82f6")}>
          Ukupni bruto ({selectedArtikl || "Nema odabranog artikla"}): {totalArtiklSummary.bruto.toFixed(2)} KM
        </div>
        <div style={summaryItemStyle("#10b981")}>
          Ukupni neto ({selectedArtikl || "Nema odabranog artikla"}): {totalArtiklSummary.neto.toFixed(2)} KM
        </div>
      </div>

      {/* ---- Detaljni obračuni po danima ---- */}
      {filteredObracuni.map((o, i) => (
        <div key={i} style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Obračun - {o.datum}</h2>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Artikal</th>
                <th style={thStyle}>Nabavna cijena</th>
                <th style={thStyle}>Prodajna cijena</th>
                <th style={thStyle}>Količina</th>
                <th style={thStyle}>Bruto</th>
                <th style={thStyle}>Neto</th>
                <th style={thStyle}>Profit po artiklu</th>
              </tr>
            </thead>
            <tbody>
              {o.artikliProfit.map((a, j) => (
                <tr key={j}>
                  <td style={tdStyle}>{a.naziv}</td>
                  <td style={tdStyle}>{a.nabavnaCijena.toFixed(2)}</td>
                  <td style={tdStyle}>{a.prodajnaCijena.toFixed(2)}</td>
                  <td style={tdStyle}>{a.kolicina.toFixed(2)}</td>
                  <td style={tdStyle}>{a.bruto.toFixed(2)}</td>
                  <td style={tdStyle}>{a.neto.toFixed(2)}</td>
                  <td style={tdStyle}>{a.profit.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={summaryStyle}>
            <div style={summaryItemStyle("#ef4444")}>Ukupno rashod: {o.ukupnoRashod.toFixed(2)} KM</div>
            <div style={summaryItemStyle("#3b82f6")}>Ukupno bruto: {o.ukupnoBruto.toFixed(2)} KM</div>
            <div style={summaryItemStyle("#10b981")}>Ukupno neto: {o.ukupnoNeto.toFixed(2)} KM</div>
          </div>
        </div>
      ))}
    </div>
  );
}