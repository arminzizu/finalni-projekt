"use client";

import React, { useState } from "react";
import { auth, sendPasswordResetEmail } from "../../lib/firebase";
import { useAppName } from "../context/AppNameContext";

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
    { id: "12345", date: "28.09.2025 14:30", status: "Aktivna", device: "Desktop", location: "Sarajevo", name: "Korisnik A" },
    { id: "67890", date: "27.09.2025 09:15", status: "Završena", device: "Mobilni", location: "Mostar", name: "Admin" },
  ]);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editedSessionName, setEditedSessionName] = useState("");

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

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

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
          <span>Dvofaktorska autentifikacija (2FA) - u razvoju</span>
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
              <td style={tdStyle}>korisnik@example.com</td>
            </tr>
            <tr>
              <td style={tdStyle}>Datum registracije:</td>
              <td style={tdStyle}>15.09.2025</td>
            </tr>
          </tbody>
        </table>
        <button style={buttonStyle} className="mt-4">
          Uredi detalje
        </button>
      </div>
    </div>
  );
} 