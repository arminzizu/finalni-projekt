"use client";

import React, { useState, useEffect } from "react";
import { auth, sendPasswordResetEmail, signOut } from "../../lib/firebase";
import { useAppName } from "../context/AppNameContext";
import { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { useRouter } from "next/navigation"; // Dodan import za useRouter

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

const inputStyle: React.CSSProperties = {
  padding: "8px",
  border: "1px solid #e5e7eb",
  borderRadius: "6px",
  fontSize: "14px",
  marginRight: "8px",
  width: "200px",
};

export default function Profile() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const { appName, setAppName } = useAppName();
  const [localAppName, setLocalAppName] = useState(appName); // Lokalni state za input
  const [sessions, setSessions] = useState([
    { id: "12345", date: "28.09.2025 14:30", status: "Aktivna", device: "Desktop", location: "Sarajevo", ip: "192.168.1.1", name: "Korisnik A" },
    { id: "67890", date: "27.09.2025 09:15", status: "Završena", device: "Mobilni", location: "Mostar", ip: "10.0.0.1", name: "Admin" },
  ]);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editedSessionName, setEditedSessionName] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const router = useRouter(); // Inicijalizacija routera

  // Dohvati IP adresu i trenutnog korisnika
  useEffect(() => {
    const fetchIP = async () => {
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        return data.ip;
      } catch (error) {
        console.error("Greška pri dohvaćanju IP adrese:", error);
        return "N/A";
      }
    };

    const user = auth.currentUser;
    if (user) {
      setEmail(user.email || "N/A"); // Postavi trenutni e-mail
      fetchIP().then((ip) => {
        const device = /Mobi|Android/i.test(navigator.userAgent) ? "Mobilni" : "Desktop";
        const location = navigator.geolocation ? "Lokacija nije dostupna" : "Sarajevo"; // Placeholder
        const currentSession = {
          id: Date.now().toString(),
          date: new Date().toLocaleString("bs-BA", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
          status: "Aktivna",
          device,
          location,
          ip,
          name: user.displayName || "Korisnik",
        };
        setSessions((prev) => [currentSession, ...prev.filter(s => s.status !== "Aktivna")]);
      });
    }
  }, []);

  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Link za reset lozinke poslan na vaš e-mail!");
    } catch (err: any) {
      setMessage("Greška: " + err.message);
    }
  };

  const handleSaveAppName = () => {
    if (localAppName.trim() !== "" && localAppName !== appName) {
      setAppName(localAppName);
      setMessage("Ime aplikacije ažurirano!");
    } else if (localAppName.trim() === "") {
      setMessage("Unesite ime aplikacije!");
    } else {
      setMessage("Nema promjena.");
    }
  };

  const handleDeleteSession = (id: string) => {
    if (window.confirm("Jeste li sigurni da želite obrisati ovu sesiju?")) {
      setSessions(sessions.filter(session => session.id !== id));
    }
  };

  const handleEditSessionName = (id: string, currentName: string) => {
    setEditingSessionId(id);
    setEditedSessionName(currentName);
  };

  const handleSaveSessionName = (id: string) => {
    setSessions(sessions.map(session =>
      session.id === id ? { ...session, name: editedSessionName } : session
    ));
    setEditingSessionId(null);
    setEditedSessionName("");
  };

  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setEditedSessionName("");
  };

  // 2FA logika
  const handleEnable2FA = async () => {
    if (!auth.currentUser?.email) {
      setMessage("Morate biti prijavljeni da biste omogućili 2FA!");
      return;
    }
    const actionCodeSettings = {
      url: window.location.href, // Povratni URL nakon verifikacije
      handleCodeInApp: true,
    };
    try {
      await sendSignInLinkToEmail(auth, auth.currentUser.email, actionCodeSettings);
      setMessage("Provjerite e-mail za link za verifikaciju 2FA!");
      window.localStorage.setItem("emailForSignIn", auth.currentUser.email); // Spremi e-mail za verifikaciju
      setTwoFactorEnabled(true); // Postavi 2FA na omogućeno nakon slanja
    } catch (err: any) {
      setMessage("Greška pri omogućavanju 2FA: " + err.message);
    }
  };

  const handleVerify2FA = () => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem("emailForSignIn");
      if (!email) {
        email = window.prompt("Unesite e-mail za verifikaciju:");
      }
      if (email) {
        signInWithEmailLink(auth, email, window.location.href)
          .then((result: any) => {
            window.localStorage.removeItem("emailForSignIn");
            setMessage("2FA uspješno verifikovan!");
          })
          .catch((err: any) => {
            setMessage("Greška pri verifikaciji 2FA: " + err.message);
          });
      }
    }
  };

  useEffect(() => {
    handleVerify2FA(); // Provjeri link prilikom učitavanja stranice
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("Uspješna odjava, preusmjeravam na login");
      await fetch("/api/clear-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      router.push("/login");
    } catch (err: any) {
      console.error("Greška pri odjavi:", err);
    }
  };

  return (
    <div style={containerStyle}>
      <style jsx>{`
        button:hover {
          background-color: #2563eb;
        }
        .delete-btn {
          background-color: #dc2626;
        }
        .delete-btn:hover {
          background-color: #b91c1c;
        }
      `}</style>

      <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#1f2937", marginBottom: "24px" }}>
        Moj Profil
      </h1>

      <div style={{ marginBottom: "32px", border: "2px solid #e5e7eb", borderRadius: "12px", padding: "16px", background: "#f9fafb" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#1f2937", marginBottom: "16px" }}>
          Promijeni ime aplikacije
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <input
            type="text"
            value={localAppName}
            onChange={(e) => setLocalAppName(e.target.value)}
            style={inputStyle}
            placeholder="Unesite ime aplikacije"
          />
          <button style={buttonStyle} onClick={handleSaveAppName}>
            Spremi ime
          </button>
        </div>
        {message && <p style={{ color: "#15803d", marginTop: "8px" }}>{message}</p>}
      </div>

      <div style={{ marginBottom: "32px", border: "2px solid #e5e7eb", borderRadius: "12px", padding: "16px", background: "#f9fafb" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#1f2937", marginBottom: "16px" }}>
          Promijeni lozinku
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            placeholder="Unesite e-mail"
          />
          <button style={buttonStyle} onClick={handleResetPassword}>
            Pošalji link za reset
          </button>
        </div>
        {message && <p style={{ color: "#15803d", marginTop: "8px" }}>{message}</p>}
      </div>

      <div style={{ marginBottom: "32px", border: "2px solid #e5e7eb", borderRadius: "12px", padding: "16px", background: "#f9fafb" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#1f2937", marginBottom: "16px" }}>
          Pregled sesija
        </h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Sesija ID</th>
              <th style={thStyle}>Datum logovanja</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Uređaj</th>
              <th style={thStyle}>Lokacija</th>
              <th style={thStyle}>IP adresa</th>
              <th style={thStyle}>Ime sesije</th>
              <th style={thStyle}>Akcije</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id}>
                <td style={tdStyle}>{session.id}</td>
                <td style={tdStyle}>{session.date}</td>
                <td style={tdStyle}>{session.status}</td>
                <td style={tdStyle}>{session.device}</td>
                <td style={tdStyle}>{session.location}</td>
                <td style={tdStyle}>{session.ip}</td>
                <td style={tdStyle}>
                  {editingSessionId === session.id ? (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        type="text"
                        value={editedSessionName}
                        onChange={(e) => setEditedSessionName(e.target.value)}
                        style={inputStyle}
                      />
                      <button style={buttonStyle} onClick={() => handleSaveSessionName(session.id)}>
                        Spremi
                      </button>
                      <button style={{ ...buttonStyle, background: "#6b7280" }} onClick={handleCancelEdit}>
                        Odustani
                      </button>
                    </div>
                  ) : (
                    session.name
                  )}
                </td>
                <td style={tdStyle}>
                  <button
                    style={{ ...buttonStyle, ...{ background: "#dc2626" } }}
                    onClick={() => handleDeleteSession(session.id)}
                  >
                    Obriši
                  </button>
                  {session.status === "Aktivna" && (
                    <button
                      style={buttonStyle}
                      onClick={() => handleEditSessionName(session.id, session.name)}
                    >
                      Uredi
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginBottom: "32px", border: "2px solid #e5e7eb", borderRadius: "12px", padding: "16px", background: "#f9fafb" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#1f2937", marginBottom: "16px" }}>
          Sigurnosne postavke
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input
            type="checkbox"
            checked={twoFactorEnabled}
            onChange={(e) => setTwoFactorEnabled(e.target.checked)}
          />
          <span>Dvofaktorska autentifikacija (2FA)</span>
          {twoFactorEnabled && (
            <button style={buttonStyle} onClick={handleEnable2FA}>
              Omogući 2FA
            </button>
          )}
        </div>
      </div>

      <div style={{ border: "2px solid #e5e7eb", borderRadius: "12px", padding: "16px", background: "#f9fafb" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#1f2937", marginBottom: "16px" }}>
          Detalji naloga
        </h2>
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={tdStyle}>E-mail:</td>
              <td style={tdStyle}>{email || "N/A"}</td>
            </tr>
            <tr>
              <td style={tdStyle}>Datum registracije:</td>
              <td style={tdStyle}>{auth.currentUser?.metadata?.creationTime ? new Date(auth.currentUser.metadata.creationTime).toLocaleDateString("bs-BA") : "N/A"}</td>
            </tr>
          </tbody>
        </table>
        <button style={buttonStyle} className="mt-4">
          Uredi detalje
        </button>
        <button
          onClick={handleLogout}
          style={{
            ...buttonStyle,
            background: "#dc2626",
            marginTop: "20px",
            width: "100%",
          }}
        >
          Odjava
        </button>
      </div>
    </div>
  );
}