"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { tailwindColors } from "@/lib/theme"
import { Search, User, LogOut, X, Loader2 } from "lucide-react"
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
  const router = useRouter()
  const { data: session, status } = useSession()
  const isAuthenticated = status === "authenticated"
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

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
            <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <PopoverTrigger asChild>
                <button className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-500 border rounded-lg hover:border-gray-300 focus:outline-none">
                  <Search className="w-4 h-4" />
                  <span>Search colleges...</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[600px] p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Search colleges..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList>
                    {isSearching ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                      </div>
                    ) : searchResults.length === 0 ? (
                      <CommandEmpty>No colleges found.</CommandEmpty>
                    ) : (
                      <>
                        <div className="px-2 py-1 text-xs text-gray-500">
                          Found {searchResults.length} colleges
                        </div>
                        <CommandGroup>
                          {Array.isArray(searchResults) && searchResults.map((college, index) => {
                            console.log(`Rendering college ${index}:`, college);
                            return (
                              <CommandItem
                                key={college.id || `college-${index}`}
                                onSelect={() => handleSelectCollege(college)}
                                className="flex items-center py-3 cursor-pointer"
                                value={college.name}
                              >
                                <div className="w-full">
                                  <div className="font-medium">{college.name || "Unknown College"}</div>
                                  <div className="text-sm text-gray-500 flex flex-wrap gap-x-4 mt-1">
                                    <span>{college.state || ""}</span>
                                    <span>{college.type || ""}</span>
                                  </div>
                                  <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-gray-600">
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