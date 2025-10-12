"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth, signOut } from "../../lib/firebase";
import { FaTachometerAlt, FaCalculator, FaArchive, FaTags, FaDollarSign, FaSignOutAlt, FaUser } from "react-icons/fa";
import { useAppName } from "../context/AppNameContext";

const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { appName } = useAppName();

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

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
    { href: "/obracun", label: "Obračun", icon: <FaCalculator /> },
    { href: "/arhiva", label: "Arhiva", icon: <FaArchive /> },
    { href: "/cjenovnik", label: "Cjenovnik", icon: <FaTags /> },
    { href: "/profit", label: "Profit", icon: <FaDollarSign /> },
  ];

  return (
    <aside
      style={{
        width: isOpen ? "220px" : "60px",
        backgroundColor: "#1E1E2F",
        color: "#fff",
        padding: "20px 0",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: isOpen ? "flex-start" : "center",
        boxShadow: "2px 0 8px rgba(0,0,0,0.15)",
        transition: "width 0.3s ease, padding 0.3s ease",
        position: "fixed" as "fixed",
        height: "100vh",
        top: 0,
        left: 0,
        overflowY: "auto",
      }}
    >
      <div>
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            cursor: "pointer",
            marginBottom: "30px",
            padding: "6px 10px",
            borderRadius: "4px",
            backgroundColor: "#2A2A3F",
            textAlign: "center",
            fontWeight: 600,
            fontSize: "16px",
            color: "#fff",
            userSelect: "none",
          }}
        >
          {isOpen ? "<" : ">"}
        </div>
        {isOpen && (
          <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "30px", paddingLeft: "10px" }}>
            {appName}
          </h2>
        )}
        <nav style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 15px",
                  borderRadius: "8px",
                  background: isActive ? "#3b82f6" : "transparent",
                  color: "#fff",
                  textDecoration: "none",
                  fontWeight: 500,
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                className="sidebar-link"
              >
                {link.icon}
                {isOpen && <span style={{ paddingLeft: "10px" }}>{link.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
      <div style={{ paddingBottom: "20px", width: "100%" }}>
        <Link
          href="/profile"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "10px 15px",
            borderRadius: "8px",
            background: pathname === "/profile" ? "#3b82f6" : "transparent",
            color: "#fff",
            textDecoration: "none",
            fontWeight: 500,
            transition: "all 0.2s ease",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            width: "100%",
            textAlign: isOpen ? "left" : "center",
            marginBottom: "12px",
          }}
          className="sidebar-link"
        >
          <FaUser />
          {isOpen && <span style={{ paddingLeft: "10px" }}>Profil</span>}
        </Link>
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "10px 15px",
            borderRadius: "8px",
            background: "transparent",
            color: "#fff",
            textDecoration: "none",
            fontWeight: 500,
            transition: "all 0.2s ease",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            border: "none",
            cursor: "pointer",
            width: "100%",
            textAlign: isOpen ? "left" : "center",
          }}
          className="sidebar-link"
        >
          <FaSignOutAlt />
          {isOpen && <span style={{ paddingLeft: "10px" }}>Odjava</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
