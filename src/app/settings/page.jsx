"use client"

import { useState, useEffect } from "react"
import { useTheme } from "@/components/theme-provider"
import NavigationBar from "@/components/navigation-bar"
import { Moon, Sun, Monitor, ChevronRight, Bell, Shield, User, HelpCircle } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by only rendering client-side
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const settingsSections = [
    {
      title: "Account",
      items: [
        { 
          name: "Profile", 
          icon: <User className="h-5 w-5" />, 
          href: "/profile",
          description: "Manage your personal information" 
        },
      ]
    },
    {
      title: "Support",
      items: [
        { 
          name: "Help Center", 
          icon: <HelpCircle className="h-5 w-5" />, 
          href: "/help",
          description: "Get assistance with CollegeAdmit.AI" 
        },
      ]
    }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <NavigationBar />
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-5xl mx-auto w-full">
        <div className="mb-8 md:mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Customize your experience and manage your account</p>
        </div>
        
        {/* Appearance Settings */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4 md:mb-6">Appearance</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <button
              onClick={() => setTheme("light")}
              className={`flex items-center justify-center flex-col gap-2 md:gap-3 p-4 md:p-6 rounded-xl transition-all ${
                theme === "light" 
                  ? "bg-gray-100 shadow-md text-gray-900 border border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-white" 
                  : "bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-750"
              }`}
            >
              <Sun className={`h-6 w-6 md:h-7 md:w-7 ${theme === "light" ? "text-gray-900 dark:text-white" : ""}`} />
              <span className="text-sm md:text-base">Light</span>
            </button>
            
            <button
              onClick={() => setTheme("dark")}
              className={`flex items-center justify-center flex-col gap-2 md:gap-3 p-4 md:p-6 rounded-xl transition-all ${
                theme === "dark" 
                  ? "bg-gray-100 shadow-md text-gray-900 border border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-white" 
                  : "bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-750"
              }`}
            >
              <Moon className={`h-6 w-6 md:h-7 md:w-7 ${theme === "dark" ? "text-gray-900 dark:text-white" : ""}`} />
              <span className="text-sm md:text-base">Dark</span>
            </button>
          </div>
        </div>
        
        {/* Other Settings Sections */}
        {settingsSections.map((section, index) => (
          <div key={index} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4 md:mb-6">{section.title}</h2>
            
            <div className="space-y-2 md:space-y-3">
              {section.items.map((item, itemIndex) => (
                <Link 
                  key={itemIndex} 
                  href={item.href}
                  className="flex items-center justify-between p-3 md:p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="text-gray-900 dark:text-white p-2 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-sm md:text-base text-gray-900 dark:text-white">{item.name}</h3>
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hidden sm:block">{item.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  )
} 