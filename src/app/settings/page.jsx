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
        { 
          name: "Notifications", 
          icon: <Bell className="h-5 w-5" />, 
          href: "/settings/notifications",
          description: "Control how you receive alerts" 
        },
        { 
          name: "Privacy & Security", 
          icon: <Shield className="h-5 w-5" />, 
          href: "/settings/privacy",
          description: "Manage your data and account security" 
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
          <h1 className="text-2xl md:text-3xl font-bold text-[#2081C3] dark:text-[#63D2FF] mb-2">Settings</h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Customize your experience and manage your account</p>
        </div>
        
        {/* Appearance Settings */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 sm:p-6 mb-6 md:mb-8 backdrop-blur-sm dark:backdrop-blur-sm transition-all">
          <h2 className="text-lg md:text-xl font-semibold text-[#2081C3] dark:text-[#63D2FF] mb-4 md:mb-6">Appearance</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <button
              onClick={() => setTheme("light")}
              className={`flex items-center justify-center flex-col gap-2 md:gap-3 p-4 md:p-6 rounded-xl transition-all ${
                theme === "light" 
                  ? "bg-gradient-to-br from-blue-50 to-blue-100 shadow-md text-[#2081C3] border border-[#2081C3]/20 dark:from-blue-900/30 dark:to-blue-900/20 dark:border-[#63D2FF]/30 dark:text-[#63D2FF]" 
                  : "bg-gray-50 border border-gray-100 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-750"
              }`}
            >
              <Sun className={`h-6 w-6 md:h-7 md:w-7 ${theme === "light" ? "text-[#2081C3] dark:text-[#63D2FF]" : ""}`} />
              <span className="text-sm md:text-base">Light</span>
            </button>
            
            <button
              onClick={() => setTheme("dark")}
              className={`flex items-center justify-center flex-col gap-2 md:gap-3 p-4 md:p-6 rounded-xl transition-all ${
                theme === "dark" 
                  ? "bg-gradient-to-br from-blue-50 to-blue-100 shadow-md text-[#2081C3] border border-[#2081C3]/20 dark:from-blue-900/30 dark:to-blue-900/20 dark:border-[#63D2FF]/30 dark:text-[#63D2FF]" 
                  : "bg-gray-50 border border-gray-100 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-750"
              }`}
            >
              <Moon className={`h-6 w-6 md:h-7 md:w-7 ${theme === "dark" ? "text-[#2081C3] dark:text-[#63D2FF]" : ""}`} />
              <span className="text-sm md:text-base">Dark</span>
            </button>
            
        
          </div>
        </div>
        
        {/* Other Settings Sections */}
        {settingsSections.map((section, index) => (
          <div key={index} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 sm:p-6 mb-6 md:mb-8 backdrop-blur-sm dark:backdrop-blur-sm transition-all">
            <h2 className="text-lg md:text-xl font-semibold text-[#2081C3] dark:text-[#63D2FF] mb-4 md:mb-6">{section.title}</h2>
            
            <div className="space-y-2 md:space-y-3">
              {section.items.map((item, itemIndex) => (
                <Link 
                  key={itemIndex} 
                  href={item.href}
                  className="flex items-center justify-between p-3 md:p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors group"
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="text-[#2081C3] dark:text-[#63D2FF] p-2 rounded-full bg-[#2081C3]/5 dark:bg-[#63D2FF]/10 group-hover:bg-[#2081C3]/10 dark:group-hover:bg-[#63D2FF]/20 transition-colors">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-sm md:text-base text-gray-900 dark:text-white">{item.name}</h3>
                      <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">{item.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-[#2081C3] dark:group-hover:text-[#63D2FF] transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  )
} 