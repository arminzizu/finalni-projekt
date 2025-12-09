"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [loginMethod, setLoginMethod] = useState<"email" | "register" | "forgot" | null>(null);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const router = useRouter();
  const offlineMode = true; // Firebase uklonjen, koristimo server API

  const handleEmailLogin = async () => {
    if (!email || !password) {
      setError("Unesi e-mail i lozinku");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Unesi valjanu e-mail adresu");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Server-only login preko API-ja (bez Firebase)
      console.log("Pokušavam login:", { email, password: password ? "***" : "empty" });
      const resp = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      console.log("Login response status:", resp.status);
      
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        console.error("Login failed:", data);
        throw new Error(data.error || "Prijava nije uspjela");
      }
      
      const data = await resp.json();
      console.log("Login success:", data);
      
      const userData = {
        email: data.email || email,
        loggedInAt: Date.now(),
        userId: data.userId,
        displayName: data.displayName,
        appName: data.appName,
      };
      
      localStorage.setItem("offlineUser", JSON.stringify(userData));
      console.log("User saved to localStorage:", userData);
      
      // Provjeri da li je spremljeno
      const saved = localStorage.getItem("offlineUser");
      console.log("Verification - saved user:", saved);
      
      // Emituj event da layout zna da je korisnik prijavljen
      window.dispatchEvent(new Event("userLoggedIn"));
      
      // Mala pauza prije preusmjeravanja
      setTimeout(() => {
      router.push("/dashboard");
      }, 100);
    } catch (err: any) {
      console.error("Greška pri e-mail prijavi:", err);
        setError(err.message || "Greška pri prijavi. Provjeri e-mail i lozinku.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      setError("Unesi e-mail, lozinku i potvrdu lozinke");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Unesi valjanu e-mail adresu");
      return;
    }
    if (password.length < 6) {
      setError("Lozinka mora imati najmanje 6 znakova");
      return;
    }
    if (password !== confirmPassword) {
      setError("Lozinke se ne podudaraju");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Server-only registracija: spremi lokalno
      localStorage.setItem(
        "offlineUser",
        JSON.stringify({ email, registeredAt: Date.now(), loggedInAt: Date.now() })
      );
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Greška pri registraciji:", err);
        setError(err.message || "Greška pri registraciji. Pokušaj ponovo.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError("Reset lozinke nije dostupan u server-only modu. Kontaktiraj admina.");
  };

  const handleBack = () => {
    setLoginMethod(null);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setMessage("");
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      width: "100vw", 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      padding: "20px",
      boxSizing: "border-box",
      position: "relative",
      backgroundImage: "url('/background.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat"
    }}>
      {/* Fade overlay */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        zIndex: 1
      }} />
      
      <div style={{ 
        padding: "40px", 
        background: "rgba(255, 255, 255, 0.95)", 
        borderRadius: "12px", 
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)", 
        textAlign: "center", 
        maxWidth: "450px", 
        width: "100%",
        margin: "0 auto",
        position: "relative",
        zIndex: 2,
        backdropFilter: "blur(10px)"
      }}>
        <style jsx>{`
          @media (max-width: 768px) {
            h1 {
              font-size: 24px;
              margin-bottom: 24px;
            }
            div[style*='padding: 40px'] {
              padding: 24px;
            }
            input {
              width: 100%;
              margin: 12px 0;
              padding: 12px;
              font-size: 16px;
              min-height: 48px;
              box-sizing: border-box;
            }
            button {
              width: 100%;
              margin: 8px 0;
              padding: 12px;
              font-size: 16px;
              min-height: 48px;
              box-sizing: border-box;
            }
          }
          @media (min-width: 769px) {
            input {
              margin: 12px 0;
              padding: 12px;
              font-size: 16px;
            }
            button {
              margin: 8px 0;
              padding: 12px;
              font-size: 16px;
            }
          }
        `}</style>
        <h1 style={{ marginBottom: "32px", fontSize: "28px", fontWeight: 600, color: "#1f2937" }}>
          {loginMethod === "register" ? "Registracija" : loginMethod === "forgot" ? "Reset lozinke" : "Prijava"}
        </h1>
        {error && (
          <div style={{ 
            color: "#dc2626", 
            marginBottom: "16px", 
            padding: "12px 16px", 
            background: "#fef2f2", 
            borderRadius: "8px",
            border: "1px solid #fecaca",
            fontSize: "14px"
          }}>
            {error}
            {error.includes("e-mail je već registriran") && (
              <div>
                <button
                  onClick={() => setLoginMethod("email")}
                  style={{ marginTop: "10px", padding: "5px 10px", background: "#4285f4", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
                >
                  Prijavi se
                </button>
              </div>
            )}
            {error.includes("Korisnik s ovim e-mailom ne postoji") && (
              <div>
                <button
                  onClick={() => setLoginMethod("register")}
                  style={{ marginTop: "10px", padding: "5px 10px", background: "#fbbc05", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
                >
                  Registriraj se
                </button>
              </div>
            )}
          </div>
        )}
        {message && (
          <div style={{ 
            color: "#16a34a", 
            marginBottom: "16px", 
            padding: "12px 16px", 
            background: "#f0fdf4", 
            borderRadius: "8px",
            border: "1px solid #bbf7d0",
            fontSize: "14px"
          }}>
            {message}
          </div>
        )}
        {!loginMethod ? (
          <>
            <button
              onClick={() => setLoginMethod("email")}
              style={{ 
                width: "100%", 
                padding: "12px 16px", 
                background: "#34a853", 
                color: "white", 
                border: "none", 
                borderRadius: "8px", 
                marginBottom: "12px", 
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: 500,
                transition: "background-color 0.2s",
                boxSizing: "border-box"
              }}
            >
              Prijava putem e-maila
            </button>
            <button
              onClick={() => setLoginMethod("register")}
              style={{ 
                width: "100%", 
                padding: "12px 16px", 
                background: "#fbbc05", 
                color: "white", 
                border: "none", 
                borderRadius: "8px", 
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: 500,
                transition: "background-color 0.2s",
                boxSizing: "border-box"
              }}
            >
              Registracija
            </button>
          </>
        ) : loginMethod === "email" ? (
          <>
            <input
              type="email"
              placeholder="Unesi e-mail adresu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ 
                width: "100%", 
                padding: "12px 16px", 
                margin: "12px 0", 
                borderRadius: "8px", 
                border: "1px solid #d1d5db",
                fontSize: "16px",
                outline: "none",
                transition: "border-color 0.2s",
                boxSizing: "border-box"
              }}
              onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
            />
            <input
              type="password"
              placeholder="Unesi lozinku"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ 
                width: "100%", 
                padding: "12px 16px", 
                margin: "12px 0", 
                borderRadius: "8px", 
                border: "1px solid #d1d5db",
                fontSize: "16px",
                outline: "none",
                transition: "border-color 0.2s",
                boxSizing: "border-box"
              }}
              onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
            />
            <button 
              onClick={handleEmailLogin} 
              disabled={loading || !email || !password}
              style={{ 
                width: "100%", 
                padding: "12px 16px", 
                background: loading || !email || !password ? "#9ca3af" : "#34a853", 
                color: "white", 
                border: "none", 
                borderRadius: "8px", 
                cursor: (loading || !email || !password) ? "not-allowed" : "pointer",
                fontSize: "16px",
                fontWeight: 500,
                marginTop: "8px",
                transition: "background-color 0.2s",
                boxSizing: "border-box"
              }}
            >
              {loading ? "Prijavljujem..." : "Prijavi se"}
            </button>
            <button 
              onClick={() => setLoginMethod("forgot")}
              style={{ 
                width: "100%", 
                padding: "12px 16px", 
                background: "#4285f4", 
                color: "white", 
                border: "none", 
                borderRadius: "8px", 
                marginTop: "8px",
                fontSize: "16px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "background-color 0.2s",
                boxSizing: "border-box"
              }}
            >
              Zaboravio sam lozinku
            </button>
            <button 
              onClick={handleBack} 
              style={{ 
                width: "100%", 
                padding: "12px 16px", 
                background: "#6b7280", 
                color: "white", 
                border: "none", 
                borderRadius: "8px", 
                marginTop: "8px",
                fontSize: "16px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "background-color 0.2s",
                boxSizing: "border-box"
              }}
            >
              Nazad
            </button>
          </>
        ) : loginMethod === "register" ? (
          <>
            <input
              type="email"
              placeholder="Unesi e-mail adresu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ 
                width: "100%", 
                padding: "12px 16px", 
                margin: "12px 0", 
                borderRadius: "8px", 
                border: "1px solid #d1d5db",
                fontSize: "16px",
                outline: "none",
                transition: "border-color 0.2s",
                boxSizing: "border-box"
              }}
              onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
            />
            <input
              type="password"
              placeholder="Unesi lozinku"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ 
                width: "100%", 
                padding: "12px 16px", 
                margin: "12px 0", 
                borderRadius: "8px", 
                border: "1px solid #d1d5db",
                fontSize: "16px",
                outline: "none",
                transition: "border-color 0.2s",
                boxSizing: "border-box"
              }}
              onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
            />
            <input
              type="password"
              placeholder="Potvrdi lozinku"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ 
                width: "100%", 
                padding: "12px 16px", 
                margin: "12px 0", 
                borderRadius: "8px", 
                border: "1px solid #d1d5db",
                fontSize: "16px",
                outline: "none",
                transition: "border-color 0.2s",
                boxSizing: "border-box"
              }}
              onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
            />
            <button 
              onClick={handleRegister} 
              disabled={loading || !email || !password || !confirmPassword}
              style={{ 
                width: "100%", 
                padding: "12px 16px", 
                background: loading || !email || !password || !confirmPassword ? "#9ca3af" : "#fbbc05", 
                color: "white", 
                border: "none", 
                borderRadius: "8px", 
                cursor: (loading || !email || !password || !confirmPassword) ? "not-allowed" : "pointer",
                fontSize: "16px",
                fontWeight: 500,
                marginTop: "8px",
                transition: "background-color 0.2s",
                boxSizing: "border-box"
              }}
            >
              {loading ? "Registrujem..." : "Registriraj se"}
            </button>
            <button 
              onClick={handleBack} 
              style={{ 
                width: "100%", 
                padding: "12px 16px", 
                background: "#6b7280", 
                color: "white", 
                border: "none", 
                borderRadius: "8px", 
                marginTop: "8px",
                fontSize: "16px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "background-color 0.2s",
                boxSizing: "border-box"
              }}
            >
              Nazad
            </button>
          </>
        ) : loginMethod === "forgot" ? (
          <>
            <input
              type="email"
              placeholder="Unesi e-mail adresu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ 
                width: "100%", 
                padding: "12px 16px", 
                margin: "12px 0", 
                borderRadius: "8px", 
                border: "1px solid #d1d5db",
                fontSize: "16px",
                outline: "none",
                transition: "border-color 0.2s",
                boxSizing: "border-box"
              }}
              onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
            />
            <button 
              onClick={handleForgotPassword} 
              disabled={loading || !email}
              style={{ 
                width: "100%", 
                padding: "12px 16px", 
                background: loading || !email ? "#9ca3af" : "#4285f4", 
                color: "white", 
                border: "none", 
                borderRadius: "8px", 
                cursor: (loading || !email) ? "not-allowed" : "pointer",
                fontSize: "16px",
                fontWeight: 500,
                marginTop: "8px",
                transition: "background-color 0.2s",
                boxSizing: "border-box"
              }}
            >
              {loading ? "Šaljem link..." : "Pošalji link za reset"}
            </button>
            <button 
              onClick={handleBack} 
              style={{ 
                width: "100%", 
                padding: "12px 16px", 
                background: "#6b7280", 
                color: "white", 
                border: "none", 
                borderRadius: "8px", 
                marginTop: "8px",
                fontSize: "16px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "background-color 0.2s",
                boxSizing: "border-box"
              }}
            >
              Nazad
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}