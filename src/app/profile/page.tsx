"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useAppName } from "../context/AppNameContext";
import { useCjenovnik } from "../context/CjenovnikContext";
import { useRouter, useSearchParams } from "next/navigation";
import jsPDF from "jspdf";
import { FaSearch, FaSpinner, FaMobile, FaDesktop } from "react-icons/fa";

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

const containerStyle: React.CSSProperties = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "24px",
  fontFamily: "'Inter', sans-serif",
  boxSizing: "border-box",
  width: "100%",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  minWidth: "800px",
  borderCollapse: "separate" as "separate",
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

// Koristimo className za bolju kompatibilnost sa CSS media queries
const tableWrapperClassName = "table-wrapper-scroll";

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
  const [sessions, setSessions] = useState<any[]>([]);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editedSessionName, setEditedSessionName] = useState("");
  const [isAppNameUpdated, setIsAppNameUpdated] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string | null>(null);
  const [backupFromDate, setBackupFromDate] = useState("");
  const [backupToDate, setBackupToDate] = useState("");
  const [showBackupFilters, setShowBackupFilters] = useState(false);
  const [backupMessage, setBackupMessage] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  // Subscription i Role context uklonjeni - koristimo localStorage/API
  const [subscription, setSubscription] = useState<any>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [newPaymentAmount, setNewPaymentAmount] = useState("");
  const [newPaymentNote, setNewPaymentNote] = useState("");
  const [subscriptionMessage, setSubscriptionMessage] = useState("");
  const [selectedMonths, setSelectedMonths] = useState(1);
  const [paymentRequested, setPaymentRequested] = useState(false);
  const [requestingPayment, setRequestingPayment] = useState(false);
  const [role, setRole] = useState<string>("korisnik");
  const [devices, setDevices] = useState<any[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [savingRole, setSavingRole] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loginApprovals, setLoginApprovals] = useState<any[]>([]);
  const [loadingApprovals, setLoadingApprovals] = useState(false);
  const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);
  const [editingPermissions, setEditingPermissions] = useState<any>({});
  const [selectedRole, setSelectedRole] = useState<Record<string, string>>({});
  const [deviceNames, setDeviceNames] = useState<Record<string, string>>({});
  const editingBoxRef = useRef<HTMLTableCellElement | null>(null);
  const [arhivaCount, setArhivaCount] = useState<number>(0);
  const [loadingArhivaCount, setLoadingArhivaCount] = useState<boolean>(false);
  const { cjenovnik } = useCjenovnik();
  const router = useRouter();

  // Sinhronizuj localAppName sa appName iz contexta
  useEffect(() => {
    setLocalAppName(appName);
  }, [appName]);

  // Učitaj paymentRequested status
  useEffect(() => {
    const user = getOfflineUser();
    if (user?.email === "gitara.zizu@gmail.com") {
      setIsOwner(true);
    }
    // Učitaj subscription iz localStorage ili API
    const loadSubscription = async () => {
      try {
        const response = await fetch("/api/admin/subscription");
        if (response.ok) {
          const data = await response.json();
          setSubscription(data.subscription);
          if (data.subscription?.paymentPendingVerification) {
            setPaymentRequested(true);
          }
        }
      } catch (e) {
        console.warn("Greška pri učitavanju subscription:", e);
      }
    };
    loadSubscription();
  }, []);

  // Dohvati IP adresu, lokaciju i trenutnog korisnika
  useEffect(() => {
    const loadSessions = async () => {
      const user = getOfflineUser();
      if (!user) return;
      
      setEmail(user.email || "N/A"); // Postavi trenutni e-mail
      
      // Učitaj sesije iz localStorage
      let existingSessions: any[] = [];
      let activeSession: any = null;
      
      try {
        const savedSessions = localStorage.getItem("userSessions");
        if (savedSessions) {
          existingSessions = JSON.parse(savedSessions);
          activeSession = existingSessions.find((s: any) => s.userEmail === user.email && s.status === "Aktivna");
        }
      } catch (error) {
        console.warn("Greška pri učitavanju sesija:", error);
      }
      
      const fetchIPAndLocation = async () => {
        let ipInfo = {
          ip: "N/A",
          location: "Nepoznata lokacija",
          isp: "N/A"
        };
        
        try {
          // Pokušaj dobiti IP - koristimo samo ipify jer ip-api.com često vraća 403
          let ip = "N/A";
          try {
            const ipResponse = await fetch("https://api.ipify.org?format=json");
            if (ipResponse.ok) {
              const ipData = await ipResponse.json();
              ip = ipData.ip || "N/A";
            }
          } catch (error) {
            // Ignoriraj grešku sa ipify
          }
          
          ipInfo = {
            ip,
            location: "Nepoznata lokacija",
            isp: "N/A"
          };
        } catch (error) {
          // Ignoriraj grešku
        }
        
        return ipInfo;
      };
      
      async function createSession(ipInfo: { ip: string; location: string; isp: string }) {
        const currentUser = getOfflineUser();
        if (!currentUser || !currentUser.email) return; // Ako nema korisnika, ne kreiraj sesiju
        
        const device = /Mobi|Android/i.test(navigator.userAgent) ? "Mobilni" : "Desktop";
        const currentSession = {
          id: Date.now().toString(),
          date: new Date().toLocaleString("bs-BA", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
          status: "Aktivna",
          device,
          location: ipInfo.location,
          ip: ipInfo.ip,
          name: currentUser.displayName || "Korisnik",
          userEmail: currentUser.email,
          isp: ipInfo.isp
        };
        
        // Spremi sesiju u localStorage
        try {
          // Deaktiviraj stare sesije
          const oldSessions = existingSessions.filter((s: any) => s.userEmail === currentUser.email && s.status === "Aktivna" && s.id !== currentSession.id);
          const deactivatedSessions = oldSessions.map((s: any) => ({ ...s, status: "Neaktivna" }));
          const otherSessions = existingSessions.filter((s: any) => s.userEmail !== currentUser.email || s.status !== "Aktivna");
          
          const updatedSessions = [currentSession, ...deactivatedSessions, ...otherSessions];
          localStorage.setItem("userSessions", JSON.stringify(updatedSessions));
          setSessions(updatedSessions);
        } catch (error) {
          console.warn("Greška pri spremanju sesije:", error);
        }
      }
      
      // IP info se sada dohvaća direktno
      let ipInfo = { ip: "N/A", location: "Nepoznata lokacija", isp: "N/A" };

      // Dohvati IP info ako nije dostupan
      if (ipInfo.ip === "N/A") {
        fetchIPAndLocation().then(({ ip, location, isp }) => {
          ipInfo = { ip, location, isp };
          
          // Provjeri da li postoji sesija sa istom IP adresom za ovog korisnika
          const existingSessionWithSameIP = existingSessions.find(s => 
            s.userEmail === user.email && 
            s.ip === ipInfo.ip && 
            ipInfo.ip !== "N/A"
          );

          if (!activeSession && !existingSessionWithSameIP) {
            // Kreiraj novu sesiju samo ako nema aktivne sesije i nema sesije sa istom IP
            createSession(ipInfo);
          } else if (activeSession) {
            // Koristi postojeću aktivnu sesiju, ali ažuriraj IP ako je noviji
            if (ipInfo.ip !== "N/A" && activeSession.ip === "N/A") {
              activeSession.ip = ipInfo.ip;
              activeSession.location = ipInfo.location;
              const updatedSessions = existingSessions.map(s => 
                s.id === activeSession.id ? activeSession : s
              );
              // Spremi u localStorage
              localStorage.setItem("userSessions", JSON.stringify(updatedSessions));
              setSessions(updatedSessions);
            } else {
              setSessions(existingSessions);
            }
          } else {
            // Postoji sesija sa istom IP, ne kreiraj novu
            setSessions(existingSessions);
          }
        });
      } else {
        // Provjeri da li postoji sesija sa istom IP adresom za ovog korisnika
        const existingSessionWithSameIP = existingSessions.find(s => 
          s.userEmail === user.email && 
          s.ip === ipInfo.ip && 
          ipInfo.ip !== "N/A"
        );

        if (!activeSession && !existingSessionWithSameIP) {
          // Kreiraj novu sesiju samo ako nema aktivne sesije i nema sesije sa istom IP
          createSession(ipInfo);
        } else if (activeSession) {
          // Koristi postojeću aktivnu sesiju, ali ažuriraj IP ako je noviji
          if (ipInfo.ip !== "N/A" && activeSession.ip === "N/A") {
            activeSession.ip = ipInfo.ip;
            activeSession.location = ipInfo.location;
            const updatedSessions = existingSessions.map(s => 
              s.id === activeSession.id ? activeSession : s
            );
            // Spremi u localStorage
            localStorage.setItem("userSessions", JSON.stringify(updatedSessions));
            setSessions(updatedSessions);
          } else {
            setSessions(existingSessions);
          }
        } else {
          // Postoji sesija sa istom IP, ne kreiraj novu
          setSessions(existingSessions);
        }
      }
    };
    
    loadSessions();
  }, []);

  // Scroll na editing box kada se otvori (samo na mobilnom)
  useEffect(() => {
    if (editingDeviceId && editingBoxRef.current) {
      const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
      if (isMobile) {
        // Kratak delay da se DOM ažurira
        setTimeout(() => {
          const element = editingBoxRef.current;
          if (element) {
            // Scrolluj tabelu wrapper na lijevo (scrollTo left: 0) da bi editing box bio vidljiv
            const tableWrapper = element.closest('.table-wrapper-scroll');
            if (tableWrapper) {
              tableWrapper.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
              element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'start' });
            }
          }
        }, 150);
      }
    }
  }, [editingDeviceId]);

  const handleChangeEmail = async () => {
    const user = getOfflineUser();
    if (!user || !user.email) {
      setEmailMessage("Niste prijavljeni!");
      setTimeout(() => setEmailMessage(""), 5000);
      return;
    }

    // Promjena e-maila nije podržana u server-only modu
    setEmailMessage("Promjena e-maila nije dostupna u ovoj verziji. Kontaktiraj admina.");
    setTimeout(() => setEmailMessage(""), 5000);
  };

  const handleChangePassword = async () => {
    const user = getOfflineUser();
    if (!user || !user.email) {
      setMessage("Niste prijavljeni!");
      setTimeout(() => setMessage(""), 5000);
      return;
    }

    // Promjena lozinke nije podržana u server-only modu
    setMessage("Promjena lozinke nije dostupna u ovoj verziji. Kontaktiraj admina.");
    setTimeout(() => setMessage(""), 5000);
  };

  const handleSaveAppName = async () => {
    if (localAppName.trim() === "") {
      setMessage("Unesite ime aplikacije!");
      return;
    }

    // Provjeri da li je ime promijenjeno
    if (localAppName.trim() === appName) {
      setMessage("Ime aplikacije nije promijenjeno!");
      return;
    }

    // Potvrdi prije spremanja
    const confirmed = window.confirm(
      `Jeste li sigurni da želite promijeniti ime aplikacije na "${localAppName.trim()}"?\n\n` +
      `Ova promjena će se automatski primijeniti na svim vašim uređajima.`
    );

    if (!confirmed) {
      return;
    }

    const user = getOfflineUser();
    if (!user) {
      setMessage("Morate biti prijavljeni!");
      return;
    }

    try {
      // Spremi u localStorage i API
      localStorage.setItem("appName", localAppName.trim());
      
      // Ažuriraj preko API-ja
      try {
        await fetch("/api/app-name", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ appName: localAppName.trim() }),
        });
      } catch (apiError) {
        console.warn("Greška pri spremanju u API:", apiError);
      }
      
      // Ažuriraj context
      setAppName(localAppName.trim());
      
      setIsAppNameUpdated(true);
      setLastUpdatedTime(new Date().toLocaleString("bs-BA", { 
        day: "2-digit", 
        month: "2-digit", 
        year: "numeric", 
        hour: "2-digit", 
        minute: "2-digit" 
      }));
      setMessage("Ime aplikacije uspješno spremljeno!");
      // Sakrij poruku nakon 5 sekundi
      setTimeout(() => {
        setIsAppNameUpdated(false);
        setMessage("");
      }, 5000);
    } catch (error: any) {
      console.error("Greška pri spremanju imena aplikacije:", error);
      setMessage("Greška pri spremanju imena aplikacije: " + (error.message || "Nepoznata greška"));
      setTimeout(() => setMessage(""), 5000);
    }
  };

  // Učitaj uređaje za trenutnog korisnika
  const loadDevices = async () => {
    const user = getOfflineUser();
    if (!user) return;

    try {
      setLoadingDevices(true);
      // Učitaj uređaje iz localStorage (za sada)
      const savedDevices = localStorage.getItem("devices");
      let devicesList: any[] = [];
      
      if (savedDevices) {
        try {
          devicesList = JSON.parse(savedDevices);
          // Filtriraj samo uređaje za ovog korisnika
          devicesList = devicesList.filter((d: any) => d.userId === user.userId);
        } catch (e) {
          console.warn("Greška pri parsiranju uređaja:", e);
        }
      }
      
      // Sortiraj po posljednjoj prijavi (najnoviji prvo)
      devicesList.sort((a, b) => {
        const aDate = a.lastLogin ? new Date(a.lastLogin) : (a.deviceInfo?.firstSeen ? new Date(a.deviceInfo.firstSeen) : new Date(0));
        const bDate = b.lastLogin ? new Date(b.lastLogin) : (b.deviceInfo?.firstSeen ? new Date(b.deviceInfo.firstSeen) : new Date(0));
        return bDate.getTime() - aDate.getTime();
      });
      
      setDevices(devicesList);
    } catch (error) {
      console.error("Greška pri učitavanju uređaja:", error);
    } finally {
      setLoadingDevices(false);
    }
  };

  // Dodijeli ulogu uređaju
  const handleAssignRole = async (deviceId: string, newRole: any, permissions?: any) => {
    const user = getOfflineUser();
    if (!user || !isOwner) return;

    try {
      setSavingRole(true);
      // Dodijeli ulogu - za sada samo u localStorage
      const savedDevices = localStorage.getItem("devices");
      let devicesList: any[] = savedDevices ? JSON.parse(savedDevices) : [];
      devicesList = devicesList.map((d: any) => 
        d.id === deviceId ? { ...d, role: newRole, permissions: permissions || {} } : d
      );
      localStorage.setItem("devices", JSON.stringify(devicesList));
      await loadDevices();
      setEditingDeviceId(null);
      setEditingPermissions({});
      setMessage("Uloga uspješno dodijeljena uređaju");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Greška pri dodjeljivanju uloge:", error);
      setMessage("Greška pri dodjeljivanju uloge");
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setSavingRole(false);
    }
  };

  // Otvori modal za uređivanje dozvola
  const handleEditPermissions = (device: any) => {
    setEditingDeviceId(device.id);
    setEditingPermissions(device.permissions || {});
  };

  // Spremi dozvole
  const handleSavePermissions = async (deviceId: string, deviceRole: string) => {
    await handleAssignRole(deviceId, deviceRole, editingPermissions);
  };

  // Odobri novi uređaj
  const handleApproveDevice = async (deviceId: string) => {
    const user = getOfflineUser();
    if (!user || !isOwner) return;

    try {
      setSavingRole(true);
      const savedDevices = localStorage.getItem("devices");
      let devicesList: any[] = savedDevices ? JSON.parse(savedDevices) : [];
      const deviceRole: string = "konobar";
      devicesList = devicesList.map((d: any) => 
        d.id === deviceId ? { 
          ...d, 
          role: deviceRole,
          status: "approved",
          approvedAt: new Date().toISOString(),
          approvedBy: user.userId,
          permissions: {
            dashboard: false,
            obracun: false,
            arhiva: false,
            cjenovnik: false,
            profit: false,
            profile: false,
            admin: false,
          },
          updatedAt: new Date().toISOString(),
        } : d
      );
      localStorage.setItem("devices", JSON.stringify(devicesList));
      await loadDevices();
      setMessage("Uređaj uspješno odobren kao konobar");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Greška pri odobravanju uređaja:", error);
      setMessage("Greška pri odobravanju uređaja");
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setSavingRole(false);
    }
  };

  // Blokiraj/odblokiraj uređaj
  const handleToggleBlockDevice = async (deviceId: string, currentBlocked: boolean) => {
    const user = getOfflineUser();
    if (!user || !isOwner) return;

    try {
      setSavingRole(true);
      const savedDevices = localStorage.getItem("devices");
      let devicesList: any[] = savedDevices ? JSON.parse(savedDevices) : [];
      devicesList = devicesList.map((d: any) => 
        d.id === deviceId ? { 
          ...d, 
          isBlocked: !currentBlocked,
          blockedAt: !currentBlocked ? new Date().toISOString() : null,
          blockedBy: !currentBlocked ? user.userId : null,
          updatedAt: new Date().toISOString(),
        } : d
      );
      localStorage.setItem("devices", JSON.stringify(devicesList));
      await loadDevices();
      setMessage(`Uređaj ${!currentBlocked ? "blokiran" : "odblokiran"}`);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Greška pri blokiranju/odblokiranju uređaja:", error);
      setMessage("Greška pri blokiranju/odblokiranju uređaja");
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setSavingRole(false);
    }
  };

  // Izbriši uređaj (login)
  const handleDeleteDevice = async (deviceId: string) => {
    const user = getOfflineUser();
    if (!user || !isOwner) return;

    if (!window.confirm("Jeste li sigurni da želite izbrisati ovaj login? Korisnik će morati ponovo zatražiti pristup.")) {
      return;
    }

    try {
      setSavingRole(true);
      const savedDevices = localStorage.getItem("devices");
      let devicesList: any[] = savedDevices ? JSON.parse(savedDevices) : [];
      devicesList = devicesList.filter((d: any) => d.id !== deviceId);
      localStorage.setItem("devices", JSON.stringify(devicesList));
      await loadDevices();
      setMessage("Login uspješno izbrisan");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Greška pri brisanju login-a:", error);
      setMessage("Greška pri brisanju login-a");
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setSavingRole(false);
    }
  };

  // Spremi ime uređaja
  const handleSaveDeviceName = async (deviceId: string, deviceName: string) => {
    const user = getOfflineUser();
    if (!user || !isOwner) return;

    try {
      setSavingRole(true);
      const savedDevices = localStorage.getItem("devices");
      let devicesList: any[] = savedDevices ? JSON.parse(savedDevices) : [];
      devicesList = devicesList.map((d: any) => 
        d.id === deviceId ? { ...d, deviceName: deviceName.trim() || "", updatedAt: new Date().toISOString() } : d
      );
      localStorage.setItem("devices", JSON.stringify(devicesList));
      await loadDevices();
      setMessage("Ime uređaja uspješno spremljeno");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Greška pri spremanju imena uređaja:", error);
      setMessage("Greška pri spremanju imena uređaja");
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setSavingRole(false);
    }
  };

  // Provjeri da li je korisnik vlasnik
  useEffect(() => {
    const checkOwner = async () => {
      const user = getOfflineUser();
      if (!user) {
        setIsOwner(false);
        return;
      }
      
      // Provjeri email direktno
      if (user.email === "gitara.zizu@gmail.com") {
        setIsOwner(true);
        return;
      }
      
      setIsOwner(false);
    };
    checkOwner();
  }, []);

  // Učitaj zahtjeve za odobrenje (samo za vlasnika)
  const loadLoginApprovals = async () => {
    const user = getOfflineUser();
    if (!isOwner && user?.email !== "gitara.zizu@gmail.com") return;
    
    try {
      setLoadingApprovals(true);
      // Učitaj iz localStorage (za sada)
      const savedApprovals = localStorage.getItem("loginApprovals");
      let approvalsList: any[] = [];
      
      if (savedApprovals) {
        try {
          approvalsList = JSON.parse(savedApprovals);
          approvalsList = approvalsList.filter((a: any) => a.status === "pending");
        } catch (e) {
          console.warn("Greška pri parsiranju zahtjeva:", e);
        }
      }
      
      // Sortiraj po datumu (najnoviji prvo)
      approvalsList.sort((a, b) => {
        const aDate = a.requestedAt ? new Date(a.requestedAt) : new Date(0);
        const bDate = b.requestedAt ? new Date(b.requestedAt) : new Date(0);
        return bDate.getTime() - aDate.getTime();
      });
      
      setLoginApprovals(approvalsList);
    } catch (error: any) {
      console.error("Greška pri učitavanju zahtjeva za odobrenje:", error);
    } finally {
      setLoadingApprovals(false);
    }
  };

  // Odobri zahtjev
  const approveLoginRequest = async (approvalId: string) => {
    const user = getOfflineUser();
    if (!user || (!isOwner && user.email !== "gitara.zizu@gmail.com")) return;

    try {
      const savedApprovals = localStorage.getItem("loginApprovals");
      let approvalsList: any[] = savedApprovals ? JSON.parse(savedApprovals) : [];
      approvalsList = approvalsList.map((a: any) => 
        a.id === approvalId ? {
          ...a,
          status: "approved",
          approvedAt: new Date().toISOString(),
          approvedBy: user.userId,
        } : a
      );
      localStorage.setItem("loginApprovals", JSON.stringify(approvalsList));
      
      const updatedData = approvalsList.find((a: any) => a.id === approvalId);
      if (updatedData) {
        console.log("Status nakon odobrenja:", updatedData.status);
      }
      
      await loadLoginApprovals();
      setMessage("Zahtjev uspješno odobren. Korisnik se sada može prijaviti.");
      setTimeout(() => setMessage(""), 5000);
    } catch (error) {
      console.error("Greška pri odobravanju zahtjeva:", error);
      setMessage("Greška pri odobravanju zahtjeva");
      setTimeout(() => setMessage(""), 5000);
    }
  };

  // Odbij zahtjev
  const rejectLoginRequest = async (approvalId: string) => {
    const user = getOfflineUser();
    if (!user || (!isOwner && user.email !== "gitara.zizu@gmail.com")) return;

    try {
      const savedApprovals = localStorage.getItem("loginApprovals");
      let approvalsList: any[] = savedApprovals ? JSON.parse(savedApprovals) : [];
      approvalsList = approvalsList.map((a: any) => 
        a.id === approvalId ? {
          ...a,
          status: "rejected",
          rejectedAt: new Date().toISOString(),
          rejectedBy: user.userId,
        } : a
      );
      localStorage.setItem("loginApprovals", JSON.stringify(approvalsList));
      await loadLoginApprovals();
      setMessage("Zahtjev uspješno odbijen");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Greška pri odbijanju zahtjeva:", error);
      setMessage("Greška pri odbijanju zahtjeva");
      setTimeout(() => setMessage(""), 5000);
    }
  };

  // Učitaj zahtjeve kada je korisnik vlasnik
  useEffect(() => {
    if (isOwner) {
      loadLoginApprovals();
      
      // Učitaj zahtjeve (real-time listener uklonjen - koristimo localStorage)
      loadLoginApprovals();
    }
  }, [isOwner]);

  // Učitaj uređaje kada je korisnik vlasnik
  useEffect(() => {
    if (isOwner) {
      loadDevices();
    }
  }, [isOwner]);

  // Učitaj broj obračuna iz arhive
  const loadArhivaCount = async () => {
    const user = getOfflineUser();
    if (!user) return;

    try {
      setLoadingArhivaCount(true);
      // Učitaj iz localStorage ili API
      const arhiva = localStorage.getItem("arhivaObracuna");
      if (arhiva) {
        const parsed = JSON.parse(arhiva);
        setArhivaCount(parsed.length);
      } else {
        // Pokušaj učitati iz API-ja
        try {
          const response = await fetch("/api/obracuni");
          if (response.ok) {
            const data = await response.json();
            setArhivaCount(data.obracuni?.length || 0);
          }
        } catch (e) {
          setArhivaCount(0);
        }
      }
    } catch (error) {
      console.error("Greška pri učitavanju broja obračuna:", error);
      setArhivaCount(0);
    } finally {
      setLoadingArhivaCount(false);
    }
  };

  // Učitaj broj obračuna kada se komponenta učita
  useEffect(() => {
    loadArhivaCount();
  }, []);


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


  const handleLogout = async () => {
    try {
      localStorage.removeItem("offlineUser");
      console.log("Uspješna odjava, preusmjeravam na login");
      // Session se automatski briše kroz Firebase Auth
      // API route nije potreban za static export
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
        @media (max-width: 768px) {
          .table-wrapper-scroll {
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          .table-wrapper-scroll table {
            min-width: 800px;
          }
          div[style*='maxWidth: 1200px'] { padding: 10px; }
          h1 { font-size: 20px; margin-bottom: 16px !important; }
          h2 { font-size: 16px; margin-bottom: 12px !important; }
          h3 { font-size: 14px; margin-bottom: 8px !important; }
          table { font-size: 12px; overflow-x: auto; display: block; }
          th, td { padding: 8px !important; font-size: 12px !important; min-width: 100px; }
          button { width: 100%; margin: 4px 0; padding: 10px; font-size: 14px; min-height: 44px; }
          input { width: 100%; margin: 4px 0; padding: 8px; font-size: 14px; min-height: 44px; }
          div[style*='display: flex'] { flex-direction: column; gap: 8px; }
          div[style*='gap: 8px'] { gap: 8px !important; }
          div[style*='padding: 16px'] { padding: 12px !important; }
          div[style*='padding: 40px'] { padding: 20px !important; }
          /* Forma za uređivanje uređaja - centriranje i mobilna prilagodba */
          td[colspan="7"] {
            width: 100% !important;
            max-width: 100% !important;
            padding: 8px !important;
            box-sizing: border-box !important;
          }
          td[colspan="7"] > div {
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          /* Forma za uređivanje */
          div[style*="flexDirection: column"][style*="gap: 16px"] {
            width: 100% !important;
            max-width: 100% !important;
            padding: 8px !important;
            box-sizing: border-box !important;
          }
          /* Select i input elementi */
          select, input[type="text"] {
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          /* Div sa dozvolama */
          div[style*="flexDirection: column"][style*="gap: 12px"][style*="padding: 16px"] {
            padding: 10px !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          /* Checkbox label-ovi */
          label[style*="display: flex"] {
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          /* Button container */
          div[style*="display: flex"][style*="gap: 12px"][style*="width: 100%"] {
            flex-direction: column !important;
            width: 100% !important;
          }
          div[style*="display: flex"][style*="gap: 12px"][style*="width: 100%"] button {
            width: 100% !important;
            flex: 1 1 100% !important;
          }
          /* Container za uređivanje */
          div[style*="marginBottom: 32px"][style*="border: 2px"] {
            width: 100% !important;
            max-width: 100% !important;
            padding: 10px !important;
            box-sizing: border-box !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
          }
          /* Osiguraj da tabela wrapper ne prelazi širinu */
          .table-wrapper-scroll {
            width: 100% !important;
            max-width: 100vw !important;
            overflow-x: auto !important;
            box-sizing: border-box !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            padding: 0 !important;
          }
          /* Forma za uređivanje - osiguraj da ne prelazi širinu ekrana */
          td[colspan] {
            position: relative !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            padding: 6px !important;
          }
          /* Zaključaj horizontalni scroll kada je editing box otvoren na mobilnom */
          .table-wrapper-scroll:has(.editing-device-box) {
            scroll-behavior: smooth !important;
            overflow-x: hidden !important;
            position: relative !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          /* Blokiraj scroll na body i html dok je editing box otvoren */
          body:has(.editing-device-box),
          html:has(.editing-device-box) {
            overflow-x: hidden !important;
            width: 100% !important;
          }
          /* Osiguraj da editing box bude unutar viewport-a na mobilnom */
          .editing-device-box {
            scroll-margin: 0 !important;
            position: relative !important;
            width: 100% !important;
            max-width: 100% !important;
            left: 0 !important;
            right: 0 !important;
            margin: 0 !important;
            padding: 6px !important;
            box-sizing: border-box !important;
            display: block !important;
          }
          /* Osiguraj da tabela ne prelazi viewport kada je editing box otvoren */
          .table-wrapper-scroll:has(.editing-device-box) table {
            width: 100% !important;
            max-width: 100% !important;
            min-width: auto !important;
          }
          /* Osiguraj da parent container ne omogućava scroll */
          div[style*="maxWidth: 1200px"]:has(.editing-device-box) {
            overflow-x: hidden !important;
            width: 100% !important;
            max-width: 100% !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          /* Osiguraj da tr element ne prelazi viewport */
          tr:has(.editing-device-box) {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          /* Osiguraj da editing box cell preuzme punu širinu */
          tr:has(.editing-device-box) td {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          /* Editing box - smanji padding i gap na mobilnom */
          .editing-device-box > div {
            gap: 6px !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          .editing-device-box h4 {
            font-size: 13px !important;
            margin-bottom: 4px !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .editing-device-box > div > div {
            padding: 6px !important;
            gap: 6px !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          .editing-device-box label {
            font-size: 12px !important;
            margin-bottom: 3px !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          .editing-device-box select,
          .editing-device-box input[type="text"] {
            padding: 5px 8px !important;
            font-size: 12px !important;
            min-height: 30px !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          .editing-device-box button {
            padding: 6px 10px !important;
            font-size: 12px !important;
            min-height: 32px !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          .editing-device-box > div > div > div {
            gap: 4px !important;
            padding: 6px !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          .editing-device-box > div > div > div > label {
            padding: 3px !important;
            min-height: 28px !important;
            font-size: 11px !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          .editing-device-box > div > div > div > label > input[type="checkbox"] {
            width: 16px !important;
            height: 16px !important;
            min-width: 16px !important;
            min-height: 16px !important;
          }
          .editing-device-box > div > div > div > div {
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            gap: 4px !important;
          }
          .editing-device-box > div > div > div > div > button {
            width: 100% !important;
            flex: 1 1 100% !important;
            box-sizing: border-box !important;
          }
        }
      `}</style>

      <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#1f2937", marginBottom: "24px" }}>
        Moj Profil
      </h1>

      <div style={{ marginBottom: "32px", border: "2px solid #e5e7eb", borderRadius: "12px", padding: "16px", background: "#f9fafb" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#1f2937", marginBottom: "16px" }}>
          Promijeni ime aplikacije
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
          <input
            type="text"
            value={localAppName}
            onChange={(e) => {
              setLocalAppName(e.target.value);
              setIsAppNameUpdated(false);
            }}
            style={inputStyle}
            placeholder="Unesite ime aplikacije"
          />
          <button style={buttonStyle} onClick={handleSaveAppName}>
            Spremi ime
          </button>
          {isAppNameUpdated && (
            <span style={{ 
              color: "#16a34a", 
              fontSize: "14px", 
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}>
              ✓ Ažurirano {lastUpdatedTime && `(${lastUpdatedTime})`}
            </span>
          )}
        </div>
        {message && <p style={{ color: message.includes("Greška") ? "#dc2626" : "#15803d", marginTop: "8px" }}>{message}</p>}
        <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "8px" }}>
          Trenutno ime aplikacije: <strong>{appName}</strong>
        </p>
      </div>


      {/* Upravljanje uređajima - samo za vlasnika */}
      {isOwner === true && role !== "konobar" && (
        <div style={{ marginBottom: "32px", border: "2px solid #e5e7eb", borderRadius: "12px", padding: "16px", background: "#f9fafb" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#1f2937", marginBottom: "16px" }}>
            📱 Upravljanje Uređajima
          </h2>
          <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "20px" }}>
            Upravljajte uređajima, dodijelite uloge i dozvole. Novi uređaji zahtijevaju odobrenje prije pristupa.
          </p>


          {/* Tabela sa uređajima */}
          {loadingDevices ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "40px" }}>
              <FaSpinner style={{ fontSize: "32px", color: "#3b82f6", animation: "spin 1s linear infinite" }} />
            </div>
          ) : devices.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
              <FaMobile style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.5 }} />
              <p style={{ fontSize: "16px" }}>Nema uređaja.</p>
              <p style={{ fontSize: "14px", marginTop: "8px" }}>Uređaji će se automatski pojaviti kada se korisnici prijave.</p>
            </div>
          ) : (
            <div style={tableWrapperStyle} className={tableWrapperClassName}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Ime uređaja</th>
                    <th style={thStyle}>Uređaj</th>
                    <th style={thStyle}>Browser / OS</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Uloga</th>
                    <th style={thStyle}>Posljednja prijava</th>
                    <th style={thStyle}>Akcije</th>
                    <th style={thStyle}>Blokiraj</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Prikaži uređaje */}
                  {devices.map((device) => {
                    const roleColors: Record<string, { bg: string; color: string }> = {
                      vlasnik: { bg: "#dbeafe", color: "#2563eb" },
                      konobar: { bg: "#dcfce7", color: "#16a34a" },
                      verifikacija: { bg: "#fef3c7", color: "#f59e0b" },
                    };

                    const deviceStatus = device.status || (device.role === null ? "verifikacija" : null);
                    const isBlocked = device.isBlocked === true;
                    const needsVerification = deviceStatus === "verifikacija";
                    const roleColor = device.role ? roleColors[device.role] || { bg: "#f3f4f6", color: "#6b7280" } : 
                                      needsVerification ? roleColors.verifikacija : { bg: "#f3f4f6", color: "#6b7280" };
                    const isEditing = editingDeviceId === device.id;

                    return (
                      <React.Fragment key={device.id}>
                        <tr>
                        <td style={tdStyle}>
                          {isEditing ? (
                            <input
                              type="text"
                              value={deviceNames[device.id] !== undefined ? deviceNames[device.id] : (device.deviceName || "")}
                              onChange={(e) => setDeviceNames({ ...deviceNames, [device.id]: e.target.value })}
                              placeholder="Unesite ime uređaja"
                              style={{
                                padding: "12px 16px",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                                fontSize: "16px",
                                width: "100%",
                                minHeight: "44px",
                              }}
                            />
                          ) : (
                            <span style={{ fontWeight: device.deviceName ? 500 : 400, color: device.deviceName ? "#1f2937" : "#9ca3af" }}>
                              {device.deviceName || "Nema imena"}
                            </span>
                          )}
                        </td>
                        <td style={tdStyle}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            {device.deviceInfo?.os === "Android" || device.deviceInfo?.os === "iOS" ? (
                              <FaMobile style={{ fontSize: "16px", color: "#6b7280" }} />
                            ) : (
                              <FaDesktop style={{ fontSize: "16px", color: "#6b7280" }} />
                            )}
                            <span>{device.deviceInfo?.screenSize || "N/A"}</span>
                          </div>
                        </td>
                        <td style={tdStyle}>
                          {device.deviceInfo?.browser || "N/A"} / {device.deviceInfo?.os || "N/A"}
                        </td>
                        <td style={tdStyle}>
                          {needsVerification ? (
                            <span
                              style={{
                                padding: "4px 12px",
                                borderRadius: "12px",
                                fontSize: "12px",
                                fontWeight: 600,
                                backgroundColor: "#fef3c7",
                                color: "#f59e0b",
                              }}
                            >
                              Verifikacija
                            </span>
                          ) : isBlocked ? (
                            <span
                              style={{
                                padding: "4px 12px",
                                borderRadius: "12px",
                                fontSize: "12px",
                                fontWeight: 600,
                                backgroundColor: "#fee2e2",
                                color: "#dc2626",
                              }}
                            >
                              Blokiran
                            </span>
                          ) : (
                            <span
                              style={{
                                padding: "4px 12px",
                                borderRadius: "12px",
                                fontSize: "12px",
                                fontWeight: 600,
                                backgroundColor: "#dcfce7",
                                color: "#16a34a",
                              }}
                            >
                              Aktivan
                            </span>
                          )}
                        </td>
                        <td style={tdStyle}>
                          <span
                            style={{
                              padding: "4px 12px",
                              borderRadius: "12px",
                              fontSize: "12px",
                              fontWeight: 600,
                              backgroundColor: roleColor.bg,
                              color: roleColor.color,
                            }}
                          >
                            {device.role || "Nedodijeljena"}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          {device.lastLogin
                            ? device.lastLogin.toLocaleDateString("bs-BA") + " " + device.lastLogin.toLocaleTimeString("bs-BA", { hour: "2-digit", minute: "2-digit" })
                            : "N/A"}
                        </td>
                        <td style={tdStyle}>
                          {needsVerification ? (
                            <button
                              onClick={() => handleApproveDevice(device.id)}
                              style={{ ...buttonStyle, background: "#16a34a", fontSize: "12px", padding: "4px 8px" }}
                            >
                              Odobri
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingDeviceId(device.id);
                                setSelectedRole({ ...selectedRole, [device.id]: device.role || null });
                                setEditingPermissions(device.permissions || {});
                                setDeviceNames({ ...deviceNames, [device.id]: device.deviceName || "" });
                              }}
                              style={{ ...buttonStyle, fontSize: "12px", padding: "4px 8px" }}
                            >
                              Uredi
                            </button>
                          )}
                        </td>
                        <td style={tdStyle}>
                          <button
                            onClick={() => handleToggleBlockDevice(device.id, isBlocked)}
                            disabled={savingRole || needsVerification}
                            style={{
                              ...buttonStyle,
                              background: isBlocked ? "#16a34a" : "#dc2626",
                              fontSize: "12px",
                              padding: "4px 8px",
                              opacity: (savingRole || needsVerification) ? 0.5 : 1,
                              cursor: (savingRole || needsVerification) ? "not-allowed" : "pointer",
                            }}
                          >
                            {isBlocked ? "Odblokiraj" : "Blokiraj"}
                          </button>
                        </td>
                      </tr>
                      {isEditing && (
                        <tr>
                          <td 
                            ref={editingDeviceId === device.id ? editingBoxRef : null}
                            colSpan={7} 
                            className="editing-device-box"
                            style={{ ...tdStyle, padding: "16px", background: "#f9fafb" }}
                          >
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                              <div>
                                <h4 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "12px", color: "#1f2937" }}>
                                  Uredi Ulogu i Dozvole
                                </h4>
                                {isEditing ? (
                                  <div style={{ 
                                    display: "flex", 
                                    flexDirection: "column", 
                                    gap: "16px", 
                                    padding: "16px", 
                                    background: "#fff", 
                                    borderRadius: "8px", 
                                    border: "1px solid #e5e7eb" 
                                  }}>
                                    <div>
                                      <label style={{ 
                                        display: "block", 
                                        fontSize: "16px", 
                                        fontWeight: 600, 
                                        marginBottom: "8px", 
                                        color: "#374151" 
                                      }}>
                                        Uloga:
                                      </label>
                                      <select
                                        value={selectedRole[device.id] || device.role || ""}
                                        onChange={(e) => {
                                          const newRole = e.target.value as string || null;
                                          setSelectedRole({ ...selectedRole, [device.id]: newRole });
                                          if (newRole === "konobar" && !device.permissions) {
                                            setEditingPermissions({
                                              dashboard: true,
                                              obracun: true,
                                              arhiva: true,
                                              cjenovnik: true,
                                              profit: true,
                                              profile: true,
                                              admin: false,
                                            });
                                          }
                                        }}
                                        style={{
                                          padding: "12px 16px",
                                          border: "1px solid #e5e7eb",
                                          borderRadius: "8px",
                                          fontSize: "16px",
                                          backgroundColor: "#fff",
                                          color: "#1f2937",
                                          cursor: "pointer",
                                          width: "100%",
                                          minHeight: "44px",
                                          WebkitAppearance: "none",
                                          appearance: "none",
                                        }}
                                      >
                                        <option value="">Nedodijeljena</option>
                                        <option value="vlasnik">Vlasnik</option>
                                        <option value="konobar">Konobar</option>
                                      </select>
                                    </div>
                                    {(selectedRole[device.id] || device.role) === "konobar" && (
                                      <div>
                                        <label style={{ 
                                          display: "block", 
                                          fontSize: "16px", 
                                          fontWeight: 600, 
                                          marginBottom: "12px", 
                                          color: "#374151" 
                                        }}>
                                          Dozvole za stranice:
                                        </label>
                                        <div style={{ 
                                          display: "flex", 
                                          flexDirection: "column",
                                          gap: "12px", 
                                          padding: "16px", 
                                          background: "#f9fafb", 
                                          borderRadius: "8px", 
                                          border: "1px solid #e5e7eb" 
                                        }}>
                                          {["dashboard", "obracun", "arhiva", "cjenovnik", "profit", "profile"].map((page) => (
                                            <label 
                                              key={page} 
                                              style={{ 
                                                display: "flex", 
                                                alignItems: "center", 
                                                gap: "12px", 
                                                fontSize: "16px", 
                                                cursor: "pointer",
                                                padding: "8px",
                                                borderRadius: "6px",
                                                minHeight: "44px",
                                                transition: "background-color 0.2s"
                                              }}
                                              onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = "#f3f4f6";
                                              }}
                                              onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = "transparent";
                                              }}
                                            >
                                              <input
                                                type="checkbox"
                                                checked={editingPermissions[page] || false}
                                                onChange={(e) => {
                                                  setEditingPermissions({
                                                    ...editingPermissions,
                                                    [page]: e.target.checked,
                                                  });
                                                }}
                                                style={{ 
                                                  cursor: "pointer",
                                                  width: "24px",
                                                  height: "24px",
                                                  minWidth: "24px",
                                                  minHeight: "24px",
                                                  accentColor: "#3b82f6"
                                                }}
                                              />
                                              <span style={{ userSelect: "none" }}>
                                              {page === "dashboard" ? "Radna površina" :
                                               page === "obracun" ? "Obračun" :
                                               page === "arhiva" ? "Arhiva" :
                                               page === "cjenovnik" ? "Cjenovnik" :
                                               page === "profit" ? "Profit" :
                                               "Profil"}
                                              </span>
                                            </label>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    <div style={{ 
                                      display: "flex", 
                                      flexDirection: "column",
                                      gap: "12px", 
                                      width: "100%" 
                                    }}>
                                      <button
                                        onClick={async () => {
                                          const roleToSave = selectedRole[device.id] || device.role;
                                          if (roleToSave === "konobar") {
                                            await handleSavePermissions(device.id, roleToSave);
                                          } else {
                                            await handleAssignRole(device.id, roleToSave);
                                          }
                                          // Spremi ime uređaja ako je promijenjeno
                                          if (deviceNames[device.id] !== undefined && deviceNames[device.id] !== device.deviceName) {
                                            await handleSaveDeviceName(device.id, deviceNames[device.id]);
                                          }
                                          setSelectedRole({ ...selectedRole, [device.id]: undefined as any });
                                          setDeviceNames({ ...deviceNames, [device.id]: undefined as any });
                                        }}
                                        style={{ 
                                          ...buttonStyle, 
                                          background: "#16a34a", 
                                          fontSize: "16px", 
                                          padding: "14px 20px",
                                          minHeight: "48px",
                                          width: "100%",
                                          fontWeight: 600
                                        }}
                                      >
                                        Spremi
                                      </button>
                                      <div style={{ display: "flex", gap: "12px", width: "100%" }}>
                                      <button
                                        onClick={() => {
                                          setEditingDeviceId(null);
                                          setEditingPermissions({});
                                          setSelectedRole({ ...selectedRole, [device.id]: undefined as any });
                                          setDeviceNames({ ...deviceNames, [device.id]: undefined as any });
                                        }}
                                          style={{ 
                                            ...buttonStyle, 
                                            background: "#6b7280", 
                                            fontSize: "16px", 
                                            padding: "14px 20px",
                                            minHeight: "48px",
                                            flex: 1,
                                            fontWeight: 600
                                          }}
                                      >
                                        Odustani
                                      </button>
                                      <button
                                        onClick={() => handleDeleteDevice(device.id)}
                                          style={{ 
                                            ...buttonStyle, 
                                            background: "#dc2626", 
                                            fontSize: "16px", 
                                            padding: "14px 20px",
                                            minHeight: "48px",
                                            flex: 1,
                                            fontWeight: 600
                                          }}
                                      >
                                          Izbriši
                                      </button>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    <div style={{ padding: "12px", background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                                      <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 8px 0" }}>
                                        <strong>Uloga:</strong> {device.role || "Nedodijeljena"}
                                      </p>
                                      {device.role === "konobar" && device.permissions && (
                                        <div>
                                          <p style={{ fontSize: "12px", fontWeight: 600, margin: "0 0 8px 0", color: "#374151" }}>
                                            Dozvole:
                                          </p>
                                          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                            {Object.entries(device.permissions).filter(([key]) => key !== "admin").map(([page, allowed]) => (
                                              <span
                                                key={page}
                                                style={{
                                                  padding: "4px 8px",
                                                  borderRadius: "4px",
                                                  fontSize: "11px",
                                                  backgroundColor: allowed ? "#dcfce7" : "#fee2e2",
                                                  color: allowed ? "#16a34a" : "#dc2626",
                                                }}
                                              >
                                                {page === "dashboard" ? "Radna površina" :
                                                 page === "obracun" ? "Obračun" :
                                                 page === "arhiva" ? "Arhiva" :
                                                 page === "cjenovnik" ? "Cjenovnik" :
                                                 page === "profit" ? "Profit" :
                                                 "Profil"}: {allowed ? "Dozvoljeno" : "Blokirano"}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => {
                                        setEditingDeviceId(device.id);
                                        setSelectedRole({ ...selectedRole, [device.id]: device.role || null });
                                        setEditingPermissions(device.permissions || {});
                                        setDeviceNames({ ...deviceNames, [device.id]: device.deviceName || "" });
                                      }}
                                      style={{ ...buttonStyle, background: "#3b82f6", fontSize: "13px", padding: "8px 16px", alignSelf: "flex-start" }}
                                    >
                                      Uredi
                                    </button>
                                  </div>
                                )}
                              </div>
                              <div style={{ paddingTop: "16px", borderTop: "1px solid #e5e7eb" }}>
                                <h4 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "12px", color: "#1f2937" }}>
                                  Informacije o uređaju
                                </h4>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", fontSize: "14px", color: "#6b7280" }}>
                                  <div><strong>Device ID:</strong> {device.id}</div>
                                  <div><strong>Email:</strong> {device.userEmail || "N/A"}</div>
                                  <div><strong>Browser:</strong> {device.deviceInfo?.browser || "N/A"}</div>
                                  <div><strong>OS:</strong> {device.deviceInfo?.os || "N/A"}</div>
                                  <div><strong>Ekran:</strong> {device.deviceInfo?.screenSize || "N/A"}</div>
                                  <div><strong>Prvi put viđen:</strong> {device.deviceInfo?.firstSeen ? device.deviceInfo.firstSeen.toLocaleDateString("bs-BA") : "N/A"}</div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop: "16px", padding: "12px", background: "#e0f2fe", borderRadius: "8px", border: "1px solid #0ea5e9" }}>
            <p style={{ fontSize: "12px", color: "#0c4a6e", margin: 0 }}>
              <strong>💡 Napomena:</strong> Vlasnik ima pristup svemu. Konobar može pristupiti samo stranicama koje su mu dozvoljene. Novi uređaji zahtijevaju odobrenje prije pristupa. Blokirani uređaji ne mogu se prijaviti dok se ne odblokiraju.
            </p>
          </div>
        </div>
      )}

      {/* Stara sekcija za sesije - sakrivena jer je spojena gore */}
      {false && role === "vlasnik" && (
      <div style={{ marginBottom: "32px", border: "2px solid #e5e7eb", borderRadius: "12px", padding: "16px", background: "#f9fafb" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#1f2937", marginBottom: "16px" }}>
          Pregled sesija
        </h2>
        <div style={tableWrapperStyle} className={tableWrapperClassName}>
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
            {(() => {
              // Filtriraj sesije - prikaži samo jednu sesiju po IP adresi (najnoviju)
              const user = getOfflineUser();
              const userSessions = sessions.filter(s => s.userEmail === user?.email);
              const uniqueIPSessions: any[] = [];
              const seenIPs = new Set<string>();
              
              // Sortiraj po ID-u (koji je timestamp, veći ID = noviji) - najnovije prvo
              const sortedSessions = [...userSessions].sort((a, b) => {
                const idA = parseInt(a.id) || 0;
                const idB = parseInt(b.id) || 0;
                return idB - idA; // Najnovije prvo
              });
              
              for (const session of sortedSessions) {
                if (session.ip && session.ip !== "N/A") {
                  if (!seenIPs.has(session.ip)) {
                    seenIPs.add(session.ip);
                    uniqueIPSessions.push(session);
                  }
                } else {
                  // Ako nema IP adresu, dodaj je
                  uniqueIPSessions.push(session);
                }
              }
              
              return uniqueIPSessions;
            })().map((session) => (
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
      </div>
      )}

      <div style={{ marginBottom: "32px", border: "2px solid #e5e7eb", borderRadius: "12px", padding: "16px", background: "#f9fafb" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#1f2937", marginBottom: "16px" }}>
          Statistika korištenja
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <div style={{ padding: "16px", background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
            <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Ukupno obračuna</p>
            <p style={{ fontSize: "24px", fontWeight: 600, color: "#1f2937" }}>
              {loadingArhivaCount ? (
                <span style={{ fontSize: "16px", color: "#6b7280" }}>Učitavanje...</span>
              ) : (
                arhivaCount
              )}
            </p>
          </div>
          <div style={{ padding: "16px", background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
            <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Artikala u cjenovniku</p>
            <p style={{ fontSize: "24px", fontWeight: 600, color: "#1f2937" }}>
              {cjenovnik.length}
            </p>
          </div>
          <div style={{ padding: "16px", background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
            <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Aktivnih sesija</p>
            <p style={{ fontSize: "24px", fontWeight: 600, color: "#1f2937" }}>
              {devices.filter(d => (d.role === "vlasnik" || d.role === "konobar") && d.status === "approved" && !d.isBlocked).length}
            </p>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "32px", border: "2px solid #e5e7eb", borderRadius: "12px", padding: "24px", background: "#f9fafb" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#1f2937", marginBottom: "20px", textAlign: "center" }}>
          📥 Backup i export
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <button
              onClick={() => setShowBackupFilters(!showBackupFilters)}
              style={{ 
                ...buttonStyle, 
                background: showBackupFilters ? "#6b7280" : "#3b82f6", 
                width: "auto",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              {showBackupFilters ? "✖️ Sakrij filtere" : "📅 Odaberi period za backup"}
            </button>
          </div>
          
          {showBackupFilters && (
            <div style={{ 
              padding: "20px", 
              background: "#fff", 
              borderRadius: "8px", 
              border: "1px solid #e5e7eb", 
              display: "flex", 
              flexDirection: "column", 
              gap: "16px",
              width: "100%",
              maxWidth: "500px"
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "14px", fontWeight: 500, color: "#1f2937" }}>Od datuma:</label>
                <input
                  type="date"
                  value={backupFromDate}
                  onChange={(e) => setBackupFromDate(e.target.value)}
                  style={{ 
                    ...inputStyle, 
                    width: "100%",
                    padding: "10px",
                    fontSize: "14px"
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "14px", fontWeight: 500, color: "#1f2937" }}>Do datuma:</label>
                <input
                  type="date"
                  value={backupToDate}
                  onChange={(e) => setBackupToDate(e.target.value)}
                  style={{ 
                    ...inputStyle, 
                    width: "100%",
                    padding: "10px",
                    fontSize: "14px"
                  }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button
                  onClick={() => {
                    setBackupFromDate("");
                    setBackupToDate("");
                  }}
                  style={{ ...buttonStyle, background: "#6b7280", width: "auto", padding: "10px 20px" }}
                >
                  🔄 Resetuj filtere
                </button>
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center", width: "100%" }}>
            <button
            onClick={async () => {
              const user = getOfflineUser();
              const userId = user?.userId;
              if (!userId) return;
              
              // Učitaj iz localStorage / API
              let arhiva: any[] = [];
              let cjenovnik: any[] = [];
              
              try {
                const arhivaRaw = localStorage.getItem("arhivaObracuna");
                if (arhivaRaw) arhiva = JSON.parse(arhivaRaw);
                const cjenRaw = localStorage.getItem("cjenovnik");
                if (cjenRaw) cjenovnik = JSON.parse(cjenRaw);
              } catch (error) {
                console.error("Greška pri učitavanju podataka za backup:", error);
                alert("Greška pri učitavanju podataka za backup.");
                return;
              }
              
              // Filtriraj arhivu po datumu ako su odabrani datumi
              if (backupFromDate || backupToDate) {
                arhiva = arhiva.filter((item: any) => {
                  const itemDate = new Date(item.datum.split(".").reverse().join("-"));
                  const fromDate = backupFromDate ? new Date(backupFromDate) : null;
                  const toDate = backupToDate ? new Date(backupToDate) : null;
                  
                  if (fromDate && toDate) {
                    return itemDate >= fromDate && itemDate <= toDate;
                  } else if (fromDate) {
                    return itemDate >= fromDate;
                  } else if (toDate) {
                    return itemDate <= toDate;
                  }
                  return true;
                });
              }
              
              // Generiši PDF
              const doc = new jsPDF();
              
              // Funkcija za pravilno ispisivanje teksta sa UTF-8 karakterima (č, ć, đ, š, ž)
              // jsPDF standardno ne podržava UTF-8 karaktere u default fontu
              // Koristimo jednostavan workaround: zamjenjujemo karaktere sa ASCII ekvivalentima
              // ili koristimo doc.text() direktno jer jsPDF 3.x bi trebao podržavati UTF-8
              const addText = (text: string, x: number, y: number, options?: any) => {
                if (text && typeof text === 'string') {
                  // Provjerimo da li tekst sadrži UTF-8 karaktere sa kvakicama
                  const hasSpecialChars = /[čćđšžČĆĐŠŽ]/.test(text);
                  
                  if (hasSpecialChars) {
                    // Za UTF-8 karaktere, koristimo doc.text() direktno
                    // jsPDF 3.x bi trebao podržavati UTF-8, ali možda treba eksplicitno postaviti encoding
                    try {
                      // Pokušajmo sa standardnim text() metodom
                      // Ako ne radi, možemo koristiti HTML metodu ili dodati font
                      doc.text(text, x, y, options || {});
                    } catch (error) {
                      // Fallback: zamjenjujemo karaktere sa ASCII ekvivalentima
                      console.warn("Greška pri ispisu teksta sa UTF-8 karakterima, koristim ASCII ekvivalente:", error);
                      const asciiText = text
                        .replace(/č/g, 'c').replace(/ć/g, 'c')
                        .replace(/đ/g, 'd').replace(/š/g, 's').replace(/ž/g, 'z')
                        .replace(/Č/g, 'C').replace(/Ć/g, 'C')
                        .replace(/Đ/g, 'D').replace(/Š/g, 'S').replace(/Ž/g, 'Z');
                      doc.text(asciiText, x, y, options || {});
                    }
                  } else {
                    // Standardni tekst bez UTF-8 karaktera
                    doc.text(text, x, y, options || {});
                  }
                } else {
                  doc.text(String(text || ''), x, y, options || {});
                }
              };
              
              let yPos = 20;
              
              // Naslov
              doc.setFontSize(18);
              addText("Backup podataka", 14, yPos);
              yPos += 10;
              
              // Datum exporta
              doc.setFontSize(12);
              addText(`Datum exporta: ${new Date().toLocaleString("bs-BA")}`, 14, yPos);
              yPos += 8;
              
              if (backupFromDate || backupToDate) {
                addText(`Period: ${backupFromDate || "početak"} - ${backupToDate || "kraj"}`, 14, yPos);
                yPos += 8;
              }
              
              yPos += 5;
              
              // Cjenovnik
              doc.setFontSize(14);
              addText("Cjenovnik", 14, yPos);
              yPos += 8;
              
              doc.setFontSize(10);
              if (cjenovnik.length > 0) {
                addText("Naziv | Cijena | Nabavna cijena | Početno stanje", 14, yPos);
                yPos += 6;
                cjenovnik.forEach((item: any) => {
                  if (yPos > 280) {
                    doc.addPage();
                    yPos = 20;
                  }
                  const text = `${item.naziv} | ${item.cijena} KM | ${item.nabavnaCijena} KM | ${item.pocetnoStanje}`;
                  addText(text, 14, yPos);
                  yPos += 6;
                });
              } else {
                addText("Nema artikala u cjenovniku", 14, yPos);
                yPos += 6;
              }
              
              yPos += 5;
              
              // Arhiva
              doc.setFontSize(14);
              if (yPos > 280) {
                doc.addPage();
                yPos = 20;
              }
              addText(`Arhiva obračuna (${arhiva.length} obračuna)`, 14, yPos);
              yPos += 8;
              
              doc.setFontSize(10);
              if (arhiva.length > 0) {
                arhiva.forEach((item: any, index: number) => {
                  // Svaki obračun počinje na novoj stranici
                  if (index > 0 || yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                  }
                  
                  // Naslov obračuna
                  doc.setFontSize(14);
                  addText(`Obračun - ${item.datum}`, 14, yPos);
                  yPos += 8;
                  
                  // Flagovi (ako postoje)
                  if (item.imaUlaz) {
                    doc.setFontSize(10);
                    doc.setTextColor(234, 179, 8); // Žuta
                    addText("(Ima ulaz)", 14, yPos);
                    doc.setTextColor(0, 0, 0); // Crna
                    yPos += 6;
                  } else if (item.isAzuriran) {
                    doc.setFontSize(10);
                    doc.setTextColor(245, 158, 11); // Narandžasta
                    addText("(Ažurirano)", 14, yPos);
                    doc.setTextColor(0, 0, 0); // Crna
                    yPos += 6;
                  }
                  
                  // Tabela artikala
                  doc.setFontSize(12);
                  addText("Artikli:", 14, yPos);
                  yPos += 7;
                  
                  if (item.artikli && item.artikli.length > 0) {
                    // Header tabele
                    doc.setFontSize(9);
                    const startX = 14;
                    const colWidths = [50, 25, 25, 25, 25, 25, 25, 30];
                    const headers = ["Naziv", "Cijena", "Poč. st.", "Ulaz", "Ukupno", "Utroš.", "Kraj. st.", "Vrijednost"];
                    
                    // Header
                    let xPos = startX;
                    headers.forEach((header, i) => {
                      addText(header, xPos, yPos);
                      xPos += colWidths[i];
                    });
                    yPos += 6;
                    
                    // Linija ispod headera
                    doc.line(14, yPos - 2, 200, yPos - 2);
                    yPos += 4;
                    
                    // Artikli
                    item.artikli.forEach((art: any, artIndex: number) => {
                      // Ako ne staje na trenutnu stranicu, pređi na novu i ponovi header
                      if (yPos > 270) {
                        doc.addPage();
                        yPos = 20;
                        // Ponovi naslov obračuna na novoj stranici
                        doc.setFontSize(14);
                        addText(`Obračun - ${item.datum} (nastavak)`, 14, yPos);
                        yPos += 8;
                        doc.setFontSize(12);
                        addText("Artikli:", 14, yPos);
                        yPos += 7;
                        // Ponovi header tabele
                        doc.setFontSize(9);
                        xPos = startX;
                        headers.forEach((header, i) => {
                          addText(header, xPos, yPos);
                          xPos += colWidths[i];
                        });
                        yPos += 6;
                        doc.line(14, yPos - 2, 200, yPos - 2);
                        yPos += 4;
                      }
                      
                      xPos = startX;
                      const ulaz = art.sačuvanUlaz ?? art.ulaz ?? 0;
                      const pocetnoStanje = art.staroPocetnoStanje !== undefined && art.staroPocetnoStanje !== art.pocetnoStanje
                        ? `${art.pocetnoStanje} (${art.staroPocetnoStanje})`
                        : (art.pocetnoStanje ?? "-");
                      
                      addText(art.naziv.substring(0, 20), xPos, yPos);
                      xPos += colWidths[0];
                      addText((art.cijena ?? 0).toFixed(2), xPos, yPos);
                      xPos += colWidths[1];
                      addText(String(pocetnoStanje), xPos, yPos);
                      xPos += colWidths[2];
                      addText(ulaz > 0 ? ulaz.toFixed(2) : "-", xPos, yPos);
                      xPos += colWidths[3];
                      addText((art.ukupno ?? "-").toString(), xPos, yPos);
                      xPos += colWidths[4];
                      addText((art.utroseno ?? "-").toString(), xPos, yPos);
                      xPos += colWidths[5];
                      addText((art.krajnjeStanje ?? "-").toString(), xPos, yPos);
                      xPos += colWidths[6];
                      addText((art.vrijednostKM ?? 0).toFixed(2) + " KM", xPos, yPos);
                      
                      yPos += 6;
                    });
                  } else {
                    addText("Nema artikala", 14, yPos);
                    yPos += 6;
                  }
                  
                  yPos += 5;
                  
                  // Rashodi
                  if (item.rashodi && item.rashodi.length > 0) {
                    if (yPos > 250) {
                      doc.addPage();
                      yPos = 20;
                    }
                    doc.setFontSize(12);
                    addText("Rashodi:", 14, yPos);
                    yPos += 7;
                    
                    doc.setFontSize(9);
                    addText("Naziv", 14, yPos);
                    addText("Cijena", 80, yPos);
                    addText("Plaćeno", 120, yPos);
                    yPos += 6;
                    doc.line(14, yPos - 2, 200, yPos - 2);
                    yPos += 4;
                    
                    item.rashodi.forEach((r: any) => {
                      if (yPos > 270) {
                        doc.addPage();
                        yPos = 20;
                      }
                      addText(r.naziv, 14, yPos);
                      addText(r.cijena.toFixed(2) + " KM", 80, yPos);
                      addText(r.placeno ? "Da" : "Ne", 120, yPos);
                      yPos += 6;
                    });
                    yPos += 5;
                  }
                  
                  // Prihodi
                  if (item.prihodi && item.prihodi.length > 0) {
                    if (yPos > 250) {
                      doc.addPage();
                      yPos = 20;
                    }
                    doc.setFontSize(12);
                    addText("Prihodi:", 14, yPos);
                    yPos += 7;
                    
                    doc.setFontSize(9);
                    addText("Naziv", 14, yPos);
                    addText("Cijena", 80, yPos);
                    yPos += 6;
                    doc.line(14, yPos - 2, 200, yPos - 2);
                    yPos += 4;
                    
                    item.prihodi.forEach((p: any) => {
                      if (yPos > 270) {
                        doc.addPage();
                        yPos = 20;
                      }
                      addText(p.naziv, 14, yPos);
                      addText(p.cijena.toFixed(2) + " KM", 80, yPos);
                      yPos += 6;
                    });
                    yPos += 5;
                  }
                  
                  // Ukupno
                  if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                  }
                  doc.setFontSize(11);
                  addText("Ukupno:", 14, yPos);
                  yPos += 7;
                  
                  doc.setFontSize(10);
                  addText(`Ukupno artikli: ${item.ukupnoArtikli.toFixed(2)} KM`, 20, yPos);
                  yPos += 6;
                  addText(`Ukupno rashod: ${item.ukupnoRashod.toFixed(2)} KM`, 20, yPos);
                  yPos += 6;
                  addText(`Ukupno prihod: ${(item.ukupnoPrihod || 0).toFixed(2)} KM`, 20, yPos);
                  yPos += 6;
                  doc.setFontSize(11);
                  addText(`Neto: ${(item.neto || (item.ukupnoArtikli + (item.ukupnoPrihod || 0) - item.ukupnoRashod)).toFixed(2)} KM`, 20, yPos);
                  
                  yPos += 10;
                  
                  // Ne dodavaj liniju između obračuna jer svaki obračun je na posebnoj stranici
                });
              } else {
                addText("Nema obračuna u arhivi", 14, yPos);
              }
              
              // Preuzmi PDF
              const dateRange = backupFromDate || backupToDate 
                ? `-${backupFromDate || "start"}-${backupToDate || "end"}` 
                : "";
              doc.save(`backup-${new Date().toISOString().split("T")[0]}${dateRange}.pdf`);
              
              setBackupMessage(`Backup uspješno preuzet! (${arhiva.length} obračuna, ${cjenovnik.length} artikala)`);
              setTimeout(() => setBackupMessage(""), 5000);
            }}
            style={{ 
              ...buttonStyle, 
              width: "auto", 
              padding: "12px 24px",
              fontSize: "15px",
              fontWeight: 600,
              background: "#16a34a",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            📄 Preuzmi backup podataka (PDF)
          </button>
          {backupMessage && (
            <p style={{ 
              fontSize: "14px", 
              color: "#16a34a", 
              marginTop: "8px", 
              fontWeight: 500,
              textAlign: "center",
              padding: "8px 16px",
              background: "#dcfce7",
              borderRadius: "6px",
              border: "1px solid #86efac"
            }}>
              ✓ {backupMessage}
            </p>
          )}
          <p style={{ 
            fontSize: "13px", 
            color: "#6b7280",
            textAlign: "center",
            marginTop: "8px",
            maxWidth: "600px"
          }}>
            {backupFromDate || backupToDate 
              ? `📊 Preuzmite podatke za period: ${backupFromDate || "početak"} - ${backupToDate || "kraj"}`
              : "💾 Preuzmite sve podatke (arhiva i cjenovnik) kao PDF fajl"}
          </p>
          </div>
        </div>
      </div>

      {/* Pretplata sekcija */}
      <div style={{ marginBottom: "32px", border: "2px solid #e5e7eb", borderRadius: "12px", padding: "16px", background: "#f9fafb" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#1f2937", marginBottom: "16px" }}>
          Pretplata
        </h2>
        
        {subscriptionLoading || !subscription ? (
          <p style={{ color: "#6b7280", fontSize: "14px" }}>Učitavanje pretplate...</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Status pretplate */}
            <div style={{ padding: "16px", background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1f2937", marginBottom: "4px" }}>Status pretplate</h3>
                  <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
                    {subscription.isTrial 
                      ? `Probni period ističe za ${subscription.daysRemaining} ${subscription.daysRemaining === 1 ? "dan" : "dana"}`
                      : subscription.isPremium
                      ? `Premium pretplata ističe za ${subscription.daysUntilExpiry} ${subscription.daysUntilExpiry === 1 ? "dan" : "dana"}`
                      : subscription.isActive
                      ? `Pretplata ističe za ${subscription.daysUntilExpiry} ${subscription.daysUntilExpiry === 1 ? "dan" : "dana"}`
                      : subscription.isGracePeriod
                      ? `Grace period ističe za ${subscription.daysInGrace} ${subscription.daysInGrace === 1 ? "dan" : "dana"}`
                      : "Pretplata nije aktivna"}
                  </p>
                </div>
                {(() => {
                  let statusText = "N/A";
                  let statusColor = "#6b7280";
                  let statusBg = "#f3f4f6";
                  
                  if (subscription.isTrial) {
                    statusText = `Probni period (${subscription.daysRemaining} dana)`;
                    statusColor = "#3b82f6";
                    statusBg = "#dbeafe";
                  } else if (subscription.isPremium) {
                    statusText = `Premium (${subscription.daysUntilExpiry} dana)`;
                    statusColor = "#16a34a";
                    statusBg = "#dcfce7";
                  } else if (subscription.isActive) {
                    statusText = `Aktivna (${subscription.daysUntilExpiry} dana)`;
                    statusColor = "#16a34a";
                    statusBg = "#dcfce7";
                  } else if (subscription.isGracePeriod) {
                    statusText = `Grace period (${subscription.daysInGrace} dana)`;
                    statusColor = "#f59e0b";
                    statusBg = "#fef3c7";
                  } else {
                    statusText = "Neaktivna";
                    statusColor = "#dc2626";
                    statusBg = "#fee2e2";
                  }
                  
                  return (
                    <span
                      style={{
                        padding: "8px 16px",
                        borderRadius: "6px",
                        fontSize: "14px",
                        fontWeight: 600,
                        background: statusBg,
                        color: statusColor,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {statusText}
                    </span>
                  );
                })()}
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                <div>
                  <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Mjesečna cijena</p>
                  <p style={{ fontSize: "18px", fontWeight: 600, color: "#1f2937" }}>
                    {subscription.monthlyPrice.toFixed(2)} KM
                  </p>
                </div>
                
                {subscription.lastPaymentDate && (
                  <div>
                    <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Posljednja uplata</p>
                    <p style={{ fontSize: "14px", fontWeight: 500, color: "#1f2937" }}>
                      {subscription.lastPaymentDate.toLocaleDateString("bs-BA")}
                    </p>
                  </div>
                )}
                
                {subscription.expiryDate && (
                  <div>
                    <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Datum isteka</p>
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: 500,
                        color: subscription.expiryDate < new Date() ? "#dc2626" : "#1f2937",
                      }}
                    >
                      {subscription.expiryDate.toLocaleDateString("bs-BA")}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Plaćanje pretplate */}
            <div style={{ padding: "16px", background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1f2937", marginBottom: "8px" }}>
                Plaćanje pretplate
              </h3>
              <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "16px" }}>
                Odaberite period pretplate i izvršite bankovni transfer. Cijena: 12 KM/mjesec.
              </p>
              
              {/* Odabir perioda */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "14px", fontWeight: 500, color: "#1f2937", marginBottom: "8px", display: "block" }}>
                  Odaberite period:
                </label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {[1, 2, 3, 6].map((months) => {
                    const totalPrice = 12 * months;
                    return (
                      <button
                        key={months}
                        onClick={() => setSelectedMonths(months)}
                        style={{
                          padding: "12px 20px",
                          border: selectedMonths === months ? "2px solid #16a34a" : "1px solid #e5e7eb",
                          borderRadius: "8px",
                          background: selectedMonths === months ? "#dcfce7" : "#fff",
                          color: selectedMonths === months ? "#16a34a" : "#1f2937",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: selectedMonths === months ? 600 : 500,
                          transition: "all 0.2s",
                        }}
                      >
                        {months} {months === 1 ? "mjesec" : "mjeseci"}
                        <br />
                        <span style={{ fontSize: "12px", opacity: 0.8 }}>{totalPrice} KM</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ukupna cijena */}
              <div style={{ marginBottom: "16px", padding: "12px", background: "#f9fafb", borderRadius: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "14px", color: "#6b7280" }}>Ukupno za plaćanje:</span>
                  <span style={{ fontSize: "20px", fontWeight: 600, color: "#1f2937" }}>
                    {12 * selectedMonths} KM
                  </span>
                </div>
              </div>

              {/* Bank Transfer Instrukcije */}
              <div style={{ padding: "16px", background: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#1f2937", marginBottom: "12px" }}>
                  Instrukcije za bankovni transfer:
                </h4>
                <div style={{ marginBottom: "12px" }}>
                  <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>Broj računa:</p>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#1f2937", fontFamily: "monospace" }}>
                    {process.env.NEXT_PUBLIC_BANK_ACCOUNT || "XXX-XXX-XXXXXXX-XX"}
                  </p>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>Reference broj:</p>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#1f2937", fontFamily: "monospace" }}>
                    {appName && selectedMonths ? `${appName.toUpperCase().replace(/\s+/g, "-")}-${selectedMonths}` : "N/A"}
                  </p>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>Iznos:</p>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#1f2937" }}>
                    {12 * selectedMonths} KM
                  </p>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>Svrha plaćanja:</p>
                  <p style={{ fontSize: "14px", color: "#1f2937" }}>
                    Pretplata - {selectedMonths} {selectedMonths === 1 ? "mjesec" : "mjeseci"}
                  </p>
                </div>
                <div style={{ padding: "12px", background: "#fff3cd", borderRadius: "6px", border: "1px solid #ffc107" }}>
                  <p style={{ fontSize: "12px", color: "#856404", margin: 0 }}>
                    ⚠️ <strong>Važno:</strong> Nakon što izvršite transfer, pretplata će biti aktivirana u roku od 24 sata nakon provjere uplate. 
                    Reference broj je jedinstven - molimo koristite ga prilikom transfera.
                  </p>
                </div>
              </div>

              {/* Dugme "Plaćeno" */}
              <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                <button
                  onClick={async () => {
                    const user = getOfflineUser();
                    if (!user) {
                      setSubscriptionMessage("Niste prijavljeni!");
                      setTimeout(() => setSubscriptionMessage(""), 5000);
                      return;
                    }

                    try {
                      setRequestingPayment(true);
                      // Pozovi API za subscription
                      try {
                        await fetch("/api/admin/subscription", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            userId: user.userId,
                            action: "requestPayment",
                            months: selectedMonths,
                            appName,
                          }),
                        });
                      } catch (apiError) {
                        console.warn("Greška pri slanju na API:", apiError);
                      }

                      setPaymentRequested(true);
                      setSubscriptionMessage("Uspješno ste prijavili uplatu! Admin će provjeriti uplatu u najkraćem roku.");
                      setTimeout(() => setSubscriptionMessage(""), 5000);
                    } catch (error: any) {
                      console.error("Greška pri prijavi uplate:", error);
                      setSubscriptionMessage("Greška pri prijavi uplate: " + (error.message || "Nepoznata greška"));
                      setTimeout(() => setSubscriptionMessage(""), 5000);
                    } finally {
                      setRequestingPayment(false);
                    }
                  }}
                  disabled={requestingPayment || paymentRequested || subscription?.paymentPendingVerification}
                  style={{
                    padding: "12px 24px",
                    background: paymentRequested || subscription?.paymentPendingVerification ? "#9ca3af" : "#16a34a",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: requestingPayment || paymentRequested || subscription?.paymentPendingVerification ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    fontWeight: 600,
                    width: "auto",
                    opacity: requestingPayment || paymentRequested || subscription?.paymentPendingVerification ? 0.6 : 1,
                  }}
                >
                  {requestingPayment 
                    ? "Prijavljivanje..." 
                    : paymentRequested || subscription?.paymentPendingVerification
                    ? "✓ Uplata je prijavljena - čeka provjeru"
                    : "✓ Plaćeno - Prijavi uplatu"}
                </button>
                {(paymentRequested || subscription?.paymentPendingVerification) && (
                  <p style={{ fontSize: "12px", color: "#6b7280", textAlign: "center", margin: 0 }}>
                    Vaša uplata je prijavljena i čeka provjeru od strane administratora.
                  </p>
                )}
              </div>

              {subscriptionMessage && (
                <p
                  style={{
                    fontSize: "14px",
                    color: subscriptionMessage.includes("Greška") ? "#dc2626" : "#16a34a",
                    fontWeight: 500,
                    marginTop: "12px",
                  }}
                >
                  {subscriptionMessage}
                </p>
              )}
            </div>

            {/* Historija uplata */}
            {subscription.paymentHistory && subscription.paymentHistory.length > 0 && (
              <div style={{ padding: "16px", background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1f2937", marginBottom: "12px" }}>
                  Historija uplata
                </h3>
                <div style={{ ...tableWrapperStyle, maxHeight: "400px", overflowY: "auto" }} className={tableWrapperClassName}>
                  <table style={tableStyle}>
                    <thead style={{ position: "sticky", top: 0, zIndex: 10, background: "#f8fafc" }}>
                      <tr>
                        <th style={thStyle}>Datum uplate</th>
                        <th style={thStyle}>Iznos</th>
                        <th style={thStyle}>Napomena</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscription.paymentHistory
                        .map((p: any) => ({
                          ...p,
                          date: p.date ? new Date(p.date) : new Date(),
                        }))
                        .sort((a: any, b: any) => b.date.getTime() - a.date.getTime())
                        .map((payment: any, index: number) => (
                        <tr key={index}>
                          <td style={tdStyle}>{payment.date.toLocaleDateString("bs-BA")} {payment.date.toLocaleTimeString("bs-BA", { hour: "2-digit", minute: "2-digit" })}</td>
                          <td style={tdStyle}>{Number(payment.amount || 0).toFixed(2)} KM</td>
                          <td style={tdStyle}>{payment.note || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>


      {/* Stara sekcija - obrisana, spojena gore */}
      {false && role === "vlasnik" && (
        <div style={{ marginBottom: "32px", border: "2px solid #e5e7eb", borderRadius: "12px", padding: "16px", background: "#f9fafb" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#1f2937", marginBottom: "16px" }}>
            📱 Upravljanje Uređajima i Ulogama
          </h2>
          <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "20px" }}>
            Dodijelite uloge uređajima koji koriste vašu aplikaciju. Svaki uređaj automatski dobija jedinstveni ID pri prvoj prijavi.
          </p>


          {loadingDevices ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "40px" }}>
              <FaSpinner style={{ fontSize: "32px", color: "#3b82f6", animation: "spin 1s linear infinite" }} />
            </div>
          ) : devices.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
              <FaMobile style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.5 }} />
              <p style={{ fontSize: "16px" }}>Nema uređaja u bazi podataka.</p>
              <p style={{ fontSize: "14px", marginTop: "8px" }}>Uređaji će se automatski pojaviti kada se korisnici prijave.</p>
            </div>
          ) : (
            <div style={tableWrapperStyle} className={tableWrapperClassName}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Uređaj</th>
                    <th style={thStyle}>Browser / OS</th>
                    <th style={thStyle}>Uloga</th>
                    <th style={thStyle}>Posljednja prijava</th>
                    <th style={thStyle}>Akcije</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((device) => {
                    const roleColors: Record<string, { bg: string; color: string }> = {
                      vlasnik: { bg: "#dbeafe", color: "#2563eb" },
                      konobar: { bg: "#dcfce7", color: "#16a34a" },
                    };

                    const roleColor = device.role ? roleColors[device.role] || { bg: "#fee2e2", color: "#dc2626" } : { bg: "#f3f4f6", color: "#6b7280" };

                    return (
                      <tr key={device.id}>
                        <td style={tdStyle}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            {device.deviceInfo?.os === "Android" || device.deviceInfo?.os === "iOS" ? (
                              <FaMobile style={{ fontSize: "16px", color: "#6b7280" }} />
                            ) : (
                              <FaDesktop style={{ fontSize: "16px", color: "#6b7280" }} />
                            )}
                            <span>{device.deviceInfo?.screenSize || "N/A"}</span>
                          </div>
                        </td>
                        <td style={tdStyle}>
                          {device.deviceInfo?.browser || "N/A"} / {device.deviceInfo?.os || "N/A"}
                        </td>
                        <td style={tdStyle}>
                          <span
                            style={{
                              padding: "4px 12px",
                              borderRadius: "12px",
                              fontSize: "12px",
                              fontWeight: 600,
                              backgroundColor: roleColor.bg,
                              color: roleColor.color,
                            }}
                          >
                            {device.role || "Nedodijeljena"}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          {device.lastLogin
                            ? device.lastLogin.toLocaleDateString("bs-BA") + " " + device.lastLogin.toLocaleTimeString("bs-BA", { hour: "2-digit", minute: "2-digit" })
                            : "N/A"}
                        </td>
                        <td style={tdStyle}>
                          <select
                            value={device.role || ""}
                            onChange={(e) => handleAssignRole(device.id, e.target.value as string || null)}
                            disabled={savingRole}
                            style={{
                              padding: "6px 12px",
                              border: "1px solid #e5e7eb",
                              borderRadius: "6px",
                              fontSize: "14px",
                              backgroundColor: "#fff",
                              color: "#1f2937",
                              cursor: savingRole ? "not-allowed" : "pointer",
                            }}
                          >
                            <option value="">Nedodijeljena</option>
                            <option value="vlasnik">Vlasnik</option>
                            <option value="konobar">Konobar</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop: "16px", padding: "12px", background: "#e0f2fe", borderRadius: "8px", border: "1px solid #0ea5e9" }}>
            <p style={{ fontSize: "12px", color: "#0c4a6e", margin: 0 }}>
              <strong>💡 Napomena:</strong> Vlasnik ima pristup svemu. Konobar može pristupiti samo stranicama koje su mu dozvoljene.
            </p>
          </div>
        </div>
      )}

      <div style={{ border: "2px solid #e5e7eb", borderRadius: "12px", padding: "16px", background: "#f9fafb", marginBottom: "32px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#1f2937", marginBottom: "16px" }}>
          Detalji naloga
        </h2>
        <div style={tableWrapperStyle} className={tableWrapperClassName}>
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={tdStyle}>E-mail:</td>
              <td style={tdStyle}>{email || "N/A"}</td>
            </tr>
            <tr>
              <td style={tdStyle}>Datum registracije:</td>
              <td style={tdStyle}>
                {(() => {
                  const user = getOfflineUser();
                  return user?.loggedInAt ? new Date(user.loggedInAt).toLocaleDateString("bs-BA") : "N/A";
                })()}
              </td>
            </tr>
              <tr>
                <td style={tdStyle}>Zadnja prijava:</td>
                <td style={tdStyle}>
                  {(() => {
                    const user = getOfflineUser();
                    return user?.loggedInAt ? new Date(user.loggedInAt).toLocaleString("bs-BA") : "N/A";
                  })()}
                </td>
              </tr>
          </tbody>
        </table>
        </div>

        {/* Promjena email-a */}
        <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid #e5e7eb" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1f2937", marginBottom: "12px", textAlign: "center" }}>
            📧 Promijeni e-mail adresu
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
            <button 
              style={{ 
                ...buttonStyle, 
                width: "auto",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: 500,
              }} 
              onClick={handleChangeEmail}
            >
              ✉️ Pošalji verifikacijski link
            </button>
            {emailMessage && (
              <p style={{ 
                color: emailMessage.includes("Greška") || emailMessage.includes("mora biti") ? "#dc2626" : "#15803d", 
                marginTop: "8px",
                fontSize: "14px",
                textAlign: "center",
                padding: "8px 16px",
                background: emailMessage.includes("Greška") || emailMessage.includes("mora biti") ? "#fee2e2" : "#dcfce7",
                borderRadius: "6px",
                border: `1px solid ${emailMessage.includes("Greška") || emailMessage.includes("mora biti") ? "#fca5a5" : "#86efac"}`,
                maxWidth: "500px"
              }}>
                {emailMessage.includes("Greška") || emailMessage.includes("mora biti") ? "⚠️ " : "✓ "}
                {emailMessage}
              </p>
            )}
            <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px", textAlign: "center" }}>
              Verifikacijski link će biti poslan na vaš trenutni e-mail ({email || "N/A"})
            </p>
          </div>
        </div>

        {/* Promjena šifre */}
        <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid #e5e7eb" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1f2937", marginBottom: "12px", textAlign: "center" }}>
            🔒 Promijeni lozinku
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
            <button 
              style={{ 
                ...buttonStyle, 
                width: "auto",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: 500,
              }} 
              onClick={handleChangePassword}
            >
              ✉️ Pošalji link za promjenu lozinke
            </button>
            {message && message.includes("lozinke") && (
              <p style={{ 
                color: message.includes("Greška") ? "#dc2626" : "#15803d", 
                marginTop: "8px",
                fontSize: "14px",
                textAlign: "center",
                padding: "8px 16px",
                background: message.includes("Greška") ? "#fee2e2" : "#dcfce7",
                borderRadius: "6px",
                border: `1px solid ${message.includes("Greška") ? "#fca5a5" : "#86efac"}`,
                maxWidth: "500px"
              }}>
                {message.includes("Greška") ? "⚠️ " : "✓ "}
                {message}
              </p>
            )}
            <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px", textAlign: "center" }}>
              Link za promjenu lozinke će biti poslan na vaš e-mail ({email || "N/A"})
            </p>
          </div>
        </div>

        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          marginTop: "32px",
          paddingTop: "24px",
          borderTop: "2px solid #e5e7eb"
        }}>
          <button
            onClick={handleLogout}
            style={{
              ...buttonStyle,
              background: "#dc2626",
              width: "auto",
              padding: "12px 28px",
              fontSize: "15px",
              fontWeight: 600,
              boxShadow: "0 2px 4px rgba(220, 38, 38, 0.2)",
              transition: "all 0.2s ease-in-out",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#b91c1c";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 4px 8px rgba(220, 38, 38, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#dc2626";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 4px rgba(220, 38, 38, 0.2)";
            }}
          >
            🚪 Odjava
          </button>
        </div>
      </div>
    </div>
  );
}
