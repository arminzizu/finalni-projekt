"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../../lib/firebase"; // Ispravljena putanja do lib/firebase.ts (ako je u src/app/lib)
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

interface AppNameContextType {
  appName: string;
  setAppName: React.Dispatch<React.SetStateAction<string>>;
}

const AppNameContext = createContext<AppNameContextType | undefined>(undefined);

export function AppNameProvider({ children }: { children: React.ReactNode }) {
  // Učitaj iz localStorage prvo, zatim iz Firestore
  const [appName, setAppName] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("appName") || "Moja Aplikacija";
    }
    return "Moja Aplikacija";
  });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Prvo učitaj iz localStorage (prioritet)
        const localAppName = localStorage.getItem("appName");
        if (localAppName) {
          setAppName(localAppName);
        }

        const userDocRef = doc(db, "users", user.uid);
        
        // Pokušaj učitati appName iz Firestore-a (opcionalno, kao backup)
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            const firestoreAppName = data.appName;
            // Koristi Firestore samo ako nema u localStorage
            if (firestoreAppName && !localAppName) {
              setAppName(firestoreAppName);
              localStorage.setItem("appName", firestoreAppName);
            }
          }
        } catch (error: any) {
          // Ignoriraj greške dozvola - koristi localStorage
          if (error.code !== "permission-denied" && error.code !== "missing-or-insufficient-permissions") {
            console.warn("Greška pri učitavanju appName iz Firestore-a:", error);
          }
        }

        // Pokušaj postaviti real-time listener (opcionalno)
        try {
          const unsubscribeSnapshot = onSnapshot(
            userDocRef, 
            (doc) => {
              if (doc.exists()) {
                const data = doc.data();
                const firestoreAppName = data.appName;
                // Ažuriraj samo ako nema u localStorage ili ako je različito
                if (firestoreAppName && (!localAppName || firestoreAppName !== localAppName)) {
                  setAppName(firestoreAppName);
                  localStorage.setItem("appName", firestoreAppName);
                }
              }
            },
            (error) => {
              // Ignoriraj greške dozvola
              if (error.code !== "permission-denied" && error.code !== "missing-or-insufficient-permissions") {
                console.warn("Greška u onSnapshot za appName:", error);
              }
            }
          );

          return () => unsubscribeSnapshot();
        } catch (error: any) {
          // Ignoriraj greške dozvola
          if (error.code !== "permission-denied" && error.code !== "missing-or-insufficient-permissions") {
            console.warn("Greška pri postavljanju onSnapshot za appName:", error);
          }
        }
      } else {
        // Ako korisnik nije prijavljen, učitaj iz localStorage ili default
        const localAppName = localStorage.getItem("appName");
        setAppName(localAppName || "Moja Aplikacija");
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    // Spremi u localStorage (prioritet)
    if (appName.trim() !== "" && typeof window !== "undefined") {
      localStorage.setItem("appName", appName);
    }

    // Pokušaj spremiti u Firestore (opcionalno, kao backup)
    const saveAppName = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          await setDoc(userDocRef, { appName }, { merge: true });
        } catch (error: any) {
          // Ignoriraj greške dozvola - appName se i dalje koristi lokalno
          if (error.code !== "permission-denied" && error.code !== "missing-or-insufficient-permissions") {
            console.warn("Greška pri spremanju appName u Firestore:", error);
          }
        }
      }
    };
    if (appName.trim() !== "") {
      saveAppName();
    }
  }, [appName]);

  return (
    <AppNameContext.Provider value={{ appName, setAppName }}>
      {children}
    </AppNameContext.Provider>
  );
}

export const useAppName = () => {
  const context = useContext(AppNameContext);
  if (!context) {
    throw new Error("useAppName must be used within an AppNameProvider");
  }
  return context;
};