"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { tailwindColors } from "@/lib/theme"
import { Search, User, LogOut, X, Loader2, Settings, Menu } from "lucide-react"
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
import { useState, useEffect, useCallback } from "react"
import { API_URL } from "@/config"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"

const navItems = [
  {
    name: "College Search",
    href: "/",
  },
]

export default function NavigationBar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const isAuthenticated = status === "authenticated"
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Create a debounced search function with useCallback
  const debouncedSearch = useCallback(
    async (query) => {
      if (query.trim().length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      
      setIsSearching(true);
      try {
        const response = await fetch(`/api/search-colleges`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: query,
            sat_math: "",
            sat_ebrw: "",
            type: "",
            tuition_in_state: "",
            tuition_out_state: "",
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Search API error:", errorData.error);
          setSearchResults([]);
          return;
        }
        
        const data = await response.json();
        console.log("Search results:", data);
        if (!Array.isArray(data)) {
          console.error("Expected array of results but got:", typeof data);
          setSearchResults([]);
        } else {
          console.log(`Found ${data.length} colleges`);
          setSearchResults(data);
        }
      } catch (error) {
        console.error("Error searching colleges:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [] // No dependencies needed for this function
  );

  // Set up the debounce effect
  useEffect(() => {
    // Don't trigger search for very short queries
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return () => {};
    }
    
    // Set a longer timeout (500ms) to ensure user has finished typing
    const debounceTimeout = setTimeout(() => {
      debouncedSearch(searchQuery);
    }, 500);
    
    // Clear the timeout if the component unmounts or searchQuery changes
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, debouncedSearch]);

  const handleSelectCollege = (college) => {
    setIsSearchOpen(false)
    router.push(`/college/${college.id}`)
  }

  return (
    <div className="border-b border-[#BED8D4] dark:border-gray-700 bg-[#F7F9F9] dark:bg-gray-900 shadow-sm">
      <div className="flex h-16 items-center px-4 max-w-7xl mx-auto">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center">
            <div className="mr-2 flex items-center justify-center">
              <ImageLogo size={30} />
            </div>
            <span className="text-xl font-bold text-[#2081C3] dark:text-[#63D2FF]">CollegeAdmit.AI</span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 mx-6">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant={pathname === item.href ? "default" : "ghost"}
              className={pathname === item.href 
                ? "bg-[#2081C3] hover:bg-[#2081C3]/90 dark:bg-[#63D2FF] dark:hover:bg-[#63D2FF]/90" 
                : "hover:bg-[#BED8D4] hover:text-[#2081C3] dark:hover:bg-gray-800 dark:hover:text-[#63D2FF]"}
              asChild
            >
              <Link
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "text-white"
                    : "text-[#2081C3] dark:text-[#63D2FF]"
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
              <Menu className="h-6 w-6 text-[#2081C3] dark:text-[#63D2FF]" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-white dark:bg-gray-900 border-r border-[#BED8D4] dark:border-gray-700">
            <div className="flex flex-col h-full">
              <div className="mb-8 mt-2 flex items-center">
                <ImageLogo size={24} />
                <span className="ml-2 text-lg font-bold text-[#2081C3] dark:text-[#63D2FF]">CollegeAdmit.AI</span>
              </div>
              
              <div className="space-y-4">
                {navItems.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center p-2 rounded-md hover:bg-[#BED8D4]/20 dark:hover:bg-gray-800",
                        pathname === item.href
                          ? "bg-[#BED8D4]/30 dark:bg-gray-800 text-[#2081C3] dark:text-[#63D2FF] font-medium"
                          : "text-gray-700 dark:text-gray-300"
                      )}
                    >
                      {item.name}
                    </Link>
                  </SheetClose>
                ))}
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
                      className="flex items-center justify-center p-2 rounded-md bg-[#2081C3]/10 hover:bg-[#2081C3]/20 dark:bg-[#63D2FF]/10 dark:hover:bg-[#63D2FF]/20 text-[#2081C3] dark:text-[#63D2FF] font-medium"
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
          {/* Search */}
          <div className="hidden md:block relative">
            <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <PopoverTrigger asChild>
                <button className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 focus:outline-none">
                  <Search className="w-4 h-4" />
                  <span>Search colleges...</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[600px] p-0 dark:bg-gray-800 dark:border-gray-700" align="start">
                <Command className="rounded-lg dark:bg-gray-800">
                  <CommandInput
                    placeholder="Search colleges..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    className="dark:text-white"
                  />
                  <CommandList className="dark:bg-gray-800">
                    {isSearching ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                      </div>
                    ) : searchResults.length === 0 ? (
                      <CommandEmpty className="dark:text-gray-400">No colleges found.</CommandEmpty>
                    ) : (
                      <>
                        <div className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                          Found {searchResults.length} colleges
                        </div>
                        <CommandGroup className="dark:bg-gray-800">
                          {Array.isArray(searchResults) && searchResults.map((college, index) => {
                            console.log(`Rendering college ${index}:`, college);
                            return (
                              <CommandItem
                                key={college.id || `college-${index}`}
                                onSelect={() => handleSelectCollege(college)}
                                className="flex items-center py-3 cursor-pointer dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                                value={college.name}
                              >
                                <div className="w-full">
                                  <div className="font-medium dark:text-white">{college.name || "Unknown College"}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-4 mt-1">
                                    <span>{college.state || ""}</span>
                                    <span>{college.type || ""}</span>
                                  </div>
                                  <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-gray-600 dark:text-gray-300">
                                    {college.acceptanceRate !== undefined && (
                                      <span>
                                        <span className="font-semibold">Acceptance:</span> {(college.acceptanceRate * 100).toFixed(1)}%
                                      </span>
                                    )}
                                    {college.tuition && (
                                      <span>
                                        <span className="font-semibold">Tuition:</span> ${college.tuition.toLocaleString()}
                                      </span>
                                    )}
                                    {college.satMathAvg && (
                                      <span>
                                        <span className="font-semibold">SAT Math:</span> {college.satMathAvg}
                                      </span>
                                    )}
                                    {college.satVerbalAvg && (
                                      <span>
                                        <span className="font-semibold">SAT Verbal:</span> {college.satVerbalAvg}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Mobile Search Button */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Search className="h-5 w-5 text-[#2081C3] dark:text-[#63D2FF]" />
                <span className="sr-only">Search</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-screen max-w-[90vw] p-0 dark:bg-gray-800 dark:border-gray-700 -translate-x-[8vw]" align="center">
              <Command className="rounded-lg dark:bg-gray-800">
                <CommandInput
                  placeholder="Search colleges..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  className="dark:text-white"
                />
                <CommandList className="dark:bg-gray-800 max-h-[50vh]">
                  {isSearching ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  ) : searchResults.length === 0 ? (
                    <CommandEmpty className="dark:text-gray-400">No colleges found.</CommandEmpty>
                  ) : (
                    <>
                      <div className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                        Found {searchResults.length} colleges
                      </div>
                      <CommandGroup className="dark:bg-gray-800">
                        {Array.isArray(searchResults) && searchResults.map((college, index) => (
                          <CommandItem
                            key={college.id || `college-${index}`}
                            onSelect={() => handleSelectCollege(college)}
                            className="flex items-center py-3 cursor-pointer dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                            value={college.name}
                          >
                            <div className="w-full">
                              <div className="font-medium dark:text-white">{college.name || "Unknown College"}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-4 mt-1">
                                <span>{college.state || ""}</span>
                                <span>{college.type || ""}</span>
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          
          {/* Desktop Profile and Settings */}
          <div className="hidden md:flex items-center space-x-2">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="border-[#78D5D7] dark:border-[#63D2FF]/50 text-[#2081C3] dark:text-[#63D2FF] hover:bg-[#78D5D7] dark:hover:bg-[#63D2FF]/20 hover:text-white dark:hover:text-white"
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
                className="border-[#78D5D7] dark:border-[#63D2FF]/50 text-[#2081C3] dark:text-[#63D2FF] hover:bg-[#78D5D7] dark:hover:bg-[#63D2FF]/20 hover:text-white dark:hover:text-white"
                asChild
              >
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            )}
            
            {/* Settings Icon - Moved after the profile button */}
            <Button
              variant="ghost"
              size="icon"
              className="text-[#2081C3] dark:text-[#63D2FF] hover:bg-[#BED8D4] dark:hover:bg-gray-800 hover:text-[#2081C3] dark:hover:text-[#63D2FF]"
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