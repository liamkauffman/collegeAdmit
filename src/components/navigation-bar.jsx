"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { tailwindColors } from "@/lib/theme"
import { User, LogOut, Menu, Settings } from "lucide-react"
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
]

export default function NavigationBar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const isAuthenticated = status === "authenticated"

  return (
    <div className="border-b border-[#BED8D4] dark:border-gray-700 bg-[#F7F9F9] dark:bg-gray-900 shadow-sm">
      <div className="flex h-16 items-center px-4 max-w-7xl mx-auto">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center">
            <div className="mr-2 flex items-center justify-center">
              <SvgLogo />
            </div>
            <span className="text-xl font-bold text-[#4068ec] dark:text-[#63D2FF]">CollegeAdmit.AI</span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 mx-6">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant={pathname === item.href ? "default" : "ghost"}
              className={pathname === item.href 
                ? "bg-[#4068ec] hover:bg-[#4068ec]/90 dark:bg-[#63D2FF] dark:hover:bg-[#63D2FF]/90" 
                : "hover:bg-[#BED8D4] hover:text-[#4068ec] dark:hover:bg-gray-800 dark:hover:text-[#63D2FF]"}
              asChild
            >
              <Link
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "text-white"
                    : "text-[#4068ec] dark:text-[#63D2FF]"
                )}
              >
                {item.name}
              </Link>
            </Button>
          ))}
        </nav>
        
        {/* Mobile Menu Trigger */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="md:hidden mr-2">
              <Menu className="h-6 w-6 text-[#4068ec] dark:text-[#63D2FF]" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-white dark:bg-gray-900 border-r border-[#BED8D4] dark:border-gray-700">
            <div className="flex flex-col h-full">
              <div className="mb-8 mt-2 flex items-center">
                <SvgLogo  />
                <span className="ml-2 text-lg font-bold text-[#4068ec] dark:text-[#63D2FF]">CollegeAdmit.AI</span>
              </div>
              
              {/* Mobile Navigation */}
              <div className="flex-1">
                <div className="space-y-2">
                  {navItems.map((item) => (
                    <SheetClose asChild key={item.href}>
                      <Link 
                        href={item.href}
                        className={cn(
                          "flex items-center p-2 rounded-md text-gray-700 dark:text-gray-300",
                          pathname === item.href 
                            ? "bg-[#BED8D4]/20 dark:bg-gray-800 text-[#4068ec] dark:text-[#63D2FF]" 
                            : "hover:bg-[#BED8D4]/20 dark:hover:bg-gray-800"
                        )}
                      >
                        {item.name}
                      </Link>
                    </SheetClose>
                  ))}
                </div>
              </div>
              
              <div className="mt-auto space-y-2 pt-4 border-t border-[#BED8D4]/30 dark:border-gray-700">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <SheetClose asChild>
                      <Link 
                        href="/dashboard" 
                        className="flex items-center p-2 rounded-md hover:bg-[#BED8D4]/20 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                      >
                        Dashboard
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link 
                        href="/profile" 
                        className="flex items-center p-2 rounded-md hover:bg-[#BED8D4]/20 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                      >
                        Profile
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link 
                        href="/settings" 
                        className="flex items-center p-2 rounded-md hover:bg-[#BED8D4]/20 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                      >
                        Settings
                      </Link>
                    </SheetClose>
                    <button 
                      className="w-full flex items-center p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                      onClick={() => {
                        signOut({ callbackUrl: '/' });
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <SheetClose asChild>
                    <Link 
                      href="/auth/signin" 
                      className="flex items-center justify-center p-2 rounded-md bg-[#4068ec]/10 hover:bg-[#4068ec]/20 dark:bg-[#63D2FF]/10 dark:hover:bg-[#63D2FF]/20 text-[#4068ec] dark:text-[#63D2FF] font-medium"
                    >
                      Sign In
                    </Link>
                  </SheetClose>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        <div className="ml-auto flex items-center space-x-2 md:space-x-4">
          {/* Desktop Profile and Settings */}
          <div className="hidden md:flex items-center space-x-2">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="border-[#78D5D7] dark:border-[#63D2FF]/50 text-[#4068ec] dark:text-[#63D2FF] hover:bg-[#78D5D7] dark:hover:bg-[#63D2FF]/20 hover:text-white dark:hover:text-white"
                  >
                    <User className="h-4 w-4 mr-2" />
                    {session?.user?.name?.split(' ')[0] || 'Account'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700">
                  <DropdownMenuItem asChild className="dark:text-gray-300 dark:focus:bg-gray-700 dark:focus:text-white">
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="dark:text-gray-300 dark:focus:bg-gray-700 dark:focus:text-white">
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="dark:bg-gray-700" />
                  <DropdownMenuItem 
                    className="text-red-600 dark:text-red-400 cursor-pointer dark:focus:bg-gray-700 dark:focus:text-red-300"
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
                className="border-[#78D5D7] dark:border-[#63D2FF]/50 text-[#4068ec] dark:text-[#63D2FF] hover:bg-[#78D5D7] dark:hover:bg-[#63D2FF]/20 hover:text-white dark:hover:text-white"
                asChild
              >
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            )}
            
            {/* Settings Icon - Moved after the profile button */}
            <Button
              variant="ghost"
              size="icon"
              className="text-[#4068ec] dark:text-[#63D2FF] hover:bg-[#BED8D4] dark:hover:bg-gray-800 hover:text-[#4068ec] dark:hover:text-[#63D2FF]"
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