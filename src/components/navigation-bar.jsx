"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { tailwindColors } from "@/lib/theme"
import { User, LogOut, Menu, Settings, Search, Building2 } from "lucide-react"
import { SvgLogo } from "@/components/icons/SvgLogo"
import { useSession, signOut } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"


const navItems = [
  {
    name: "College Explore",
    href: "/",
    icon: <Search className="h-4 w-4 mr-2" />
  },
  {
    name: "Compare Colleges",
    href: "/compare",
    icon: <Building2 className="h-4 w-4 mr-2" />
  },
]

export default function NavigationBar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const isAuthenticated = status === "authenticated"

  const handleNavClick = (item) => {
    router.push(item.href)
  }

  // Function to reset search state and navigate to homepage
  const handleLogoClick = (e) => {
    e.preventDefault()
    // Clear the search state from localStorage
    localStorage.removeItem('lastSearchState')
    
    // Clear any search ID from URL
    if (typeof window !== 'undefined') {
      const url = new URL(window.location)
      if (url.searchParams.has('sid')) {
        url.searchParams.delete('sid')
        window.history.replaceState({}, '', url)
      }
    }
    
    // Navigate to homepage
    router.push('/')
  }

  return (
    <div className="border-b border-[#BED8D4] dark:border-gray-700 bg-[#F7F9F9] dark:bg-gray-900 shadow-sm">
      <div className="flex h-16 items-center px-0 max-w-full w-full">
        <div className="flex items-center pl-4 md:pl-6">
          <a href="/" onClick={handleLogoClick} className="flex items-center">
            <div className="flex items-center justify-center">
              <SvgLogo size={32} />
            </div>
            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">CollegeCompass</span>
          </a>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 ml-10 mx-6">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => handleNavClick(item)}
              className={cn(
                "text-sm font-medium transition-colors flex items-center",
                pathname === item.href
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              )}
            >
              {item.icon}
              {item.name}
            </button>
          ))}
        </nav>
        
        {/* Mobile Menu Trigger */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="md:hidden mr-2">
              <Menu className="h-6 w-6 text-gray-900 dark:text-white" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
            <div className="flex flex-col h-full">
              <div className="mb-8 mt-2 flex items-center">
                <a href="/" onClick={handleLogoClick} className="flex items-center">
                  <SvgLogo  />
                  <span className="ml-2 text-lg font-bold text-gray-900 dark:text-white">CollegeCompass</span>
                </a>
              </div>
              
              {/* Mobile Navigation */}
              <div className="flex-1">
                <div className="space-y-4">
                  {navItems.map((item) => (
                    <SheetClose asChild key={item.href}>
                      <button
                        onClick={() => handleNavClick(item)}
                        className={cn(
                          "flex items-center p-2 w-full text-left",
                          pathname === item.href 
                            ? "text-gray-900 dark:text-white font-medium" 
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        )}
                      >
                        {item.icon}
                        {item.name}
                      </button>
                    </SheetClose>
                  ))}
                </div>
              </div>
              
              <div className="mt-auto space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                {isAuthenticated ? (
                  <div className="space-y-4">
                    <SheetClose asChild>
                      <Link 
                        href="/dashboard" 
                        className="flex items-center p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      >
                        Dashboard
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link 
                        href="/profile" 
                        className="flex items-center p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      >
                        Profile
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link 
                        href="/settings" 
                        className="flex items-center p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      >
                        Settings
                      </Link>
                    </SheetClose>
                    <button 
                      className="w-full flex items-center p-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                      onClick={() => {
                        signOut({ callbackUrl: '/' });
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <>
                    <SheetClose asChild>
                      <Link 
                        href="/auth/signin" 
                        className="flex items-center justify-center p-2 text-gray-900 dark:text-white font-medium"
                      >
                        Sign In
                      </Link>
                    </SheetClose>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        <div className="ml-auto flex items-center space-x-2 md:space-x-4 pr-4 md:pr-6">
          {/* Desktop Profile and Settings */}
          <div className="hidden md:flex items-center space-x-2">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <User className="h-4 w-4 mr-2" />
                    {session?.user?.name?.split(' ')[0] || 'Account'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <DropdownMenuItem asChild className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-gray-700">
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-gray-700">
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                  <DropdownMenuItem 
                    className="text-red-600 dark:text-red-400 cursor-pointer focus:bg-red-50 dark:focus:bg-red-900/20"
                    onClick={() => signOut({ callbackUrl: '/' })}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="outline" 
                className="border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                asChild
              >
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            )}
            
            {/* Settings Icon - Moved after the profile button */}
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              asChild
            >
              <Link href="/settings">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 