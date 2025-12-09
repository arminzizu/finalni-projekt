"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useCjenovnik } from "../context/CjenovnikContext";

// Helper funkcija za dohvaćanje korisnika iz localStorage
const getOfflineUser = () => {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("offlineUser");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

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
  staroPocetnoStanje?: number; // Za praćenje starog stanja pri ažuriranju
  sačuvanUlaz?: number; // Sačuvaj ulaz prije resetiranja za prikaz u arhivi
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
  staroPocetnoStanje?: number; // Staro stanje prije ažuriranja
  sačuvanUlaz?: number; // Sačuvani ulaz za prikaz u arhivi
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
  isAzuriran?: boolean; // Flag da je obračun bio ažuriran
  imaUlaz?: boolean; // Flag da obračun ima ulaz
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

const tableWrapperStyle: React.CSSProperties = {
  width: "100%",
  overflowX: "auto",
  marginBottom: "20px",
  WebkitOverflowScrolling: "touch",
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
  boxSizing: "border-box",
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

// Stilovi za niska stanja
const lowStockYellowStyle: React.CSSProperties = {
  backgroundColor: "#fef3c7", // Žuta pozadina
};

const lowStockRedStyle: React.CSSProperties = {
  backgroundColor: "#fee2e2", // Crvena pozadina
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
  boxSizing: "border-box",
};

// ---- Glavna komponenta ----
export default function ObracunPage() {
  const { cjenovnik, setCjenovnik } = useCjenovnik();
  // Subscription i Role context uklonjeni - koristimo localStorage/API
  const [subscription, setSubscription] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<any>(null);
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
  const [isAzuriran, setIsAzuriran] = useState<boolean>(false); // Praćenje da li je obračun bio ažuriran
  const [resetKey, setResetKey] = useState<number>(0); // Key za reset input polja
  const [isOwner, setIsOwner] = useState<boolean>(false); // Provjera da li je korisnik vlasnik
  const [hasUlazInCache, setHasUlazInCache] = useState<boolean>(false); // Provjera da li postoji ulaz u cache-u
  const [isUlazLocked, setIsUlazLocked] = useState<boolean>(false); // Provjera da li su ulazi zaključani
  
  // Postavke za malu zalihu
  const [lowStockEnabled, setLowStockEnabled] = useState<boolean>(false);
  const [lowStockThresholdZestoka, setLowStockThresholdZestoka] = useState<number>(100);
  const [lowStockThresholdOstala, setLowStockThresholdOstala] = useState<number>(10);
  
  // State za slike faktura
  const [invoiceImages, setInvoiceImages] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [savedInvoiceImagesCount, setSavedInvoiceImagesCount] = useState<number>(0); // Broj sačuvanih slika

  // Provjeri da li je korisnik vlasnik
  useEffect(() => {
    const checkIsOwner = () => {
      const user = getOfflineUser();
      if (user && user.email === "gitara.zizu@gmail.com") {
        setIsOwner(true);
      } else {
        setIsOwner(false);
      }
    };
    checkIsOwner();
  }, []);

  // Učitaj subscription i role
  useEffect(() => {
    const loadSubscription = async () => {
      try {
        const response = await fetch("/api/admin/subscription");
        if (response.ok) {
          const data = await response.json();
          setSubscription(data.subscription);
        }
      } catch (e) {
        console.warn("Greška pri učitavanju subscription:", e);
      }
    };
    loadSubscription();
    
    // Učitaj role iz localStorage
    const user = getOfflineUser();
    if (user?.email === "gitara.zizu@gmail.com") {
      setRole("vlasnik");
      setPermissions({ obracun: true });
    } else {
      setRole("korisnik");
      setPermissions({ obracun: true });
    }
  }, []);

  // Provjeri da li korisnik može editovati (ne može ako grace period istekne)
  const canEditSubscription = subscription && (subscription.isActive || subscription.isTrial || subscription.isGracePeriod);
  
  // Provjeri da li korisnik može editovati na osnovu uloge
  // Ako role je null ali korisnik ima aktivan subscription ili je vlasnik (isOwner), dozvoli pristup
  const canEdit = isOwner || canEditSubscription || (role === "vlasnik") || (role === "konobar" && permissions?.obracun === true);
  
  // Konobar2 može samo pregledati
  const isReadOnly = role === "konobar" && permissions?.obracun !== true;
  
  // Učitaj postavke za malu zalihu iz localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("lowStockSettings");
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setLowStockEnabled(settings.enabled || false);
        setLowStockThresholdZestoka(settings.thresholdZestoka || 100);
        setLowStockThresholdOstala(settings.thresholdOstala || 10);
      } catch (e) {
        console.warn("Greška pri učitavanju postavki:", e);
      }
    }
  }, []);

  // PRVO: Učitaj cache za trenutni datum PRIJE nego što se inicijaliziraju artikli
  // Ovo osigurava da se staroPocetnoStanje učitava iz cache-a prije nego što se artikli kreiraju
  const [ulazCacheForDatum, setUlazCacheForDatum] = useState<{ [naziv: string]: { ulaz: number; staroPocetnoStanje: number; sačuvanUlaz?: number } }>({});
  const [isCacheLoaded, setIsCacheLoaded] = useState<boolean>(false);

  // Helper funkcija za provjeru da li je datum aktivan (nije prošao)
  const isDatumAktivan = (datum: Date): boolean => {
    const danas = new Date();
    danas.setHours(0, 0, 0, 0);
    const provjeraDatuma = new Date(datum);
    provjeraDatuma.setHours(0, 0, 0, 0);
    return provjeraDatuma.getTime() === danas.getTime();
  };

  // Funkcija za uklanjanje undefined vrijednosti
  const removeUndefined = (obj: any): any => {
    if (obj === null || obj === undefined) {
      return null;
    }
    if (Array.isArray(obj)) {
      return obj.map(removeUndefined);
    }
    if (typeof obj === 'object') {
      const cleaned: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key) && obj[key] !== undefined) {
          cleaned[key] = removeUndefined(obj[key]);
        }
      }
      return cleaned;
    }
    return obj;
  };

  // Funkcija za spremanje draft obračuna u localStorage
  const saveDraftObracun = async (datumString: string) => {
    const user = getOfflineUser();
    if (!user) return;
    
    try {
      const ukupnoArtikli = artikli.reduce((sum, a) => sum + a.vrijednostKM, 0);
      const ukupnoRashod = rashodi.reduce((sum, r) => sum + r.cijena, 0);
      const ukupnoPrihod = prihodi.reduce((sum, p) => sum + p.cijena, 0);
      const neto = ukupnoArtikli + ukupnoPrihod - ukupnoRashod;
      
      // Provjeri da li obračun ima ulaz
      const imaUlaz = artikli.some((a) => a.ulaz !== 0);
      
      // Upload slika faktura ako postoje nove slike (File objekti)
      let invoiceImageUrls: string[] = [];
      if (invoiceImages.length > 0) {
        try {
          invoiceImageUrls = await uploadInvoiceImages(datumString);
        } catch (error) {
          console.warn("Greška pri upload-u slika u draft obračun:", error);
          // Nastavi bez slika
        }
      }
      
      // Učitaj postojeće slike iz draft-a (ako već postoje)
      let existingInvoiceImages: string[] = [];
      try {
        const savedDrafts = localStorage.getItem("draftObracuni");
        if (savedDrafts) {
          const drafts = JSON.parse(savedDrafts);
          const existingDraft = drafts[datumString];
          if (existingDraft) {
            existingInvoiceImages = existingDraft.invoiceImages || [];
          }
        }
      } catch (error) {
        // Ignoriraj greške
      }
      
      // Kombiniraj postojeće slike sa novim
      const allInvoiceImages = [...existingInvoiceImages, ...invoiceImageUrls];
      
      const draftData = {
        datum: datumString,
        artikli: artikli,
        rashodi: rashodi,
        prihodi: prihodi,
        ukupnoArtikli: ukupnoArtikli,
        ukupnoRashod: ukupnoRashod,
        ukupnoPrihod: ukupnoPrihod,
        neto: neto,
        imaUlaz: imaUlaz,
        isAzuriran: true,
        invoiceImages: allInvoiceImages,
        savedInvoiceImagesCount: allInvoiceImages.length,
        isDraft: true,
        updatedAt: new Date().toISOString(),
      };
      
      const cleanDraftData = removeUndefined(draftData);
      
      // Spremi u localStorage
      const savedDrafts = localStorage.getItem("draftObracuni");
      const drafts = savedDrafts ? JSON.parse(savedDrafts) : {};
      drafts[datumString] = cleanDraftData;
      localStorage.setItem("draftObracuni", JSON.stringify(drafts));
      console.log("💾 Draft obračun spremljen:", datumString);
      
      // Resetuj invoiceImages nakon upload-a
      if (invoiceImageUrls.length > 0) {
        setInvoiceImages([]);
        setSavedInvoiceImagesCount(allInvoiceImages.length);
      }
    } catch (error: any) {
      const errorCode = error?.code || "";
      if (!errorCode.includes("permission") && !errorCode.includes("insufficient")) {
        console.warn("Greška pri spremanju draft obračuna:", error);
      }
    }
  };

  // Funkcija za brisanje starih draft-ova (starijih od 24h)
  const deleteOldDrafts = async () => {
    const user = getOfflineUser();
    if (!user) return;
    
    try {
      const savedDrafts = localStorage.getItem("draftObracuni");
      if (!savedDrafts) return;
      
      const drafts = JSON.parse(savedDrafts);
      const now = new Date();
      const updatedDrafts: any = {};
      
      Object.keys(drafts).forEach((key) => {
        const draft = drafts[key];
        if (draft.deleted) {
          // Preskoči obrisane draft-ove
          return;
        }
        
        const updatedAt = draft.updatedAt;
        if (updatedAt) {
          const updatedAtDate = new Date(updatedAt);
          const diffInHours = (now.getTime() - updatedAtDate.getTime()) / (1000 * 60 * 60);
          
          if (diffInHours <= 24) {
            updatedDrafts[key] = draft;
          } else {
            console.log("🗑️ Brisanje starih draft-ova:", key);
          }
        } else {
          updatedDrafts[key] = draft;
        }
      });
      
      localStorage.setItem("draftObracuni", JSON.stringify(updatedDrafts));
    } catch (error: any) {
      const errorCode = error?.code || "";
      if (!errorCode.includes("permission") && !errorCode.includes("insufficient")) {
        console.warn("Greška pri brisanju starih draft-ova:", error);
      }
    }
  };

  // Funkcija za učitavanje draft obračuna iz localStorage
  const loadDraftObracun = async (datumString: string): Promise<any | null> => {
    const user = getOfflineUser();
    if (!user) return null;
    
    try {
      const savedDrafts = localStorage.getItem("draftObracuni");
      if (!savedDrafts) return null;
      
      const drafts = JSON.parse(savedDrafts);
      const draft = drafts[datumString];
      if (!draft) return null;
      
      // Provjeri da li je draft obrisan
      if (draft.deleted) return null;
      
      // Provjeri starost draft-a (24h)
      const updatedAt = draft.updatedAt;
      if (updatedAt) {
        const updatedAtDate = new Date(updatedAt);
        const now = new Date();
        const diffInHours = (now.getTime() - updatedAtDate.getTime()) / (1000 * 60 * 60);
        
        if (diffInHours > 24) {
          // Draft je stariji od 24h, obriši ga
          console.log("🗑️ Draft obračun stariji od 24h, brišem:", datumString);
          const savedDrafts = localStorage.getItem("draftObracuni");
          if (savedDrafts) {
            const drafts = JSON.parse(savedDrafts);
            delete drafts[datumString];
            localStorage.setItem("draftObracuni", JSON.stringify(drafts));
          }
          return null;
        }
      }
      
      console.log("📖 Draft obračun učitano:", datumString, draft);
      return draft;
    } catch (error: any) {
      console.warn("Greška pri učitavanju draft obračuna:", error);
    }
    return null;
  };

  // Funkcija za automatsko spremanje draft obračuna kao finalni obračun
  const autoSaveDraftAsFinal = async (datumString: string) => {
    const user = getOfflineUser();
    if (!user) return;
    
    try {
      const draftData = await loadDraftObracun(datumString);
      if (draftData) {
        // Spremi kao finalni obračun u localStorage i API
        const { isDraft, updatedAt, ...finalData } = draftData;
        const finalObracun = {
          ...finalData,
          datum: datumString,
          savedAt: new Date().toISOString(),
        };
        
        // Spremi u localStorage
        const arhiva = localStorage.getItem("arhivaObracuna");
        const arhivaList = arhiva ? JSON.parse(arhiva) : [];
        const existingIndex = arhivaList.findIndex((o: any) => o.datum === datumString);
        if (existingIndex >= 0) {
          arhivaList[existingIndex] = finalObracun;
        } else {
          arhivaList.push(finalObracun);
        }
        localStorage.setItem("arhivaObracuna", JSON.stringify(arhivaList));
        
        // Spremi u API
        try {
          await fetch("/api/obracuni", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(finalObracun),
          });
        } catch (apiError) {
          console.warn("Greška pri spremanju u API:", apiError);
        }
        
        // Obriši draft
        const savedDrafts = localStorage.getItem("draftObracuni");
        if (savedDrafts) {
          const drafts = JSON.parse(savedDrafts);
          drafts[datumString] = { ...drafts[datumString], deleted: true };
          localStorage.setItem("draftObracuni", JSON.stringify(drafts));
        }
        console.log("✅ Draft obračun automatski sačuvan kao finalni:", datumString);
      }
    } catch (error: any) {
      console.warn("Greška pri automatskom spremanju draft obračuna:", error);
    }
  };

  useEffect(() => {
    const datumString = formatirajDatum(trenutniDatum);
    const datumAktivan = isDatumAktivan(trenutniDatum);
    
    // PRVO učitaj cache za taj datum
    const loadCacheFirst = async () => {
      setIsCacheLoaded(false);
      
      // Obriši stare draft-ove (starije od 24h)
      await deleteOldDrafts();
      
      // Provjeri da li postoji draft obračun za ovaj datum
      const draftData = await loadDraftObracun(datumString);
      if (draftData) {
        // Ako postoji draft, učitaj podatke iz draft-a
        console.log("📖 Učitavam draft obračun:", datumString);
        setArtikli(draftData.artikli || []);
        setRashodi(draftData.rashodi || []);
        setPrihodi(draftData.prihodi || []);
        setIsAzuriran(draftData.isAzuriran || false);
        setIsUlazLocked(true); // Zaključaj ulaze jer je draft ažuriran
        setHasUlazInCache(draftData.imaUlaz || false);
        
        // Učitaj slike faktura (ako postoje URL-ovi u draft-u)
        if (draftData.invoiceImages && Array.isArray(draftData.invoiceImages) && draftData.invoiceImages.length > 0) {
          // Ako su URL-ovi (stringovi), koristi ih direktno
          // Ne možemo spremiti File objekte u Firestore, samo URL-ove
          setSavedInvoiceImagesCount(draftData.savedInvoiceImagesCount || draftData.invoiceImages.length);
        }
        
        setIsCacheLoaded(true);
        console.log("🟢 Draft obračun učitan, isCacheLoaded = true");
        return; // Ne nastavljaj dalje, draft je učitan
      }
      
      // Učitaj ulaz cache za taj datum
      const cache = await loadUlazCacheFromFirestore(datumString);
      console.log("🔵 Cache učitano za datum:", datumString, cache);
      setUlazCacheForDatum(cache);
      
      // Učitaj broj sačuvanih slika iz localStorage
      const user = getOfflineUser();
      if (user) {
        try {
          const cacheKey = `cache_${datumString}`;
          const cacheData = localStorage.getItem(cacheKey);
          if (cacheData) {
            const parsed = JSON.parse(cacheData);
            setSavedInvoiceImagesCount(parsed.savedInvoiceImagesCount || 0);
          } else {
            setSavedInvoiceImagesCount(0);
          }
        } catch (error: any) {
          console.warn("Greška pri učitavanju broja sačuvanih slika:", error);
          setSavedInvoiceImagesCount(0);
        }
      }
      
      // Provjeri da li postoji ulaz u cache-u
      const imaUlazUCache = Object.keys(cache).some(naziv => {
        const cached = cache[naziv];
        return (cached && cached.ulaz !== 0) || (cached && cached.staroPocetnoStanje !== undefined);
      });
      setHasUlazInCache(imaUlazUCache);
      
      // Ako postoji ulaz u cache-u, zaključaj ulaze
      if (imaUlazUCache) {
        setIsUlazLocked(true);
      }
      
      setIsCacheLoaded(true);
      console.log("🟢 Cache učitan, isCacheLoaded = true");
    };
    
    loadCacheFirst();
  }, [trenutniDatum]);

  // DRUGO: Inicijalizacija artikala na osnovu cjenovnika I cache-a
  useEffect(() => {
    if (cjenovnik.length === 0 || !isCacheLoaded) return; // Čekaj da se cache učita
    
    const datumString = formatirajDatum(trenutniDatum);
    const datumAktivan = isDatumAktivan(trenutniDatum);
    
    // Koristi već učitani cache umjesto ponovnog učitavanja
    const loadCacheAndInit = async () => {
      const ulazCache = ulazCacheForDatum; // Koristi već učitani cache
      console.log("🟡 Inicijalizacija artikala, cache:", ulazCache);
      
      // Draft obračun je uklonjen - inicijaliziraj artikle iz cjenovnika i cache-a
      
      // Ako nema postojećih artikala, inicijaliziraj sve iz cjenovnika
      if (artikli.length === 0) {
      const inicijalniArtikli = cjenovnik.map((item) => {
        const cached = ulazCache[item.naziv];
        const pocetnoStanje = item.naziv.toLowerCase().includes("kafa") ? 0 : item.pocetnoStanje;
        
        // Ako postoji cache sa ulazom, učitaj ga (ulaz ostaje vidljiv sve dok se obračun ne sačuva)
        if (cached && cached.ulaz !== 0) {
          console.log(`🟢 Artikal ${item.naziv}: cache postoji, ulaz=${cached.ulaz}, pocetnoStanje=${pocetnoStanje}`);
          // Učitaj ulaz iz cache-a - ostaje vidljiv sve dok se obračun ne sačuva
          return {
            naziv: item.naziv,
            cijena: item.cijena,
            pocetnoStanje: pocetnoStanje,
            ulaz: cached.ulaz, // Učitaj ulaz iz cache-a
            ukupno: pocetnoStanje + cached.ulaz,
            utroseno: 0,
            krajnjeStanje: 0,
            vrijednostKM: 0,
            zestokoKolicina: item.zestokoKolicina,
            proizvodnaCijena: item.proizvodnaCijena,
            isKrajnjeSet: false,
          };
        }
        
        // Ako nema cache, inicijaliziraj normalno
        return {
          naziv: item.naziv,
          cijena: item.cijena,
          pocetnoStanje: pocetnoStanje,
          ulaz: 0,
          ukupno: pocetnoStanje,
          utroseno: 0,
          krajnjeStanje: 0,
          vrijednostKM: 0,
          zestokoKolicina: item.zestokoKolicina,
          proizvodnaCijena: item.proizvodnaCijena,
          isKrajnjeSet: false,
        };
      });
      
      console.log("🟢 Inicijalni artikli kreirani:", inicijalniArtikli.map(a => ({ naziv: a.naziv, pocetnoStanje: a.pocetnoStanje, ulaz: a.ulaz })));
      setArtikli(inicijalniArtikli);
      setIsAzuriran(false);
      setResetKey(0);
      // Ako postoji ulaz u cache-u, zaključaj ulaze
      if (Object.keys(ulazCache).some(naziv => ulazCache[naziv] && ulazCache[naziv].ulaz !== 0)) {
        setIsUlazLocked(true);
        console.log("🔒 Ulazi zaključani jer postoji ulaz u cache-u");
      } else {
        setIsUlazLocked(false);
      }
      return;
    }
    
    // Ako postoje artikli, provjeri da li postoje novi artikli u cjenovniku
    const postojeciNazivi = new Set(artikli.map(a => a.naziv));
    const noviArtikli = cjenovnik.filter(item => !postojeciNazivi.has(item.naziv));
    
    // Ako postoje novi artikli, dodaj ih postojećim artiklima
    if (noviArtikli.length > 0) {
      console.log("Pronađeni novi artikli u cjenovniku:", noviArtikli.map(a => a.naziv));
      
      const noviArtikliZaDodati = noviArtikli.map((item) => {
        const cached = ulazCache[item.naziv];
        const pocetnoStanje = item.naziv.toLowerCase().includes("kafa") ? 0 : item.pocetnoStanje;
        
        // Ako postoji cache sa ulazom, učitaj ga
        if (cached && cached.ulaz !== 0) {
          return {
            naziv: item.naziv,
            cijena: item.cijena,
            pocetnoStanje: pocetnoStanje,
            ulaz: cached.ulaz, // Učitaj ulaz iz cache-a
            ukupno: pocetnoStanje + cached.ulaz,
            utroseno: 0,
            krajnjeStanje: 0,
            vrijednostKM: 0,
            zestokoKolicina: item.zestokoKolicina,
            proizvodnaCijena: item.proizvodnaCijena,
            isKrajnjeSet: false,
          };
        }
        
        return {
          naziv: item.naziv,
          cijena: item.cijena,
          pocetnoStanje: pocetnoStanje,
          ulaz: 0,
          ukupno: pocetnoStanje,
          utroseno: 0,
          krajnjeStanje: 0,
          vrijednostKM: 0,
          zestokoKolicina: item.zestokoKolicina,
          proizvodnaCijena: item.proizvodnaCijena,
          isKrajnjeSet: false,
        };
      });
      
      // Dodaj nove artikle postojećim
      setArtikli(prev => [...prev, ...noviArtikliZaDodati]);
    }
    
    // Ažuriraj postojeće artikle sa novim podacima iz cjenovnika (cijene, početno stanje, itd.)
    // VAŽNO: Uvijek provjeri cache i učitaj ulaz ako postoji (osobito nakon refresh-a)
    // Koristi već učitani cache umjesto ponovnog učitavanja
    const loadCacheForUpdate = async () => {
      const ulazCache = ulazCacheForDatum; // Koristi već učitani cache
      console.log("🟡 Ažuriranje postojećih artikala, cache:", ulazCache);
      
      setArtikli(prev => {
        const updated = prev.map(artikal => {
          const cjenovnikItem = cjenovnik.find(item => item.naziv === artikal.naziv);
          if (cjenovnikItem) {
            // Ažuriraj cijenu i početno stanje iz cjenovnika
            const pocetnoStanje = cjenovnikItem.naziv.toLowerCase().includes("kafa") ? 0 : cjenovnikItem.pocetnoStanje;
            const cached = ulazCache[artikal.naziv];
            
            // PRIORITET: Učitaj ulaz iz cache-a ako postoji (ulaz ostaje vidljiv sve dok se obračun ne sačuva)
            // Ovo osigurava da se ulaz učitava i nakon refresh-a
            let ulaz = artikal.ulaz;
            if (cached && cached.ulaz !== 0) {
              // Ako cache ima ulaz, učitaj ga (ulaz ostaje vidljiv)
              ulaz = cached.ulaz;
              console.log(`🟢 Učitavanje ulaz iz cache-a za ${artikal.naziv}: ${ulaz}`);
            }
            
            return {
              ...artikal,
              cijena: cjenovnikItem.cijena,
              pocetnoStanje: pocetnoStanje,
              zestokoKolicina: cjenovnikItem.zestokoKolicina,
              proizvodnaCijena: cjenovnikItem.proizvodnaCijena,
              // Učitaj ulaz iz cache-a ako postoji
              ulaz: ulaz,
              // Ažuriraj ukupno na osnovu novog početnog stanja i postojećeg ulaza
              ukupno: ulaz !== 0 ? pocetnoStanje + ulaz : pocetnoStanje,
              // Zadrži i ostala polja koja su možda postavljena
              utroseno: artikal.utroseno,
              krajnjeStanje: artikal.krajnjeStanje,
              vrijednostKM: artikal.vrijednostKM,
              isKrajnjeSet: artikal.isKrajnjeSet,
            };
          }
          return artikal;
        });
        console.log("🟢 Ažurirani artikli:", updated.map(a => ({ naziv: a.naziv, pocetnoStanje: a.pocetnoStanje, ulaz: a.ulaz })));
        
        // Ako postoji ulaz u cache-u, zaključaj ulaze
        const imaUlazUCache = Object.keys(ulazCache).some(naziv => {
          const cached = ulazCache[naziv];
          return cached && cached.ulaz !== 0;
        });
        if (imaUlazUCache) {
          setIsUlazLocked(true);
          console.log("🔒 Ulazi zaključani jer postoji ulaz u cache-u (ažuriranje postojećih artikala)");
        }
        
        return updated;
      });
    };
    
    // Uvijek pozovi loadCacheForUpdate da se osigura da se ulaz učitava iz cache-a
    // Ovo je posebno važno nakon refresh-a stranice
    loadCacheForUpdate();
    };
    
    loadCacheAndInit();
  }, [cjenovnik, trenutniDatum, isCacheLoaded, ulazCacheForDatum]);

  // Draft obračun je uklonjen - koristimo samo cache za ulaz vrijednosti

  // Uklonjen treći useEffect jer duplicira logiku drugog useEffect-a
  // Sva logika za učitavanje cache-a je sada u drugom useEffect-u

  const formatirajDatum = (datum: Date): string => {
    const dan = datum.getDate().toString().padStart(2, "0");
    const mjesec = (datum.getMonth() + 1).toString().padStart(2, "0");
    const godina = datum.getFullYear();
    return `${dan}.${mjesec}.${godina}.`;
  };

  // Helper funkcije za ulaz cache u Firestore (umjesto localStorage)
  const loadUlazCacheFromFirestore = async (datumString: string): Promise<{ [naziv: string]: { ulaz: number; staroPocetnoStanje: number; sačuvanUlaz?: number } }> => {
    const user = getOfflineUser();
    if (!user) return {};
    
    try {
      const cacheKey = `ulazCache_${datumString}`;
      const cacheData = localStorage.getItem(cacheKey);
      if (cacheData) {
        const parsed = JSON.parse(cacheData);
        return parsed.cache || {};
      }
    } catch (error: any) {
      console.warn("Greška pri učitavanju ulaz cache:", error);
    }
    return {};
  };

  // Helper funkcija za uklanjanje undefined vrijednosti iz objekta (već postoji gore)

  const saveUlazCacheToFirestore = async (datumString: string, ulazCache: { [naziv: string]: { ulaz: number; staroPocetnoStanje: number; sačuvanUlaz?: number } }) => {
    const user = getOfflineUser();
    if (!user) return;
    
    try {
      // Očisti undefined vrijednosti prije spremanja
      const cleanedCache = removeUndefined(ulazCache);
      
      const cacheKey = `ulazCache_${datumString}`;
      localStorage.setItem(cacheKey, JSON.stringify({
        cache: cleanedCache,
        datum: datumString,
        updatedAt: new Date().toISOString(),
      }));
    } catch (error: any) {
      console.warn("Greška pri spremanju ulaz cache:", error);
    }
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
    setArtikli((prev) => {
      const updated = prev.map((a, i) => {
        if (i !== index) return a;
        
        // Izračunaj novo ukupno stanje (početno + ulaz)
        const novoUkupno = a.pocetnoStanje + value;
        
        // Sačuvaj staro početno stanje ako već nije postavljeno i ako ima ulaz (pozitivan ili negativan)
        const novoStaroPocetnoStanje = a.staroPocetnoStanje !== undefined 
          ? a.staroPocetnoStanje 
          : (value !== 0 ? a.pocetnoStanje : undefined);
        
        // Ako je postavljeno krajnje stanje, izračunaj utrošeno i vrijednost na osnovu novog ukupnog
        let utroseno = 0;
        let vrijednostKM = 0;
        
        if (a.isKrajnjeSet && a.krajnjeStanje > 0) {
          // Za kafu, utrošeno = krajnje stanje
          if (a.naziv.toLowerCase().includes("kafa")) {
            utroseno = a.krajnjeStanje;
            vrijednostKM = utroseno * a.cijena;
          } else {
            // Za ostale artikle, utrošeno = ukupno - krajnje stanje
            utroseno = Math.max(novoUkupno - a.krajnjeStanje, 0);
            vrijednostKM = a.zestokoKolicina
              ? (utroseno / a.zestokoKolicina) * a.cijena
              : utroseno * a.cijena;
          }
        }
        
        return {
          ...a,
          ulaz: value,
          ukupno: novoUkupno, // Početno stanje + ulaz
          staroPocetnoStanje: novoStaroPocetnoStanje,
          utroseno: utroseno,
          vrijednostKM: vrijednostKM,
        };
      });
      
      // Postavi flag da postoji ulaz ako bilo koji artikal ima ulaz
      const imaUlaz = updated.some((a) => a.ulaz !== 0);
      if (imaUlaz) {
        setHasUlazInCache(true);
      }
      
      // Automatski sačuvaj u Firestore cache (bez čekanja)
      const datumString = formatirajDatum(trenutniDatum);
      const saveCacheAsync = async () => {
        try {
          const existingCache = await loadUlazCacheFromFirestore(datumString);
          let ulazCache: { [naziv: string]: { ulaz: number; staroPocetnoStanje: number; sačuvanUlaz?: number } } = existingCache;
          
          // Ažuriraj cache sa novim podacima
          updated.forEach((a) => {
            if (a.ulaz !== 0 || a.staroPocetnoStanje !== undefined) {
              ulazCache[a.naziv] = {
                ulaz: a.ulaz,
                staroPocetnoStanje: a.staroPocetnoStanje ?? a.pocetnoStanje,
                sačuvanUlaz: a.sačuvanUlaz, // Sačuvaj sačuvanUlaz ako postoji
              };
            }
          });
          
          await saveUlazCacheToFirestore(datumString, ulazCache);
        } catch (error) {
          console.warn("Greška pri automatskom spremanju ulaz cache:", error);
        }
      };
      saveCacheAsync(); // Pokreni asinkrono, ne blokiraj UI
      
      return updated;
    });
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

  // Funkcija za ažuriranje obračuna (bez spremanja u arhivu)
  const handleAzurirajObracun = async () => {
    // Provjeri da li ima artikala s ulazom (pozitivnim ili negativnim)
    const imaUlaz = artikli.some((a) => a.ulaz !== 0);
    if (!imaUlaz) {
      alert("Nema artikala s ulazom za ažuriranje!");
      return;
    }

    const datumString = formatirajDatum(trenutniDatum);

    // Učitaj postojeći cache iz Firestore da ne izgubimo podatke
    const existingCache = await loadUlazCacheFromFirestore(datumString);
    let ulazCache: { [naziv: string]: { ulaz: number; staroPocetnoStanje: number; sačuvanUlaz?: number } } = existingCache;
    
    // Ažuriraj cache sa novim podacima - SAČUVAJ ulaz prije nego što se resetira
    artikli.forEach((a) => {
      if (a.ulaz !== 0) {
        // Ako ima ulaz, ažuriraj cache sa ulazom i starim početnim stanjem
        ulazCache[a.naziv] = {
          ulaz: a.ulaz, // Sačuvaj ulaz
          staroPocetnoStanje: a.staroPocetnoStanje ?? a.pocetnoStanje,
        };
      } else if (a.staroPocetnoStanje !== undefined) {
        // Ako nema ulaz ali ima staroPocetnoStanje (već je ažuriran), sačuvaj staroPocetnoStanje i sačuvanUlaz
        // Postavi ulaz na 0 da znamo da je već ažuriran
        const sačuvanUlaz = a.sačuvanUlaz ?? (a.pocetnoStanje - a.staroPocetnoStanje);
        ulazCache[a.naziv] = {
          ulaz: 0,
          staroPocetnoStanje: a.staroPocetnoStanje,
          sačuvanUlaz: sačuvanUlaz > 0 ? sačuvanUlaz : undefined, // Sačuvaj ulaz za prikaz u arhivi
        };
      }
    });

    // Spremi cache u Firestore PRIJE nego što se artikli ažuriraju
    await saveUlazCacheToFirestore(datumString, ulazCache);
    console.log("💾 Cache spremljen u Firestore:", ulazCache);
    
    // Ažuriraj lokalni state cache-a da se odmah koristi
    setUlazCacheForDatum(ulazCache);

    // NE mijenjaj cjenovnik - početno stanje ostaje nepromijenjeno sve dok se obračun ne sačuva
    // Samo sačuvaj ulaz u cache da ostane vidljiv

    // Ažuriraj artikle u formi - ZADRŽI početno stanje i ulaz (ne mijenjaj ništa)
    // Ulaz će ostati vidljiv sve dok se obračun ne sačuva
    // Ukupno se računa kao pocetnoStanje + ulaz samo za prikaz
    const updated = artikli.map((a) => {
      if (a.ulaz !== 0) {
        return {
          ...a,
          // NE mijenjaj početno stanje - ostaje kako je
          pocetnoStanje: a.pocetnoStanje,
          ulaz: a.ulaz, // ZADRŽI ulaz - ne resetiraj ga!
          ukupno: a.pocetnoStanje + a.ulaz, // Ukupno = početno stanje + ulaz (samo za prikaz)
          // Ne resetiraj utrošeno, vrijednost, krajnje stanje - ostaju kako su
        };
      }
      // Za artikle bez ulaza, zadrži sve kako je
      return a;
    });
    
    setArtikli(updated);
    
    // Cache je već sačuvan gore, samo ažuriraj lokalni state
    // Ažuriraj lokalni state cache-a da se odmah koristi
    setUlazCacheForDatum(ulazCache);
    
    // Postavi flag da postoji ulaz u cache-u (za prikaz gumba za slike)
    setHasUlazInCache(true);

    setIsAzuriran(true); // Označi da je obračun bio ažuriran
    setIsUlazLocked(true); // Zaključaj ulaze nakon ažuriranja
    
    // Spremi draft obračun u Firestore
    await saveDraftObracun(datumString);
    
    alert("Ulaz je sačuvan i zaključan! Kliknite 'Uredi' ako želite promijeniti vrijednosti.");
  };

  // Provjeri da li obračun ima ulaz (trenutni ulaz, sačuvan ulaz, ili u cache-u)
  const hasUlaz = artikli.some((a) => a.ulaz !== 0 || (a.sačuvanUlaz !== undefined && a.sačuvanUlaz !== 0)) || hasUlazInCache;

  // Funkcija za upload slika faktura
  const uploadInvoiceImages = async (datumString: string): Promise<string[]> => {
    // Ako nema slika, odmah vrati prazan array bez pozivanja Firebase API-ja
    if (invoiceImages.length === 0) {
      console.log("Nema slika za upload, preskačem");
      return [];
    }
    
    const user = getOfflineUser();
    if (!user) {
      throw new Error("Korisnik nije autentifikovan");
    }
    
    const userId = user.userId || "default";
    
    // Očisti datum string za Storage putanju (ukloni tačku na kraju ako postoji)
    const cleanDatumString = datumString.replace(/\.$/, '');

    const uploadedUrls: string[] = [];
    setUploadingImages(true);
    setUploadProgress(0);

    try {
      // Konvertuj slike u base64 i spremi u localStorage
      for (let i = 0; i < invoiceImages.length; i++) {
        const file = invoiceImages[i];
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop() || 'jpg';
        const fileName = `${cleanDatumString}_${timestamp}_${i}.${fileExtension}`;
        
        // Konvertuj u base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        
        // Spremi u localStorage
        const imageKey = `invoice_image_${userId}_${cleanDatumString}_${fileName}`;
        localStorage.setItem(imageKey, base64);
        
        // Koristi data URL kao "download URL"
        uploadedUrls.push(base64);
        
        console.log("Slika uspješno spremljena:", fileName);
        
        setUploadProgress(((i + 1) / invoiceImages.length) * 100);
      }
    } catch (error: any) {
      console.error("Greška pri spremanju slika:", error);
      throw new Error("Greška pri spremanju slika: " + (error.message || "Nepoznata greška"));
    } finally {
      setUploadingImages(false);
      setUploadProgress(0);
    }

    return uploadedUrls;
  };

  // Funkcija za brisanje slike iz preview-a
  const removeImageFromPreview = (index: number) => {
    setInvoiceImages(invoiceImages.filter((_, i) => i !== index));
  };

  // Čuvanje obračuna (localStorage + opcionalno Firestore)
  const handleSaveObracun = async () => {
    const ukupnoArtikli = artikli.reduce((sum, a) => sum + a.vrijednostKM, 0);
    const ukupnoRashod = rashodi.reduce((sum, r) => sum + r.cijena, 0);
    const ukupnoPrihod = prihodi.reduce((sum, p) => sum + p.cijena, 0);
    const neto = ukupnoArtikli + ukupnoPrihod - ukupnoRashod;
    const datumString = formatirajDatum(trenutniDatum);

    // Učitaj cache ulaza za ovaj datum iz Firestore
    const ulazCache = await loadUlazCacheFromFirestore(datumString);

    // Provjeri da li obračun ima ulaz
    // Provjeri trenutni ulaz u state-u ili sačuvan ulaz (ako je obračun već ažuriran)
    // Ne provjeravaj cache jer to može biti iz prethodnih obračuna
    const imaUlaz = artikli.some((a) => {
      // Provjeri trenutni ulaz
      if (a.ulaz !== 0) {
        return true;
      }
      // Provjeri sačuvan ulaz (ako je obračun već ažuriran, ulaz je resetovan na 0 ali je sačuvan)
      if (a.sačuvanUlaz !== undefined && a.sačuvanUlaz !== 0) {
        return true;
      }
      // Provjeri cache (ako postoji ulaz u cache-u za ovaj datum)
      if (ulazCache[a.naziv] && ulazCache[a.naziv].ulaz !== 0) {
        return true;
      }
      return false;
    });

    const arhiviraniObracun: ArhiviraniObracun = {
      datum: datumString,
      ukupnoArtikli,
      ukupnoRashod,
      ukupnoPrihod,
      neto,
      artikli: artikli.map((a) => {
        // Prioritet: 1. trenutni ulaz, 2. sačuvani ulaz u state-u, 3. ulaz iz cache-a
        let ulazZaPrikaz = 0;
        let staroPocetnoStanjeZaPrikaz = a.staroPocetnoStanje;

        // Ako trenutni ulaz nije 0, koristi ga (direktno spremanje bez ažuriranja)
        if (a.ulaz !== 0) {
          ulazZaPrikaz = a.ulaz;
          // Ako nema staroPocetnoStanje, postavi ga na trenutno početno stanje
          if (a.staroPocetnoStanje === undefined) {
            staroPocetnoStanjeZaPrikaz = a.pocetnoStanje;
          }
        } 
        // Ako trenutni ulaz je 0, provjeri sačuvan ulaz (ako je obračun već ažuriran)
        else if (a.sačuvanUlaz !== undefined && a.sačuvanUlaz !== 0) {
          // Kada je obračun ažuriran, ulaz je resetovan na 0, ali je sačuvan u sačuvanUlaz
          // Koristi sačuvanUlaz za prikaz u arhivi
          ulazZaPrikaz = a.sačuvanUlaz;
          staroPocetnoStanjeZaPrikaz = a.staroPocetnoStanje;
        } 
        // Ako nema ni trenutni ni sačuvan ulaz, provjeri cache
        else if (ulazCache[a.naziv] && ulazCache[a.naziv].ulaz !== 0) {
          ulazZaPrikaz = ulazCache[a.naziv].ulaz;
          staroPocetnoStanjeZaPrikaz = ulazCache[a.naziv].staroPocetnoStanje;
        }
        
        // Kreiraj objekt bez undefined vrijednosti
        // VAŽNO: Ako nije postavljeno krajnje stanje, krajnje stanje = ukupno (početno + ulaz)
        // Ako je krajnje stanje 0 ili nije postavljeno, koristi ukupno
        // Ukupno = početno stanje + ulaz (za prikaz u arhivi)
        const ukupnoZaPrikaz = ulazZaPrikaz !== 0 ? a.pocetnoStanje + ulazZaPrikaz : a.ukupno;
        const krajnjeStanjeZaPrikaz = (a.isKrajnjeSet && a.krajnjeStanje !== undefined && a.krajnjeStanje !== null && a.krajnjeStanje > 0)
          ? a.krajnjeStanje 
          : (ukupnoZaPrikaz !== undefined && ukupnoZaPrikaz !== null && ukupnoZaPrikaz > 0)
          ? ukupnoZaPrikaz
          : (a.pocetnoStanje !== undefined && a.pocetnoStanje !== null && a.pocetnoStanje > 0)
          ? a.pocetnoStanje
          : 0; // Fallback na 0 ako ništa nije postavljeno
        
        const artikalObj: any = {
          naziv: a.naziv,
          cijena: a.cijena,
          pocetnoStanje: a.pocetnoStanje, // Početno stanje ostaje nepromijenjeno (ulaz se zbraja tek pri spremanju)
          ulaz: ulazZaPrikaz, // Sačuvaj ulaz za prikaz u arhivi - OBAVEZNO postavi ulaz ako postoji
          ukupno: ukupnoZaPrikaz, // Ukupno = početno stanje + ulaz
          utroseno: a.utroseno,
          krajnjeStanje: krajnjeStanjeZaPrikaz, // Uvijek postavi krajnje stanje (ili postavljeno ili ukupno)
          vrijednostKM: a.vrijednostKM,
        };
        
        // Dodaj opcionalna polja samo ako nisu undefined
        if (a.zestokoKolicina !== undefined) {
          artikalObj.zestokoKolicina = a.zestokoKolicina;
        }
        if (a.proizvodnaCijena !== undefined) {
          artikalObj.proizvodnaCijena = a.proizvodnaCijena;
        }
        if (staroPocetnoStanjeZaPrikaz !== undefined) {
          artikalObj.staroPocetnoStanje = staroPocetnoStanjeZaPrikaz;
        }
        if (ulazZaPrikaz !== 0) {
          artikalObj.sačuvanUlaz = ulazZaPrikaz;
        }
        
        return artikalObj;
      }),
      rashodi,
      prihodi,
      isAzuriran: isAzuriran, // Sačuvaj flag da je obračun bio ažuriran
      imaUlaz: imaUlaz, // Sačuvaj flag da obračun ima ulaz
    };

    // NE briši cache - možda će korisnik htjeti vidjeti ulaz u arhivi
    // Cache se automatski ažurira kada se promijeni datum

    const user = getOfflineUser();
    const userId = user?.userId || "default";

    // Upload slika faktura ako postoje nove slike u state-u
    let invoiceImageUrls: string[] = [];
    if (invoiceImages.length > 0 && user) {
      try {
        invoiceImageUrls = await uploadInvoiceImages(datumString);
      } catch (error) {
        console.error("Greška pri spremanju slika faktura:", error);
        alert("Upozorenje: Obračun je sačuvan, ali slike faktura nisu uspješno spremljene.");
      }
    }
    
    // Učitaj postojeće slike iz localStorage (ako su već spremljene ranije)
    let existingInvoiceImages: string[] = [];
    if (user) {
      try {
        const arhiva = localStorage.getItem("arhivaObracuna");
        if (arhiva) {
          const arhivaList = JSON.parse(arhiva);
          const existingObracun = arhivaList.find((o: any) => o.datum === datumString);
          if (existingObracun && existingObracun.invoiceImages) {
            existingInvoiceImages = existingObracun.invoiceImages;
          }
        }
      } catch (error) {
        console.warn("Greška pri učitavanju postojećih slika:", error);
      }
    }
    
    // Kombiniraj postojeće slike sa novim (ako postoje)
    const allInvoiceImages = [...existingInvoiceImages, ...invoiceImageUrls];
    if (allInvoiceImages.length > 0) {
      (arhiviraniObracun as any).invoiceImages = allInvoiceImages;
    }

    // Spremi u localStorage i API
    try {
      // Funkcija za uklanjanje undefined vrijednosti
      const removeUndefined = (obj: any): any => {
        if (obj === null || obj === undefined) {
          return null;
        }
        if (Array.isArray(obj)) {
          return obj.map(removeUndefined);
        }
        if (typeof obj === 'object') {
          const cleaned: any = {};
          for (const key in obj) {
            if (obj.hasOwnProperty(key) && obj[key] !== undefined) {
              cleaned[key] = removeUndefined(obj[key]);
            }
          }
          return cleaned;
        }
        return obj;
      };
      
      const cleanArhiviraniObracun = removeUndefined({
        ...arhiviraniObracun,
        savedAt: new Date().toISOString(),
      });
      
      // Spremi u localStorage
      const arhiva = localStorage.getItem("arhivaObracuna");
      const arhivaList = arhiva ? JSON.parse(arhiva) : [];
      const existingIndex = arhivaList.findIndex((o: any) => o.datum === datumString);
      if (existingIndex >= 0) {
        arhivaList[existingIndex] = cleanArhiviraniObracun;
      } else {
        arhivaList.push(cleanArhiviraniObracun);
      }
      localStorage.setItem("arhivaObracuna", JSON.stringify(arhivaList));
      
      // Spremi u API
      try {
        await fetch("/api/obracuni", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cleanArhiviraniObracun),
        });
      } catch (apiError) {
        console.warn("Greška pri spremanju u API:", apiError);
      }
      
      console.log("Obračun sačuvan:", datumString);

      // Resetuj slike faktura nakon uspješnog spremanja
      setInvoiceImages([]);
      setSavedInvoiceImagesCount(0);
      setHasUlazInCache(false); // Resetuj flag da nema ulaz u cache-u
      
      // Obriši broj sačuvanih slika iz cache-a jer je obračun sačuvan
      if (user) {
        try {
          const cacheKey = `cache_${datumString}`;
          const cacheData = localStorage.getItem(cacheKey);
          if (cacheData) {
            const parsed = JSON.parse(cacheData);
            parsed.savedInvoiceImagesCount = 0;
            localStorage.setItem(cacheKey, JSON.stringify(parsed));
          }
        } catch (error: any) {
          console.warn("Greška pri brisanju broja sačuvanih slika:", error);
        }
      }

      // Ažuriranje cjenovnika (početno stanje za sljedeći dan = krajnje stanje iz ovog dana)
      // VAŽNO: Ažuriraj cjenovnik PRIJE promjene datuma, da se novi datum učita sa ispravnim početnim stanjem
      // Kada se sačuva obračun, ulaz se zbraja sa početnim stanjem i postaje novo početno stanje za sljedeći dan
      setCjenovnik((prev) =>
        prev.map((item) => {
          const artikal = artikli.find((a) => a.naziv === item.naziv);
          if (!artikal) return item;
          
          // Provjeri da li artikal ima ulaz (trenutni ili iz cache-a)
          let ulazZaPrikaz = artikal.ulaz;
          if (ulazZaPrikaz === 0 && ulazCache[artikal.naziv] && ulazCache[artikal.naziv].ulaz !== 0) {
            ulazZaPrikaz = ulazCache[artikal.naziv].ulaz;
          }
          
          // Za sljedeći dan, početno stanje = krajnje stanje iz ovog dana (ili početno + ulaz ako nije postavljeno krajnje)
          // Kada se sačuva obračun, ulaz se zbraja sa početnim stanjem i postaje novo početno stanje za sljedeći dan
          let novoPocetnoStanje: number;
          if (artikal.naziv.toLowerCase().includes("kafa")) {
            novoPocetnoStanje = 0; // Kafa se uvijek resetuje na 0
          } else if (artikal.isKrajnjeSet && artikal.krajnjeStanje > 0) {
            // Ako je postavljeno krajnje stanje, koristi ga
            novoPocetnoStanje = artikal.krajnjeStanje;
          } else if (ulazZaPrikaz !== 0) {
            // Ako ima ulaz, početno stanje za sljedeći dan = početno stanje + ulaz
            novoPocetnoStanje = artikal.pocetnoStanje + ulazZaPrikaz;
          } else {
            // Ako nema ulaz i nije postavljeno krajnje stanje, koristi ukupno
            novoPocetnoStanje = artikal.ukupno;
          }
          
          console.log(`Ažuriranje cjenovnika za ${item.naziv}: ${item.pocetnoStanje} -> ${novoPocetnoStanje} (ulaz: ${ulazZaPrikaz}, krajnje: ${artikal.krajnjeStanje}, ukupno: ${artikal.ukupno})`);
          
          return {
            ...item,
            pocetnoStanje: novoPocetnoStanje,
          };
        })
      );
      
      // Obriši draft obračun jer je sada sačuvan u arhivi
      if (user) {
        try {
          const savedDrafts = localStorage.getItem("draftObracuni");
          if (savedDrafts) {
            const drafts = JSON.parse(savedDrafts);
            delete drafts[datumString];
            localStorage.setItem("draftObracuni", JSON.stringify(drafts));
          }
          console.log("🗑️ Draft obračun obrisan za datum:", datumString);
        } catch (error) {
          console.warn("Greška pri brisanju draft obračuna:", error);
        }
      }

      // Obriši ulaz cache za ovaj datum jer je obračun sačuvan
      // Za naredni dan, vrijednosti iz ulaza se postavljaju na nulu
      if (user) {
        try {
          const cacheKey = `ulazCache_${datumString}`;
          localStorage.removeItem(cacheKey);
          setUlazCacheForDatum({});
          setHasUlazInCache(false);
          console.log("🗑️ Ulaz cache obrisan za datum:", datumString);
        } catch (error) {
          console.warn("Greška pri brisanju ulaz cache:", error);
        }
      }

      // Povećaj datum za jedan dan (prebacivanje na novi dan)
      const noviDatum = new Date(trenutniDatum);
      noviDatum.setDate(noviDatum.getDate() + 1);
      setTrenutniDatum(noviDatum);

      setRashodi([]);
      setPrihodi([]);
      setNewRashod({ naziv: "", cijena: 0 });
      setNewPrihod({ naziv: "", cijena: 0 });
      setEditRashodIndex(null);
      setEditPrihodIndex(null);
      setIsAzuriran(false); // Resetiraj flag nakon spremanja
      setIsUlazLocked(false); // Otključaj ulaze za novi dan
      setResetKey((prev) => prev + 1); // Povećaj reset key da se input polja potpuno resetiraju
      
      // Eksplicitno resetiraj artikle na prazan niz da se useEffect pokrene i inicijalizira nove artikle
      // Ovo će osigurati da se artikli odmah resetiraju za novi dan
      setArtikli([]);

      // Emituj događaj (ako koristiš fallback)
      window.dispatchEvent(new Event("arhivaChanged"));

      alert("Obračun uspješno sačuvan!");
    } catch (error) {
      console.error("Greška pri čuvanju:", error);
      alert("Greška pri čuvanju. Provjeri konzolu za detalje.");
    }
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
      {!canEdit && subscription && !subscription.isActive && !subscription.isTrial && !subscription.isGracePeriod && (
        <div style={{
          padding: "16px",
          background: "#fee2e2",
          border: "2px solid #dc2626",
          borderRadius: "8px",
          marginBottom: "20px",
          textAlign: "center"
        }}>
          <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#dc2626" }}>
            ⚠️ Vaša pretplata je istekla. Možete samo pregledavati podatke, ali ne možete unositi nove obračune.
          </p>
          <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "#6b7280" }}>
            Aktivirajte pretplatu na stranici profila da biste nastavili koristiti aplikaciju.
          </p>
        </div>
      )}
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
        button[style*="background: #f59e0b"]:hover {
          background-color: #d97706 !important;
        }
        @media (max-width: 768px) {
          /* Spriječi automatsko zumiranje na input poljima - iOS Safari zumira ako je font-size < 16px */
          input[type="text"],
          input[type="number"],
          input[type="tel"],
          input[type="email"],
          input[type="date"],
          input[type="time"],
          input[type="datetime-local"],
          textarea,
          select {
            font-size: 16px !important;
          }
          div[style*="maxWidth: 1200px"] { 
            padding: 8px !important;
            margin: 0 auto !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          /* Osiguraj da je parent container centriran na mobilnom */
          div[style*="padding: 20px"][style*="width: 100%"] {
            padding-left: 10px !important;
            padding-right: 10px !important;
            padding-top: 10px !important;
            padding-bottom: 10px !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
          }
          /* Osiguraj da je obracun container centriran */
          div[style*="maxWidth: 1200px"] {
            margin-left: auto !important;
            margin-right: auto !important;
          }
          table:first-of-type { display: flex; flex-direction: column; }
          table:first-of-type thead { display: none; }
          table:first-of-type tbody { display: flex; flex-direction: column; gap: 16px; }
          table:first-of-type tr { display: flex; flex-direction: column; background: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); padding: 12px; }
          table:first-of-type td { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: none; font-size: 13px; }
          table:first-of-type td:before { content: attr(data-label); font-weight: 600; color: #1f2937; width: 50%; }
          table:first-of-type td[data-label="Artikal"] { color: #1e40af !important; font-weight: 600 !important; font-size: 15px !important; }
          table:first-of-type td input { max-width: 100%; width: 100%; }
          div[style*="overflowX: auto"] {
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          table:not(:first-of-type) { 
            width: 100%;
            min-width: 400px;
            box-sizing: border-box;
          }
          table:not(:first-of-type) thead,
          table:not(:first-of-type) tbody,
          table:not(:first-of-type) tr {
            display: table;
            width: 100%;
            table-layout: fixed;
          }
          table:not(:first-of-type) th, 
          table:not(:first-of-type) td { 
            min-width: 100px; 
            font-size: 13px; 
            padding: 8px;
            word-wrap: break-word;
            box-sizing: border-box;
          }
          table:not(:first-of-type) th:last-child,
          table:not(:first-of-type) td:last-child {
            width: auto;
            min-width: 120px;
            white-space: nowrap;
          }
          table:not(:first-of-type) td:last-child button {
            display: inline-block;
            margin: 0 4px;
            padding: 6px 8px;
            font-size: 12px;
          }
          input, button { width: 100%; max-width: 100%; margin-bottom: 8px; font-size: 13px; box-sizing: border-box; }
          input[type="date"] { max-width: 100%; }
          div[style*="display: flex"] { 
            flex-direction: column; 
            align-items: stretch; 
            gap: 8px;
            width: 100%;
            box-sizing: border-box;
          }
          div[style*="marginTop: 20px"][style*="display: flex"] {
            flex-wrap: wrap;
          }
          div[style*="marginTop: 20px"][style*="display: flex"] input {
            flex: 1 1 auto;
            min-width: 0;
            max-width: calc(50% - 4px);
          }
          div[style*="marginTop: 20px"][style*="display: flex"] button {
            flex: 1 1 100%;
            max-width: 100%;
          }
          h1 { font-size: 20px; margin-bottom: 16px; }
          h2 { font-size: 16px; margin-bottom: 12px; }
          h3 { font-size: 14px; margin: 6px 0; }
        }
      `}</style>

      <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#1f2937", marginBottom: "24px" }}>
        Obračun
      </h1>

      {isReadOnly && (
        <div style={{ 
          marginBottom: "20px", 
          padding: "12px 16px", 
          background: "#fef3c7", 
          borderRadius: "8px", 
          border: "1px solid #f59e0b",
          color: "#92400e"
        }}>
          <strong>Pregled mod:</strong> Vaša uloga (Konobar 2) omogućava samo pregled podataka. Niste u mogućnosti unositi ili mijenjati podatke.
        </div>
      )}

      <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
        <label style={{ fontSize: "14px", color: "#1f2937", marginRight: "8px" }}>
          Datum obračuna:
        </label>
        <input
          type="date"
          value={formatDateForInput(trenutniDatum)}
          onChange={handleDatumChange}
          style={dateInputStyle}
        />
        <button 
          style={{ ...buttonStyle, background: "#f59e0b", maxWidth: "160px", opacity: (canEdit && !isUlazLocked) ? 1 : 0.5, cursor: (canEdit && !isUlazLocked) ? "pointer" : "not-allowed" }} 
          onClick={handleAzurirajObracun}
          disabled={!canEdit || isUlazLocked}
        >
          Ažuriraj obračun
        </button>
        {/* Gumb "Uredi" za otključavanje ulaza - prikazuje se samo ako su ulazi zaključani */}
        {isUlazLocked && (
          <button 
            style={{ ...buttonStyle, background: "#6366f1", maxWidth: "160px", opacity: canEdit ? 1 : 0.5, cursor: canEdit ? "pointer" : "not-allowed" }} 
            onClick={() => setIsUlazLocked(false)}
            disabled={!canEdit}
          >
            Uredi ulaz
          </button>
        )}
        <button 
          style={{ ...saveButtonStyle, opacity: canEdit ? 1 : 0.5, cursor: canEdit ? "pointer" : "not-allowed" }} 
          onClick={handleSaveObracun} 
          className="save-button"
          disabled={!canEdit || uploadingImages}
        >
          {uploadingImages ? `Upload slika... ${Math.round(uploadProgress)}%` : "Sačuvaj obračun"}
        </button>
        {/* Upload slika faktura - prikazuje se samo ako ima ulaz (sve dok obračun nije sačuvan) */}
        {hasUlaz && (
          <label
            style={{
              ...buttonStyle,
              background: "#3b82f6",
              maxWidth: "160px",
              opacity: canEdit ? 1 : 0.5,
              cursor: canEdit ? "pointer" : "not-allowed",
              display: "inline-block",
              marginRight: "8px",
              marginBottom: "8px"
            }}
            onMouseEnter={(e) => {
              if (canEdit) {
                e.currentTarget.style.background = "#2563eb";
              }
            }}
            onMouseLeave={(e) => {
              if (canEdit) {
                e.currentTarget.style.background = "#3b82f6";
              }
            }}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setInvoiceImages([...invoiceImages, ...files]);
                e.target.value = ""; // Reset input
              }}
              style={{ display: "none" }}
              disabled={!canEdit}
            />
            📸 Dodaj slike fakture{(invoiceImages.length > 0 || savedInvoiceImagesCount > 0) ? ` (${invoiceImages.length + savedInvoiceImagesCount})` : ""}
          </label>
        )}
        {isAzuriran && (
          <span style={{ fontSize: "14px", color: "#f59e0b", fontWeight: 500, marginLeft: "8px" }}>
            (Ažurirano)
          </span>
        )}
      </div>

      {/* Prikaz odabranih slika faktura */}
      {hasUlaz && invoiceImages.length > 0 && (
        <div style={{ 
          marginTop: "16px", 
          marginBottom: "16px", 
          padding: "12px", 
          background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
          borderRadius: "8px",
          border: "1px solid #f59e0b",
          boxShadow: "0 2px 8px rgba(245, 158, 11, 0.1)"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{
                width: "28px",
                height: "28px",
                borderRadius: "6px",
                background: "#6366f1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "8px",
                fontSize: "16px"
              }}>
                📸
              </div>
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#92400e", margin: 0 }}>
                Slike faktura za ulaz
              </h3>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ fontSize: "12px", fontWeight: 500, color: "#92400e" }}>
                Odabrano: {invoiceImages.length}
              </span>
              {canEdit && invoiceImages.length > 0 && (
                <>
                  <button
                    onClick={async () => {
                      const datumString = formatirajDatum(trenutniDatum);
                      const user = getOfflineUser();
                      const userId = user?.userId || "default";
                      
                      if (!user || !userId) {
                        alert("Korisnik nije autentifikovan");
                        return;
                      }
                      
                      // Provjeri da li ima slika prije nego što pokušaš upload
                      if (invoiceImages.length === 0) {
                        alert("Nema slika za upload!");
                        return;
                      }
                      
                      try {
                        setUploadingImages(true);
                        setUploadProgress(0);
                        const uploadedUrls = await uploadInvoiceImages(datumString);
                        
                        // Ažuriraj obračun u localStorage sa slikama
                        if (uploadedUrls.length > 0) {
                          try {
                            const arhiva = localStorage.getItem("arhivaObracuna");
                            if (arhiva) {
                              const arhivaList = JSON.parse(arhiva);
                              const existingIndex = arhivaList.findIndex((o: any) => o.datum === datumString);
                              if (existingIndex >= 0) {
                                // Ako obračun već postoji, dodaj nove slike postojećim
                                const existingImages = arhivaList[existingIndex].invoiceImages || [];
                                const allImages = [...existingImages, ...uploadedUrls];
                                arhivaList[existingIndex].invoiceImages = allImages;
                                localStorage.setItem("arhivaObracuna", JSON.stringify(arhivaList));
                                console.log(`Slike dodane u postojeći obračun ${datumString}: ${allImages.length} slika`);
                              } else {
                                // Ako obračun ne postoji, kreiraj novi sa slikama
                                arhivaList.push({
                                  invoiceImages: uploadedUrls,
                                  datum: datumString,
                                });
                                localStorage.setItem("arhivaObracuna", JSON.stringify(arhivaList));
                                console.log(`Kreiran novi obračun ${datumString} sa ${uploadedUrls.length} slikama`);
                              }
                            }
                          } catch (error: any) {
                            console.warn("Greška pri spremanju slika:", error);
                          }
                          
                          // Sačuvaj broj sačuvanih slika u cache
                          try {
                            const cacheKey = `cache_${datumString}`;
                            const cacheData = localStorage.getItem(cacheKey);
                            const currentCount = cacheData ? (JSON.parse(cacheData).savedInvoiceImagesCount || 0) : 0;
                            const newCount = currentCount + uploadedUrls.length;
                            
                            localStorage.setItem(cacheKey, JSON.stringify({
                              savedInvoiceImagesCount: newCount,
                              datum: datumString,
                              updatedAt: new Date().toISOString(),
                            }));
                            
                            setSavedInvoiceImagesCount(newCount);
                          } catch (cacheError: any) {
                            console.warn("Greška pri spremanju broja slika u cache:", cacheError);
                            // Sačuvaj lokalno kao fallback
                            setSavedInvoiceImagesCount((prev) => prev + uploadedUrls.length);
                          }
                        }
                        
                        alert("Slike faktura uspješno sačuvane!");
                        setInvoiceImages([]);
                        
                        // Eksplicitno osvježi arhivu nakon upload-a slika
                        // Real-time listener bi trebao osvježiti, ali osiguravamo da se osvježi
                        console.log("Slike upload-ovane, osvježavam arhivu...");
                      } catch (error: any) {
                        console.error("Greška pri upload-u slika:", error);
                        alert("Greška pri upload-u slika: " + (error.message || "Nepoznata greška"));
                      } finally {
                        setUploadingImages(false);
                        setUploadProgress(0);
                      }
                    }}
                    disabled={uploadingImages || !canEdit}
                    style={{
                      ...saveButtonStyle,
                      background: "#15803d",
                      opacity: (canEdit && !uploadingImages) ? 1 : 0.5,
                      cursor: (canEdit && !uploadingImages) ? "pointer" : "not-allowed",
                      padding: "8px 16px",
                      fontSize: "14px",
                      maxWidth: "160px",
                      marginRight: "8px",
                      marginBottom: "8px"
                    }}
                  >
                    {uploadingImages ? `Spremanje... ${Math.round(uploadProgress)}%` : "Sačuvaj slike"}
                  </button>
                  <button
                    onClick={() => setInvoiceImages([])}
                    style={{
                      ...buttonStyle,
                      background: "#dc2626",
                      maxWidth: "160px",
                      opacity: canEdit ? 1 : 0.5,
                      cursor: canEdit ? "pointer" : "not-allowed",
                      marginRight: "8px",
                      marginBottom: "8px"
                    }}
                    disabled={!canEdit}
                  >
                    Obriši sve
                  </button>
                </>
              )}
            </div>
          </div>
          
          {invoiceImages.length > 0 && (
            <div style={{ marginTop: "10px" }}>
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", 
                gap: "8px"
              }}>
                {invoiceImages.map((file, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      position: "relative", 
                      width: "100%",
                      aspectRatio: "1",
                      borderRadius: "6px",
                      overflow: "hidden",
                      boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
                      transition: "transform 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                      }}
                    />
                    {canEdit && (
                      <button
                        onClick={() => removeImageFromPreview(index)}
                        style={{
                          position: "absolute",
                          top: "2px",
                          right: "2px",
                          background: "rgba(220, 38, 38, 0.9)",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "20px",
                          height: "20px",
                          cursor: "pointer",
                          fontSize: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)"
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploadProgress > 0 && (
            <div style={{ marginTop: "10px" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "4px"
              }}>
                <span style={{ fontSize: "12px", fontWeight: 500, color: "#92400e" }}>
                  Upload...
                </span>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#92400e" }}>
                  {Math.round(uploadProgress)}%
                </span>
              </div>
              <div style={{
                width: "100%",
                height: "6px",
                background: "#fde68a",
                borderRadius: "3px",
                overflow: "hidden"
              }}>
                <div style={{
                  width: `${uploadProgress}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #f59e0b, #d97706)",
                  borderRadius: "3px",
                  transition: "width 0.3s ease"
                }} />
              </div>
            </div>
          )}
        </div>
      )}

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
          {artikli.map((a, index) => {
            // Funkcija za određivanje boje na osnovu trenutne zalihe (krajnjeStanje ili ukupno)
            const getRowStyle = (): React.CSSProperties => {
              // Ako funkcija nije uključena, ne primjenjuj boje
              if (!lowStockEnabled) {
                return {};
              }
              
              // Kafa je posebna - ne primjenjuj boje
              if (a.naziv.toLowerCase() === "kafa" || a.naziv.toLowerCase() === "kava") {
                return {};
              }
              
              // Koristimo krajnjeStanje ako je postavljeno, inače ukupno (pocetnoStanje + ulaz)
              const trenutnaZaliha = a.isKrajnjeSet ? a.krajnjeStanje : a.ukupno;
              
              // Za žestoka pića (ima zestokoKolicina)
              if (a.zestokoKolicina && a.zestokoKolicina > 0) {
                // Provjeri da li je zaliha ispod praga za žestoka pića
                if (trenutnaZaliha < lowStockThresholdZestoka) {
                  return {
                    backgroundColor: "#fef2f2",
                    borderLeft: "4px solid #dc2626"
                  };
                }
              } else {
                // Za obične artikle - provjeri da li je zaliha ispod praga za ostala pića
                if (trenutnaZaliha < lowStockThresholdOstala) {
                  return {
                    backgroundColor: "#fef2f2",
                    borderLeft: "4px solid #dc2626"
                  };
                }
              }
              
              return {};
            };
            
            // Provjeri da li je zaliha mala za prikaz upozorenja
            const trenutnaZaliha = a.isKrajnjeSet ? a.krajnjeStanje : a.ukupno;
            const threshold = (a.zestokoKolicina && a.zestokoKolicina > 0) 
              ? lowStockThresholdZestoka 
              : lowStockThresholdOstala;
            const isLowStock = lowStockEnabled && 
              !(a.naziv.toLowerCase() === "kafa" || a.naziv.toLowerCase() === "kava") &&
              trenutnaZaliha < threshold;

            const rowStyle = getRowStyle();
            
            return (
              <tr key={index} style={rowStyle}>
                <td style={{...tdStyle, color: "#1e40af", fontWeight: 600}} data-label="Artikal">
                  {a.naziv}
                </td>
                <td style={tdStyle} data-label="Cijena">{a.cijena.toFixed(2)}</td>
                <td style={tdStyle} data-label="Zestoko Količina (ml)">{a.zestokoKolicina ? a.zestokoKolicina.toFixed(3) : "-"}</td>
                <td style={tdStyle} data-label="Proizvodna Cijena">{a.proizvodnaCijena ? a.proizvodnaCijena.toFixed(2) : "-"}</td>
                <td style={tdStyle} data-label="Početno stanje">
                  {a.pocetnoStanje}
                  {/* Ne prikazuj zagrade - ulaz ostaje vidljiv u input polju */}
                </td>
                <td style={tdStyle} data-label="Ulaz">
                  <input
                    key={`ulaz-${index}-${resetKey}`}
                    type="number"
                    inputMode="numeric"
                    value={a.ulaz === 0 ? "" : a.ulaz}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => handleUlazChange(index, Number(e.target.value) || 0)}
                    style={{ ...inputStyle, opacity: (canEdit && !isUlazLocked) ? 1 : 0.5, cursor: (canEdit && !isUlazLocked) ? "text" : "not-allowed" }}
                    className="no-spin"
                    disabled={!canEdit || isUlazLocked}
                    readOnly={!canEdit || isUlazLocked}
                  />
                </td>
                <td style={tdStyle} data-label="Ukupno">{a.ukupno}</td>
                <td style={tdStyle} data-label="Utrošeno">{a.utroseno}</td>
                <td style={{
                  ...tdStyle,
                  ...(isLowStock ? { 
                    color: "#dc2626", 
                    fontWeight: 600 
                  } : {})
                }} data-label="Krajnje stanje">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={a.krajnjeStanje === 0 ? "" : a.krajnjeStanje}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => handleKrajnjeStanjeChange(index, e.target.value)}
                    style={{ ...inputStyle, opacity: canEdit ? 1 : 0.5, cursor: canEdit ? "text" : "not-allowed" }}
                    className="no-spin"
                    disabled={!canEdit}
                    readOnly={!canEdit}
                  />
                </td>
                <td style={tdStyle} data-label="Vrijednost KM">{a.vrijednostKM.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Rashodi */}
      <h2 style={{ fontSize: "18px", fontWeight: 500, color: "#1f2937", marginBottom: "16px" }}>
        Rashodi
      </h2>
      <div style={tableWrapperStyle}>
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
                        style={{...rashodInputStyle, opacity: canEdit ? 1 : 0.5, cursor: canEdit ? "text" : "not-allowed"}}
                        disabled={!canEdit}
                        readOnly={!canEdit}
                      />
                    </td>
                    <td style={tdStyle}>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={editRashod.cijena === 0 ? "" : editRashod.cijena}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => setEditRashod({ ...editRashod, cijena: Number(e.target.value) || 0 })}
                        style={{...rashodInputStyle, opacity: canEdit ? 1 : 0.5, cursor: canEdit ? "text" : "not-allowed"}}
                        className="no-spin"
                        disabled={!canEdit}
                        readOnly={!canEdit}
                      />
                    </td>
                    <td style={tdStyle}>
                      <button 
                        style={{...buttonStyle, opacity: canEdit ? 1 : 0.5, cursor: canEdit ? "pointer" : "not-allowed"}} 
                        onClick={handleSaveEditRashod}
                        disabled={!canEdit}
                      >
                        Spremi
                      </button>
                      <button 
                        style={{...cancelButtonStyle, opacity: canEdit ? 1 : 0.5, cursor: canEdit ? "pointer" : "not-allowed"}} 
                        onClick={handleCancelEditRashod} 
                        className="cancel-button"
                        disabled={!canEdit}
                      >
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
                        style={{...editButtonStyle, opacity: canEdit ? 1 : 0.5, cursor: canEdit ? "pointer" : "not-allowed"}}
                        onClick={() => handleEditRashod(index)}
                        className="edit-button"
                        disabled={!canEdit}
                      >
                        Uredi
                      </button>
                      <button
                        style={{...deleteButtonStyle, opacity: canEdit ? 1 : 0.5, cursor: canEdit ? "pointer" : "not-allowed"}}
                        onClick={() => handleDeleteRashod(index)}
                        className="delete-button"
                        disabled={!canEdit}
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
      </div>

      <div style={{ marginTop: "20px", display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px", width: "100%", boxSizing: "border-box" }}>
        <input
          type="text"
          placeholder="Naziv rashoda"
          value={newRashod.naziv}
          onChange={(e) => setNewRashod({ ...newRashod, naziv: e.target.value })}
          style={{...rashodInputStyle, flex: "1 1 auto", minWidth: "120px", opacity: canEdit ? 1 : 0.5, cursor: canEdit ? "text" : "not-allowed"}}
          disabled={!canEdit}
          readOnly={!canEdit}
        />
        <input
          type="number"
          inputMode="numeric"
          placeholder="Cijena"
          value={newRashod.cijena === 0 ? "" : newRashod.cijena}
          onFocus={(e) => e.target.select()}
          onChange={(e) => setNewRashod({ ...newRashod, cijena: Number(e.target.value) || 0 })}
          style={{...rashodInputStyle, flex: "1 1 auto", minWidth: "120px", opacity: canEdit ? 1 : 0.5, cursor: canEdit ? "text" : "not-allowed"}}
          className="no-spin"
          disabled={!canEdit}
          readOnly={!canEdit}
        />
        <button 
          style={{...buttonStyle, flex: "1 1 auto", minWidth: "140px", opacity: canEdit ? 1 : 0.5, cursor: canEdit ? "pointer" : "not-allowed"}} 
          onClick={handleAddRashod}
          disabled={!canEdit}
        >
          Dodaj rashod
        </button>
      </div>

      {/* Prihodi */}
      <h2 style={{ fontSize: "18px", fontWeight: 500, color: "#1f2937", marginBottom: "16px" }}>
        Prihodi
      </h2>
      <div style={tableWrapperStyle}>
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
                        style={{...rashodInputStyle, opacity: canEdit ? 1 : 0.5, cursor: canEdit ? "text" : "not-allowed"}}
                        disabled={!canEdit}
                        readOnly={!canEdit}
                      />
                    </td>
                    <td style={tdStyle}>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={editPrihod.cijena === 0 ? "" : editPrihod.cijena}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => setEditPrihod({ ...editPrihod, cijena: Number(e.target.value) || 0 })}
                        style={{...rashodInputStyle, opacity: canEdit ? 1 : 0.5, cursor: canEdit ? "text" : "not-allowed"}}
                        className="no-spin"
                        disabled={!canEdit}
                        readOnly={!canEdit}
                      />
                    </td>
                    <td style={tdStyle}>
                      <button 
                        style={{...buttonStyle, opacity: canEdit ? 1 : 0.5, cursor: canEdit ? "pointer" : "not-allowed"}} 
                        onClick={handleSaveEditPrihod}
                        disabled={!canEdit}
                      >
                        Spremi
                      </button>
                      <button 
                        style={{...cancelButtonStyle, opacity: canEdit ? 1 : 0.5, cursor: canEdit ? "pointer" : "not-allowed"}} 
                        onClick={handleCancelEditPrihod} 
                        className="cancel-button"
                        disabled={!canEdit}
                      >
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
                        style={{...editButtonStyle, opacity: canEdit ? 1 : 0.5, cursor: canEdit ? "pointer" : "not-allowed"}}
                        onClick={() => handleEditPrihod(index)}
                        className="edit-button"
                        disabled={!canEdit}
                      >
                        Uredi
                      </button>
                      <button
                        style={{...deleteButtonStyle, opacity: canEdit ? 1 : 0.5, cursor: canEdit ? "pointer" : "not-allowed"}}
                        onClick={() => handleDeletePrihod(index)}
                        className="delete-button"
                        disabled={!canEdit}
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
      </div>

      <div style={{ marginTop: "20px", display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px", width: "100%", boxSizing: "border-box" }}>
        <input
          type="text"
          placeholder="Naziv prihoda"
          value={newPrihod.naziv}
          onChange={(e) => setNewPrihod({ ...newPrihod, naziv: e.target.value })}
          style={{...rashodInputStyle, flex: "1 1 auto", minWidth: "120px", opacity: canEdit ? 1 : 0.5, cursor: canEdit ? "text" : "not-allowed"}}
          disabled={!canEdit}
          readOnly={!canEdit}
        />
        <input
          type="number"
          inputMode="numeric"
          placeholder="Cijena"
          value={newPrihod.cijena === 0 ? "" : newPrihod.cijena}
          onFocus={(e) => e.target.select()}
          onChange={(e) => setNewPrihod({ ...newPrihod, cijena: Number(e.target.value) || 0 })}
          style={{...rashodInputStyle, flex: "1 1 auto", minWidth: "120px", opacity: canEdit ? 1 : 0.5, cursor: canEdit ? "text" : "not-allowed"}}
          className="no-spin"
          disabled={!canEdit}
          readOnly={!canEdit}
        />
        <button 
          style={{...buttonStyle, flex: "1 1 auto", minWidth: "140px", opacity: canEdit ? 1 : 0.5, cursor: canEdit ? "pointer" : "not-allowed"}} 
          onClick={handleAddPrihod}
          disabled={!canEdit}
        >
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