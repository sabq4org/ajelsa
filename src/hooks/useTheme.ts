"use client";
import { useEffect, useState } from "react";

export function useTheme() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ajel-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (saved === "dark" || (!saved && prefersDark)) {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  function toggle() {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("ajel-theme", isDark ? "dark" : "light");
    setDark(isDark);
  }

  return { dark, toggle };
}
