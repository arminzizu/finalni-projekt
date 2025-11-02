"use client";

import React, { useState, useRef, useEffect } from "react";
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "../../lib/firebase";
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
      console.log("Pokušavam prijavu s e-mailom:", email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      const idToken = await user.getIdToken();
      console.log("ID Token generisan:", idToken);
      console.log("Uspješan login:", user.email);

      const response = await fetch("/api/set-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        throw new Error("Greška pri postavljanju sesije: " + response.statusText);
      }

      console.log("Login uspješan, preusmjeravam na dashboard");
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Greška pri e-mail prijavi:", err);
      if (err.code === "auth/user-not-found") {
        setError("Korisnik s ovim e-mailom ne postoji. Registriraj se.");
      } else if (err.code === "auth/wrong-password") {
        setError("Pogrešna lozinka. Pokušaj ponovo.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Previše pokušaja. Pokušaj ponovo kasnije.");
      } else {
        setError(err.message || "Greška pri prijavi. Provjeri e-mail i lozinku.");
      }
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
      console.log("Pokušavam registraciju s e-mailom:", email);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      const idToken = await user.getIdToken();
      console.log("ID Token generisan:", idToken);
      console.log("Uspješna registracija:", user.email);

      const response = await fetch("/api/set-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        throw new Error("Greška pri postavljanju sesije: " + response.statusText);
      }

      console.log("Registracija uspješna, preusmjeravam na dashboard");
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Greška pri registraciji:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("Ovaj e-mail je već registriran. Pokušaj se prijaviti.");
      } else {
        setError(err.message || "Greška pri registraciji. Pokušaj ponovo.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Unesi e-mail za reset lozinke");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Unesi valjanu e-mail adresu");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Link za reset lozinke poslan na vaš e-mail!");
    } catch (err: any) {
      console.error("Greška pri resetu lozinke:", err);
      setError(err.message || "Greška pri slanju linka za reset. Pokušaj ponovo.");
    } finally {
      setLoading(false);
    }
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
      height: "100vh", 
      width: "100vw", 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      backgroundColor: "#f0f0f0", 
      position: "fixed", 
      top: 0, 
      left: 0,
      overflow: "hidden"
    }}>
      <div style={{ 
        padding: "20px", 
        background: "white", 
        borderRadius: "8px", 
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)", 
        textAlign: "center", 
        maxWidth: "400px", 
        width: "90%"
      }}>
        <style jsx>{`
          @media (max-width: 768px) {
            h1 {
              font-size: 20px; /* Smanjen font za naslove */
            }
            div[style*='padding: 20px'] {
              padding: 15px; /* Smanjen padding na mobilu */
            }
            input, button {
              width: 100%;
              margin: 5px 0; /* Kompaktniji razmak */
              padding: 10px;
              font-size: 14px; /* Smanjen font za inpute i dugmadi */
              min-height: 48px; /* Minimalna visina za touch target */
            }
            button {
              margin-bottom: 5px; /* Manji razmak između dugmadi */
            }
          }
        `}</style>
        <h1 style={{ marginBottom: "20px" }}>{loginMethod === "register" ? "Registracija" : loginMethod === "forgot" ? "Reset lozinke" : "Login"}</h1>
        {error && (
          <div style={{ color: "red", marginBottom: "10px", padding: "10px", background: "#ffebee" }}>
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
          <div style={{ color: "green", marginBottom: "10px", padding: "10px", background: "#e6ffe6" }}>
            {message}
          </div>
        )}
        {!loginMethod ? (
          <>
            <button
              onClick={() => setLoginMethod("email")}
              style={{ width: "100%", padding: "10px", background: "#34a853", color: "white", border: "none", borderRadius: "5px", marginBottom: "10px", cursor: "pointer" }}
            >
              Prijava putem e-maila
            </button>
            <button
              onClick={() => setLoginMethod("register")}
              style={{ width: "100%", padding: "10px", background: "#fbbc05", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
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
              style={{ width: "100%", padding: "10px", margin: "10px 0", borderRadius: "5px", border: "1px solid #ccc" }}
            />
            <input
              type="password"
              placeholder="Unesi lozinku"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: "10px", margin: "10px 0", borderRadius: "5px", border: "1px solid #ccc" }}
            />
            <button 
              onClick={handleEmailLogin} 
              disabled={loading || !email || !password}
              style={{ width: "100%", padding: "10px", background: "#34a853", color: "white", border: "none", borderRadius: "5px", cursor: (loading || !email || !password) ? "not-allowed" : "pointer" }}
            >
              {loading ? "Prijavljujem..." : "Prijavi se"}
            </button>
            <button 
              onClick={() => setLoginMethod("forgot")}
              style={{ width: "100%", padding: "10px", background: "#4285f4", color: "white", border: "none", borderRadius: "5px", marginTop: "10px" }}
            >
              Zaboravio sam lozinku
            </button>
            <button 
              onClick={handleBack} 
              style={{ width: "100%", padding: "10px", background: "#fbbc05", color: "white", border: "none", borderRadius: "5px", marginTop: "10px" }}
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
              style={{ width: "100%", padding: "10px", margin: "10px 0", borderRadius: "5px", border: "1px solid #ccc" }}
            />
            <input
              type="password"
              placeholder="Unesi lozinku"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: "10px", margin: "10px 0", borderRadius: "5px", border: "1px solid #ccc" }}
            />
            <input
              type="password"
              placeholder="Potvrdi lozinku"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ width: "100%", padding: "10px", margin: "10px 0", borderRadius: "5px", border: "1px solid #ccc" }}
            />
            <button 
              onClick={handleRegister} 
              disabled={loading || !email || !password || !confirmPassword}
              style={{ width: "100%", padding: "10px", background: "#fbbc05", color: "white", border: "none", borderRadius: "5px", cursor: (loading || !email || !password || !confirmPassword) ? "not-allowed" : "pointer" }}
            >
              {loading ? "Registrujem..." : "Registriraj se"}
            </button>
            <button 
              onClick={handleBack} 
              style={{ width: "100%", padding: "10px", background: "#4285f4", color: "white", border: "none", borderRadius: "5px", marginTop: "10px" }}
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
              style={{ width: "100%", padding: "10px", margin: "10px 0", borderRadius: "5px", border: "1px solid #ccc" }}
            />
            <button 
              onClick={handleForgotPassword} 
              disabled={loading || !email}
              style={{ width: "100%", padding: "10px", background: "#4285f4", color: "white", border: "none", borderRadius: "5px", cursor: (loading || !email) ? "not-allowed" : "pointer" }}
            >
              {loading ? "Šaljem link..." : "Pošalji link za reset"}
            </button>
            <button 
              onClick={handleBack} 
              style={{ width: "100%", padding: "10px", background: "#fbbc05", color: "white", border: "none", borderRadius: "5px", marginTop: "10px" }}
            >
              Nazad
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}