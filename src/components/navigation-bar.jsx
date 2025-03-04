"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { tailwindColors } from "@/lib/theme"
import { Search, User, LogOut } from "lucide-react"
// import { Logo } from "@/components/icons/Logo"
// Import the ImageLogo component to use the PNG logo
import { ImageLogo } from "@/components/icons/ImageLogo"
import { useSession, signOut } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navItems = [
  {
    name: "College Search",
    href: "/",
  },
  {
    name: "Admissions Timeline",
    href: "/timeline",
  },
  {
    name: "Essay Review",
    href: "/essay-review",
  },
  {
    name: "Counselor Connect",
    href: "/counselor",
  },
]

export default function NavigationBar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const isAuthenticated = status === "authenticated"

  return (
    <div className="border-b border-[#BED8D4] bg-[#F7F9F9] shadow-sm">
      <div className="flex h-16 items-center px-4 max-w-7xl mx-auto">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center">
            <div className="mr-2 flex items-center justify-center">
              <ImageLogo size={30} />
            </div>
            <span className="text-xl font-bold text-[#2081C3]">UniAI</span>
          </Link>
        </div>
        <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant={pathname === item.href ? "default" : "ghost"}
              className={pathname === item.href 
                ? "bg-[#2081C3] hover:bg-[#2081C3]/90" 
                : "hover:bg-[#BED8D4] hover:text-[#2081C3]"}
              asChild
            >
              <Link
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "text-white"
                    : "text-[#2081C3]"
                )}
              >
                {item.name}
              </Link>
            </Button>
          ))}
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <div className="relative hidden md:block">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-[#2081C3]/60" />
            </div>
            <input 
              type="text" 
              placeholder="Search College by Name" 
              className="py-2 pl-10 pr-4 rounded-lg text-sm border border-[#BED8D4]/50 bg-white/50 text-[#2081C3] placeholder-[#2081C3]/60 focus:outline-none focus:ring-1 focus:ring-[#63D2FF] focus:border-[#63D2FF] w-56 transition-all"
            />
          </div>
          
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="border-[#78D5D7] text-[#2081C3] hover:bg-[#78D5D7] hover:text-white"
                >
                  <User className="h-4 w-4 mr-2" />
                  {session?.user?.name?.split(' ')[0] || 'Account'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600 cursor-pointer"
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
              className="border-[#78D5D7] text-[#2081C3] hover:bg-[#78D5D7] hover:text-white"
              asChild
            >
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
} 