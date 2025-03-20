"use client"

import { createContext, useContext, useEffect, useState } from "react"

const ThemeContext = createContext({
  theme: "light",
  setTheme: () => null,
})

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light")

  useEffect(() => {
    // Check for stored preference or user's system preference
    const storedTheme = localStorage.getItem("theme")
    
    if (storedTheme === "light" || storedTheme === "dark" || storedTheme === "system") {
      setTheme(storedTheme)
    } else {
      setTheme("system")
    }
  }, [])

  useEffect(() => {
    // Apply theme to document
    const root = window.document.documentElement
    
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
    
    root.classList.remove("light", "dark")
    
    if (theme === "system") {
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
    
    // Store preference
    localStorage.setItem("theme", theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext) 