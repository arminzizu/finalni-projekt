"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { FaArrowUp, FaArrowDown, FaDollarSign } from "react-icons/fa";
import { auth, onAuthStateChanged } from "../../lib/firebase";
import { useRouter } from "next/navigation";
import { getDocs, collection, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firestore"; // NOVO

// Tipovi preuzeti iz ObracunPage
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

type Rashod = {
  naziv: string;
  cijena: number;
};

type ArhiviraniObracun = {
  datum: string;
  ukupnoArtikli: number;
  ukupnoRashod: number;
  neto: number;
  artikli: ArhiviraniArtikal[];
  rashodi: Rashod[];
  prihodi: Rashod[];
};

// Tip za podatke u grafikonu
type Obracun = {
  datum: string;
  artikli: number;
  rashod: number;
  neto: number;
};

// Tip za agregirane podatke
type AggregatedData = {
  datum: string;
  artikli: number;
  rashod: number;
  neto: number;
};

// Tip za podatke specifičnog artikla
type ArtiklData = {
  datum: string;
  utroseno: number;
};

export default function DashboardPage() {
  const [range, setRange] = useState<"currentWeek" | "previousWeek" | "previousMonth" | "custom">("currentWeek");
  const [customFrom, setCustomFrom] = useState<string>(
    new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split("T")[0]
  );
  const [customTo, setCustomTo] = useState<string>(new Date().toISOString().split("T")[0]);
  const [selectedArtikl, setSelectedArtikl] = useState<string>("");
  const [artiklRange, setArtiklRange] = useState<"currentWeek" | "previousWeek" | "previousMonth" | "custom">("currentWeek");
  const [arhiva, setArhiva] = useState<ArhiviraniObracun[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Autentikacija + Firestore real-time učitavanje
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.log("Nema prijavljenog korisnika");
        setArhiva([]);
        setLoading(false);
        return;
      }

      console.log("Korisnik prijavljen:", user.uid);
      setLoading(true);
      setError(null);

      try {
        // Učitaj sve obračune iz Firestore-a
        const querySnapshot = await getDocs(collection(db, "users", user.uid, "obracuni"));
        const podaci: ArhiviraniObracun[] = [];

        querySnapshot.forEach((doc) => {
          podaci.push(doc.data() as ArhiviraniObracun);
        });

        // Sortiraj po datumu
        podaci.sort((a, b) => {
          const dateA = new Date(a.datum.split(".").reverse().join("-")).getTime();
          const dateB = new Date(b.datum.split(".").reverse().join("-")).getTime();
          return dateA - dateB;
        });

        console.log("Učitano iz Firestore-a:", podaci);
        setArhiva(podaci);
      } catch (error) {
        console.error("Greška pri učitavanju iz Firestore-a:", error);
        setError("Ne mogu učitati podatke. Provjeri internet vezu.");
      } finally {
        setLoading(false);
      }
    });

    // Real-time listener
    let unsubscribeFirestore: (() => void) | null = null;

    const setupRealtimeListener = () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = collection(db, "users", user.uid, "obracuni");
      unsubscribeFirestore = onSnapshot(q, (snapshot) => {
        const podaci: ArhiviraniObracun[] = [];
        snapshot.forEach((doc) => {
          podaci.push(doc.data() as ArhiviraniObracun);
        });

        podaci.sort((a, b) => {
          const dateA = new Date(a.datum.split(".").reverse().join("-")).getTime();
          const dateB = new Date(b.datum.split(".").reverse().join("-")).getTime();
          return dateA - dateB;
        });

        setArhiva(podaci);
        console.log("Real-time ažuriranje iz Firestore-a");
      }, (error) => {
        console.error("Greška u real-time listeneru:", error);
      });
    };

    const unsubscribeAuthWithListener = onAuthStateChanged(auth, (user) => {
      if (unsubscribeFirestore) unsubscribeFirestore();
      if (user) {
        setupRealtimeListener();
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeAuthWithListener();
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, [router]);

  // Priprema podataka za grafikon
  const obracuni: Obracun[] = arhiva
    .map((o) => {
      const ukupnoPrihodi = o.prihodi?.reduce((sum, p) => sum + p.cijena, 0) || 0;
      return {
        datum: o.datum,
        artikli: o.ukupnoArtikli + ukupnoPrihodi,
        rashod: o.ukupnoRashod,
        neto: (o.ukupnoArtikli + ukupnoPrihodi) - o.ukupnoRashod,
      };
    })
    .sort((a, b) => {
      const dateA = new Date(a.datum.split(".").reverse().join("-")).getTime();
      const dateB = new Date(b.datum.split(".").reverse().join("-")).getTime();
      return dateA - dateB;
    });

  // Dobivanje svih artikala za dropdown
  const allArtikli = [...new Set(arhiva.flatMap((o) => o.artikli.map((a) => a.naziv)))];

  // Funkcija za agregaciju podataka
  const aggregateData = (
    data: Obracun[],
    selectedRange: "currentWeek" | "previousWeek" | "previousMonth" | "custom"
  ): AggregatedData[] => {
    let filteredData = data;

    const today = new Date();
    const getMonday = (d: Date) => {
      const date = new Date(d);
      const day = date.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      date.setDate(date.getDate() + diff);
      date.setHours(0, 0, 0, 0);
      return date;
    };

    if (selectedRange === "currentWeek") {
      const monday = getMonday(today);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      filteredData = data.filter((o) => {
        const dTime = new Date(o.datum.split(".").reverse().join("-")).getTime();
        return dTime >= monday.getTime() && dTime <= sunday.getTime();
      });
    } else if (selectedRange === "previousWeek") {
      const monday = getMonday(new Date(today.setDate(today.getDate() - 7)));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      filteredData = data.filter((o) => {
        const dTime = new Date(o.datum.split(".").reverse().join("-")).getTime();
        return dTime >= monday.getTime() && dTime <= sunday.getTime();
      });
    } else if (selectedRange === "previousMonth") {
      const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
      lastDay.setHours(23, 59, 59, 999);
      filteredData = data.filter((o) => {
        const dTime = new Date(o.datum.split(".").reverse().join("-")).getTime();
        return dTime >= firstDay.getTime() && dTime <= lastDay.getTime();
      });
    } else if (selectedRange === "custom") {
      const fromTime = new Date(customFrom).getTime();
      const toTime = new Date(customTo).getTime();
      filteredData = data.filter((o) => {
        const dTime = new Date(o.datum.split(".").reverse().join("-")).getTime();
        return dTime >= fromTime && dTime <= toTime;
      });
    }

    return filteredData.map((o) => ({
      datum: o.datum,
      artikli: Number(o.artikli),
      rashod: Number(o.rashod),
      neto: Number(o.neto),
    }));
  };

  // Funkcija za agregaciju podataka za odabrani artikal
  const aggregateArtiklData = (
    selectedArtikl: string,
    selectedRange: "currentWeek" | "previousWeek" | "previousMonth" | "custom"
  ): ArtiklData[] => {
    let filteredData = arhiva
      .map((o) => ({
        datum: o.datum,
        utroseno: o.artikli.find((a) => a.naziv === selectedArtikl)?.utroseno || 0,
      }))
      .filter((o) => o.utroseno > 0)
      .sort((a, b) => {
        const dateA = new Date(a.datum.split(".").reverse().join("-")).getTime();
        const dateB = new Date(b.datum.split(".").reverse().join("-")).getTime();
        return dateA - dateB;
      });

    const today = new Date();
    const getMonday = (d: Date) => {
      const date = new Date(d);
      const day = date.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      date.setDate(date.getDate() + diff);
      date.setHours(0, 0, 0, 0);
      return date;
    };

    if (selectedRange === "currentWeek") {
      const monday = getMonday(today);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      filteredData = filteredData.filter((o) => {
        const dTime = new Date(o.datum.split(".").reverse().join("-")).getTime();
        return dTime >= monday.getTime() && dTime <= sunday.getTime();
      });
    } else if (selectedRange === "previousWeek") {
      const monday = getMonday(new Date(today.setDate(today.getDate() - 7)));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      filteredData = filteredData.filter((o) => {
        const dTime = new Date(o.datum.split(".").reverse().join("-")).getTime();
        return dTime >= monday.getTime() && dTime <= sunday.getTime();
      });
    } else if (selectedRange === "previousMonth") {
      const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
      lastDay.setHours(23, 59, 59, 999);
      filteredData = filteredData.filter((o) => {
        const dTime = new Date(o.datum.split(".").reverse().join("-")).getTime();
        return dTime >= firstDay.getTime() && dTime <= lastDay.getTime();
      });
    } else if (selectedRange === "custom") {
      const fromTime = new Date(customFrom).getTime();
      const toTime = new Date(customTo).getTime();
      filteredData = filteredData.filter((o) => {
        const dTime = new Date(o.datum.split(".").reverse().join("-")).getTime();
        return dTime >= fromTime && dTime <= toTime;
      });
    }

    return filteredData.map((o) => ({
      datum: o.datum,
      utroseno: Number(o.utroseno),
    }));
  };

  // Podaci za grafikon
  const chartData = aggregateData(obracuni, range);
  const selectedData = selectedArtikl ? aggregateArtiklData(selectedArtikl, artiklRange) : [];

  // Ukupne vrijednosti
  const totalBruto = chartData.reduce((sum, o) => sum + Number(o.artikli), 0);
  const totalRashod = chartData.reduce((sum, o) => sum + Number(o.rashod), 0);
  const totalNeto = chartData.reduce((sum, o) => sum + Number(o.neto), 0);
  const totalArtikl = selectedData.reduce((sum, o) => sum + Number(o.utroseno), 0);

  const growth = (current: number, previous: number) =>
    previous === 0 ? "0" : (((current - previous) / previous) * 100).toFixed(1);

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any; label?: string }) => {
    if (active && payload && payload.length) {
      const dataSource = payload[0].dataKey === "utroseno" ? selectedData : chartData;
      const prevIndex = dataSource.findIndex((d) => d.datum === label) - 1;
      const prev = dataSource[prevIndex] || dataSource[0];

      return (
        <div style={{ backgroundColor: "#1f2937", color: "#fff", padding: 12, borderRadius: 8 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
          {payload.map((p: any) => {
            const key = p.dataKey as keyof AggregatedData | keyof ArtiklData;
            const prevValue = dataSource === chartData
              ? (prev as AggregatedData)[key as keyof AggregatedData] || 0
              : (prev as ArtiklData).utroseno || 0;
            const percent = growth(Number(p.value), Number(prevValue));
            const color = Number(percent) >= 0 ? "#16a34a" : "#dc2626";
            const unit = dataSource === chartData ? " KM" : "";

            return (
              <div key={key} style={{ marginBottom: 4 }}>
                <span style={{ color: p.color, fontWeight: 500 }}>{p.name}: </span>
                {p.value.toFixed(2)}{unit}{" "}
                <span style={{ color, fontSize: 12 }}>
                  {Number(percent) >= 0 ? "Up" : "Down"} {Math.abs(Number(percent))}%
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: 20 }}>Učitavanje podataka...</div>;
  }

  if (error) {
    return <div style={{ textAlign: "center", padding: 20, color: "red" }}>{error}</div>;
  }

  return (
    <div style={{ padding: 30, fontFamily: "'Inter', sans-serif", backgroundColor: "#f4f5f7", minHeight: "100vh" }}>
      <style jsx>{`
        .dashboard-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }
        @media (max-width: 768px) {
          div[style*='padding: 30px'] { padding: 15px; }
          h1 { font-size: 20px; }
          div[style*='display: flex'] { flex-direction: column; gap: 10px; }
          div[style*='min-width: 160px'] { min-width: 100%; }
          button { width: 100%; margin: 5px 0; padding: 8px; font-size: 14px; min-height: 48px; }
          input[type="date"] { width: 100%; margin: 5px 0; padding: 6px; font-size: 14px; }
          div[style*='height: 400'] { height: 300px; }
          div[style*='height: 300'] { height: 200px; }
        }
      `}</style>

      <h1 style={{ marginBottom: 30, fontSize: 28, fontWeight: 700, color: "#111827" }}>Dashboard</h1>

      {/* Range za prvi grafikon */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 30, alignItems: "center" }}>
        {[
          { value: "currentWeek", label: "Trenutna sedmica" },
          { value: "previousWeek", label: "Prošla sedmica" },
          { value: "previousMonth", label: "Prošli mjesec" },
          { value: "custom", label: "Custom" },
        ].map((r) => (
          <button
            key={r.value}
            onClick={() => setRange(r.value as any)}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: 14,
              background: range === r.value ? "#3b82f6" : "#e5e7eb",
              color: range === r.value ? "#fff" : "#374151",
              transition: "all 0.2s",
              boxShadow: range === r.value ? "0 2px 8px rgba(59,130,246,0.3)" : "none",
            }}
          >
            {r.label}
          </button>
        ))}

        {range === "custom" && (
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginLeft: 10 }}>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #d1d5db", outline: "none" }}
            />
            <span style={{ color: "#6b7280" }}>to</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #d1d5db", outline: "none" }}
            />
          </div>
        )}
      </div>

      {/* Grafikon ukupne zarade */}
      <div
        style={{
          width: "100%",
          height: 400,
          backgroundColor: "#fff",
          borderRadius: 12,
          padding: 20,
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          marginBottom: 30,
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="datum" tick={{ fill: "#6b7280", fontSize: 13 }} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 13 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} />
            <Line type="monotone" dataKey="artikli" name="Bruto" stroke="#16a34a" strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="rashod" name="Rashod" stroke="#dc2626" strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="neto" name="Neto" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Kartice */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 30 }}>
        {[
          {
            label: "Bruto",
            value: totalBruto,
            icon: <FaArrowUp color="#16a34a" size={20} />,
            growth: growth(totalBruto, Number(chartData[chartData.length - 2]?.artikli) || 0),
          },
          {
            label: "Rashod",
            value: totalRashod,
            icon: <FaArrowDown color="#dc2626" size={20} />,
            growth: null,
          },
          {
            label: "Neto",
            value: totalNeto,
            icon: <FaDollarSign color="#3b82f6" size={20} />,
            growth: growth(totalNeto, Number(chartData[chartData.length - 2]?.neto) || 0),
          },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              flex: 1,
              minWidth: 160,
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: 20,
              display: "flex",
              alignItems: "center",
              gap: 12,
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              transition: "transform 0.2s, box-shadow 0.2s",
              cursor: "default",
            }}
            className="dashboard-card"
          >
            <div>{item.icon}</div>
            <div>
              <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>{item.value.toFixed(2)} KM</div>
              {item.growth && (
                <div style={{ fontSize: 13, color: Number(item.growth) >= 0 ? "#16a34a" : "#dc2626", marginTop: 2 }}>
                  {Number(item.growth) >= 0 ? "Up" : "Down"} {Math.abs(Number(item.growth))}%
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Artikal grafikon */}
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
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          {[
            { value: "currentWeek", label: "Trenutna sedmica" },
            { value: "previousWeek", label: "Prošla sedmica" },
            { value: "previousMonth", label: "Prošli mjesec" },
            { value: "custom", label: "Custom" },
          ].map((r) => (
            <button
              key={r.value}
              onClick={() => setArtiklRange(r.value as any)}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontWeight: 500,
                fontSize: 14,
                background: artiklRange === r.value ? "#3b82f6" : "#e5e7eb",
                color: artiklRange === r.value ? "#fff" : "#374151",
                transition: "all 0.2s",
                boxShadow: artiklRange === r.value ? "0 2px 8px rgba(59,130,246,0.3)" : "none",
              }}
            >
              {r.label}
            </button>
          ))}

          {artiklRange === "custom" && (
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginLeft: 10 }}>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #d1d5db", outline: "none" }}
              />
              <span style={{ color: "#6b7280" }}>to</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #d1d5db", outline: "none" }}
              />
            </div>
          )}
        </div>
      </div>

      {selectedArtikl && (
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
            <LineChart data={selectedData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="datum" tick={{ fill: "#6b7280", fontSize: 13 }} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 13 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />
              <Line type="monotone" dataKey="utroseno" name="Prodaja" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {selectedArtikl && (
        <div style={{ fontWeight: 600, fontSize: 16 }}>
          Ukupno prodano: {totalArtikl.toFixed(2)} ({selectedArtikl})
        </div>
      )}
    </div>
  );
}