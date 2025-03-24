"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, MessageCircle, X } from "lucide-react"
import { API_URL } from "@/config"
import NavigationBar from '@/components/navigation-bar'
import { mockCollegeDetails } from '@/lib/mock-college-details'
import { motion, AnimatePresence } from "framer-motion"
import { fetchCollegeDetails } from '@/lib/api'

export default function CollegePage() {
  const params = useParams()
  const router = useRouter()
  const [college, setCollege] = useState(null)
  const [selectedMajor, setSelectedMajor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('quick-facts')
  const messagesEndRef = useRef(null)
  const sectionsRef = useRef({})
  const [scrollY, setScrollY] = useState(0)

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const chatContainer = messagesEndRef.current.closest('.scroll-area-viewport')
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight
      }
    }
  }

  useEffect(() => {
    // Fetch the college data from the API
    const collegeId = params.id;
    setLoading(true);
    
    const getCollegeDetails = async () => {
      try {
        // Check if this is a test request (via URL parameter)
        const isTestMode = new URLSearchParams(window.location.search).get('test') === 'true';
        
        const collegeData = await fetchCollegeDetails(collegeId);
        
        // Transform the API response to match expected format in UI
        const transformedData = {
          id: collegeData.id,
          name: collegeData.name,
          type: collegeData.type,
          // Default hero image if none provided
          heroImage: collegeData.heroImage || "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
          location: {
            city: collegeData.location?.city || collegeData.quality_of_life?.location?.nearest_city || "Unknown",
            state: collegeData.state || "Unknown",
            nearestCity: collegeData.quality_of_life?.location?.nearest_city
          },
          ranking: {
            usNews: collegeData.rankings?.us_news || "N/A"
          },
          size: {
            category: getSizeCategory(collegeData.size?.total_enrollment),
            students: collegeData.size?.total_enrollment || 0
          },
          // Extract major names from top_majors array of objects
          majors: collegeData.top_majors?.map(major => major.name) || [],
          academics: {
            gpaRange: { min: "N/A", max: "N/A" },
            satRange: { 
              min: collegeData.admissions?.test_scores?.sat_reading_writing?.percentile_25th || "N/A", 
              max: collegeData.admissions?.test_scores?.sat_reading_writing?.percentile_75th || "N/A"
            },
            actRange: { 
              min: collegeData.admissions?.test_scores?.act_composite?.percentile_25th || "N/A", 
              max: collegeData.admissions?.test_scores?.act_composite?.percentile_75th || "N/A"
            }
          },
          acceptance: {
            rate: formatPercentage(collegeData.acceptance_rate * 100) || "N/A",
            internationalStudents: formatPercentage(collegeData.international_student_percentage) || "N/A",
            yourChances: getAcceptanceCategory(collegeData.acceptance_rate)
          },
          qualityOfLife: {
            factors: [
              { name: "Campus Facilities", score: Math.round(collegeData.quality_of_life?.campus_facilities?.quality_rating * 10) / 10 || 0 },
              { name: "Housing", score: Math.round(collegeData.quality_of_life?.housing?.quality_rating * 10) / 10 || 0 },
              { name: "Dining", score: Math.round(collegeData.quality_of_life?.dining?.quality_rating * 10) / 10 || 0 },
              { name: "Safety", score: Math.round(collegeData.quality_of_life?.safety?.campus_safety_rating * 10) / 10 || 0 },
              { name: "Social Life", score: Math.round(collegeData.quality_of_life?.social_life?.quality_rating * 10) / 10 || 0 }
            ],
            description: `${collegeData.name} is located in a ${collegeData.quality_of_life?.location?.setting || "rural"} setting, ${collegeData.quality_of_life?.location?.distance_to_nearest_city ? `${collegeData.quality_of_life?.location?.distance_to_nearest_city} miles from ${collegeData.quality_of_life?.location?.nearest_city}` : ''}.`
          },
          costs: {
            items: [
              { 
                name: "Tuition (In-State)", 
                inState: formatCurrency(collegeData.undergraduate_tuition?.in_state || 0), 
                outOfState: formatCurrency(collegeData.undergraduate_tuition?.out_of_state || 0) 
              },
              { 
                name: "Room & Board", 
                inState: formatCurrency(collegeData.cost_of_attendance?.on_campus_housing || 0), 
                outOfState: formatCurrency(collegeData.cost_of_attendance?.on_campus_housing || 0) 
              },
              { 
                name: "Books & Supplies", 
                inState: formatCurrency(collegeData.cost_of_attendance?.books_and_supplies || 0), 
                outOfState: formatCurrency(collegeData.cost_of_attendance?.books_and_supplies || 0) 
              },
              { 
                name: "Other Expenses", 
                inState: formatCurrency(collegeData.cost_of_attendance?.on_campus_other || 0), 
                outOfState: formatCurrency(collegeData.cost_of_attendance?.on_campus_other || 0) 
              }
            ],
            total: {
              inState: formatCurrency(
                (collegeData.undergraduate_tuition?.in_state || 0) + 
                (collegeData.cost_of_attendance?.on_campus_housing || 0) + 
                (collegeData.cost_of_attendance?.books_and_supplies || 0) + 
                (collegeData.cost_of_attendance?.on_campus_other || 0)
              ),
              outOfState: formatCurrency(
                (collegeData.undergraduate_tuition?.out_of_state || 0) + 
                (collegeData.cost_of_attendance?.on_campus_housing || 0) + 
                (collegeData.cost_of_attendance?.books_and_supplies || 0) + 
                (collegeData.cost_of_attendance?.on_campus_other || 0)
              )
            },
            notes: `Financial aid may be available to eligible students. ${collegeData.tuition_plans?.includes("Tuition payment plan") ? "A tuition payment plan is available." : ""}`
          },
          recruiting: {
            employmentRate: formatPercentage(collegeData.employment_outcomes?.employment_rate) || "N/A",
            startingSalary: formatCurrency(collegeData.employment_outcomes?.average_starting_salary) || "N/A",
            salaryAfterYears: {
              years: "5",
              amount: formatCurrency(collegeData.employment_outcomes?.salary_after_5_years) || "N/A"
            },
            topIndustries: collegeData.employment_outcomes?.top_industries?.map(industry => ({
              name: industry.name,
              percentage: formatPercentage(industry.percentage)
            })) || [],
            graduateSchool: collegeData.graduate_school_outcomes ? {
              rate: formatPercentage(collegeData.graduate_school_outcomes.attendance_rate)
            } : null
          }
        };
        
        setCollege(transformedData);
      } catch (error) {
        console.error("Error fetching college details:", error);
        setError("Failed to load college details");
        
        // Fallback to mock data in development environment, but not in test mode
        if (process.env.NODE_ENV === 'development' && !isTestMode) {
          console.log("Falling back to mock data in development mode");
          const fallbackData = mockCollegeDetails[collegeId] || mockCollegeDetails.stanford;
          setCollege(fallbackData);
          setError(null);
        }
      } finally {
        setLoading(false);
      }
    };
    
    getCollegeDetails();
  }, [params.id]);

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle scroll and update active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100 // Offset for sticky header

      // Find the current section
      Object.entries(sectionsRef.current).forEach(([key, ref]) => {
        if (ref && ref.offsetTop <= scrollPosition && ref.offsetTop + ref.offsetHeight > scrollPosition) {
          setActiveSection(key)
        }
      })
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Scroll to section
  const scrollToSection = (sectionId) => {
    const section = sectionsRef.current[sectionId]
    if (section) {
      const yOffset = -80 // Account for sticky header
      const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  // Add scroll handler for parallax
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Helper functions for transforming data
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value) => {
    if (!value && value !== 0) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      maximumFractionDigits: 1,
    }).format(value / 100);
  };

  const formatNumber = (value) => {
    if (!value && value !== 0) return 'N/A';
    return new Intl.NumberFormat('en-US').format(value);
  };

  // Helper function to categorize college size
  const getSizeCategory = (size) => {
    if (!size) return "Unknown";
    if (size < 2000) return "Small";
    if (size < 10000) return "Medium";
    if (size < 20000) return "Large";
    return "Very Large";
  };

  // Helper function to categorize acceptance rate
  const getAcceptanceCategory = (rate) => {
    if (!rate) return "Unknown";
    if (rate < 0.10) return "Extreme Reach";
    if (rate < 0.30) return "Reach";
    if (rate < 0.60) return "Target";
    return "Safety";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    const userMessage = newMessage.trim()
    setNewMessage("")
    setIsSending(true)

    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])

    try {
      const response = await fetch(`${API_URL}/api/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          college_name: college?.name
        })
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('College information not found')
        }
        throw new Error('Failed to get response')
      }

      // Add initial empty assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulatedContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        accumulatedContent += chunk
        // Update with raw chunk for streaming effect
        setMessages(prev => {
          const newMessages = [...prev]
          const lastMessage = newMessages[newMessages.length - 1]
          lastMessage.content = accumulatedContent
          return newMessages
        })
      }
    } catch (err) {
      console.error('Error:', err)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: err.message === 'College information not found' 
          ? "I'm sorry, but I couldn't find information about this college."
          : "I apologize, but I encountered an error processing your request. Please try again."
      }])
    } finally {
      setIsSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#F7F9F9] to-[#BED8D4]">
        <NavigationBar />
        <main className="flex-1 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 border-4 border-[#4068ec] border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-[#4068ec] text-xl">Loading college information...</div>
          </motion.div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#F7F9F9] to-[#BED8D4]">
        <NavigationBar />
        <main className="flex-1 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-md max-w-2xl w-full p-6 m-4">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading College</h2>
            <p className="text-gray-700 mb-4">{error}</p>
            
            {/* Only show detailed debug info in test mode */}
            {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('test') === 'true' && (
              <div className="mt-4 p-4 bg-gray-100 rounded-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Debug Information</h3>
                <p className="text-sm text-gray-700 mb-2">
                  This information is shown because test mode is active.
                </p>
                <ul className="list-disc ml-5 text-sm text-gray-700">
                  <li>College ID: {params.id}</li>
                  <li>API URL: {`${API_URL}/api/colleges/${params.id}`}</li>
                  <li>Test Mode: Active</li>
                </ul>
                <div className="mt-4">
                  <Button 
                    onClick={() => router.push('/')}
                    variant="outline"
                    className="mr-2"
                  >
                    Go Home
                  </Button>
                  <Button 
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    )
  }

  if (!college) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#F7F9F9] to-[#BED8D4]">
        <NavigationBar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-[#4068ec] text-xl">College not found</div>
        </main>
      </div>
    )
  }

  const sections = [
    { id: 'quick-facts', label: 'Quick Facts' },
    { id: 'majors', label: 'Majors' },
    { id: 'acceptance', label: 'Acceptance' },
    { id: 'quality-of-life', label: 'Quality of Life' },
    { id: 'costs', label: 'Costs' },
    { id: 'recruiting', label: 'Recruiting' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#F7F9F9] to-[#BED8D4]">
      <NavigationBar />
      
      {/* Hero Section with Parallax Effect */}
      <motion.div 
        className="relative h-64 md:h-80 lg:h-96 w-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <motion.div 
          className="absolute inset-0 bg-center bg-cover"
          style={{ 
            backgroundImage: `url(${college.heroImage})`,
            backgroundPosition: 'center',
            y: scrollY * 0.5,
            scale: 1.1 + (scrollY * 0.0002)
          }}
          initial={{ y: 0 }}
        />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-20">
          <motion.h1 
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-md"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {college.name}
          </motion.h1>
          <motion.div 
            className="flex items-center mt-2 text-white/90"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{college.location.city}, {college.location.state}</span>
            {college.location.nearestCity && (
              <span className="ml-2 text-white/70 text-sm">(Near {college.location.nearestCity})</span>
            )}
          </motion.div>
        </div>
      </motion.div>
      
      {/* Sticky Navigation */}
      <div className="sticky top-0 bg-white shadow-md z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center overflow-x-auto scrollbar-hide">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeSection === section.id
                    ? 'text-[#4068ec] border-b-2 border-[#4068ec]'
                    : 'text-gray-500 hover:text-[#4068ec]'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        <div ref={el => sectionsRef.current['quick-facts'] = el} className="bg-white rounded-xl shadow-md overflow-hidden mb-8 transition-transform hover:scale-[1.01]">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-[#4068ec] mb-4">Quick Facts</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-[#F7F9F9] p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Type</h3>
                <p className="font-semibold text-gray-800">{college.type || "N/A"}</p>
              </div>
              
              <div className="bg-[#F7F9F9] p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">US News Ranking</h3>
                <p className="font-semibold text-gray-800">#{college.ranking?.usNews || "N/A"}</p>
              </div>
              
              <div className="bg-[#F7F9F9] p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Size</h3>
                <div>
                  <p className="font-semibold text-gray-800">{college.size?.category || "N/A"}</p>
                  <p className="text-sm text-gray-500">
                    {typeof college.size?.students === 'number' 
                      ? college.size.students.toLocaleString() + " students"
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div ref={el => sectionsRef.current['majors'] = el} className="bg-white rounded-xl shadow-md overflow-hidden mb-8 transition-transform hover:scale-[1.01]">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-[#4068ec] mb-4">Majors</h2>
            
            <div className="mb-4">
              <label htmlFor="major-select" className="block text-sm font-medium text-gray-700 mb-1">
                Select a Major
              </label>
              <select 
                id="major-select"
                className="w-full md:w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#63D2FF] focus:border-[#63D2FF]"
                value={selectedMajor || ""}
                onChange={(e) => setSelectedMajor(e.target.value || null)}
              >
                <option value="">All Majors</option>
                {college.majors.map((major, index) => (
                  <option key={index} value={major}>{major}</option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {college.majors.slice(0, 10).map((major, index) => (
                <span 
                  key={index} 
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-colors ${selectedMajor === major ? 'bg-[#4068ec] text-white' : 'bg-[#F7F9F9] text-gray-700 hover:bg-[#BED8D4]/50'}`}
                  onClick={() => setSelectedMajor(major === selectedMajor ? null : major)}
                >
                  {major}
                </span>
              ))}
              {college.majors.length > 10 && (
                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-[#F7F9F9] text-gray-700">
                  +{college.majors.length - 10} more
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div ref={el => sectionsRef.current['acceptance'] = el} className="bg-white rounded-xl shadow-md overflow-hidden mb-8 transition-transform hover:scale-[1.01]">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-[#4068ec] mb-4">Acceptance</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">General Acceptance</h3>
                <div className="bg-[#F7F9F9] p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-500">Acceptance Rate</span>
                    <span className="font-bold text-gray-800">{college.acceptance.rate}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-500">International Students</span>
                    <span className="font-bold text-gray-800">{college.acceptance.internationalStudents}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Your Chances</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      college.acceptance.yourChances === 'Extreme Reach' ? 'bg-red-500 text-white' :
                      college.acceptance.yourChances === 'Reach' ? 'bg-orange-500 text-white' :
                      college.acceptance.yourChances === 'Target' ? 'bg-green-500 text-white' :
                      'bg-blue-500 text-white'
                    }`}>
                      {college.acceptance.yourChances}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Academic Requirements</h3>
                <div className="bg-[#F7F9F9] p-4 rounded-lg">
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-500">GPA Range (25-75%)</span>
                      <span className="font-bold text-gray-800">{college.academics.gpaRange.min} - {college.academics.gpaRange.max}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-[#4068ec] h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-500">SAT Range (25-75%)</span>
                      <span className="font-bold text-gray-800">{college.academics.satRange.min} - {college.academics.satRange.max}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-[#4068ec] h-2 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                  </div>
                  
                  {college.academics.actRange && (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-500">ACT Range (25-75%)</span>
                        <span className="font-bold text-gray-800">{college.academics.actRange.min} - {college.academics.actRange.max}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-[#4068ec] h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {college.acceptance.byMajor && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Acceptance by Major</h3>
                  <div className="bg-[#F7F9F9] p-4 rounded-lg">
                    {Object.entries(college.acceptance.byMajor).map(([major, rate], index) => (
                      <div key={index} className="flex justify-between items-center mb-2 last:mb-0">
                        <span className="text-sm font-medium text-gray-500">{major}</span>
                        <span className="font-bold text-gray-800">{rate}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div ref={el => sectionsRef.current['quality-of-life'] = el} className="bg-white rounded-xl shadow-md overflow-hidden mb-8 transition-transform hover:scale-[1.01]">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-[#4068ec] mb-4">Quality of Life</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {college.qualityOfLife?.factors?.map((factor, index) => (
                <div key={index} className="bg-[#F7F9F9] p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">{factor.name}</h3>
                  <div className="flex items-center">
                    <span className="font-bold text-gray-800 mr-2">{factor.score || "N/A"}/10</span>
                    <div className="w-full bg-gray-200 rounded-full h-2 flex-1">
                      <div 
                        className="bg-[#4068ec] h-2 rounded-full" 
                        style={{ width: `${((factor.score || 0) / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-sm text-gray-500">
              <p>{college.qualityOfLife?.description || "No description available."}</p>
            </div>
          </div>
        </div>
        
        <div ref={el => sectionsRef.current['costs'] = el} className="bg-white rounded-xl shadow-md overflow-hidden mb-8 transition-transform hover:scale-[1.01]">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-[#4068ec] mb-4">Costs</h2>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Tuition & Fees</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-[#F7F9F9]">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        In-State
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Out-of-State
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {college.costs.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.inState}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.outOfState}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-[#F7F9F9]">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        Total
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {college.costs.total.inState}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {college.costs.total.outOfState}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              <p>{college.costs.notes}</p>
            </div>
          </div>
        </div>
        
        <div ref={el => sectionsRef.current['recruiting'] = el} className="bg-white rounded-xl shadow-md overflow-hidden mb-8 transition-transform hover:scale-[1.01]">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-[#4068ec] mb-4">Recruiting & Outcomes</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Employment</h3>
                <div className="bg-[#F7F9F9] p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-500">Employment Rate</span>
                    <span className="font-bold text-gray-800">{college.recruiting?.employmentRate || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-500">Average Starting Salary</span>
                    <span className="font-bold text-gray-800">{college.recruiting?.startingSalary || "N/A"}</span>
                  </div>
                  {college.recruiting?.salaryAfterYears && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">
                        Salary after {college.recruiting.salaryAfterYears.years || "5"} years
                      </span>
                      <span className="font-bold text-gray-800">
                        {college.recruiting.salaryAfterYears.amount || "N/A"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {Array.isArray(college.recruiting?.topIndustries) && college.recruiting.topIndustries.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Top Industries</h3>
                  <div className="bg-[#F7F9F9] p-4 rounded-lg">
                    {college.recruiting.topIndustries.map((industry, index) => (
                      <div key={index} className="mb-3 last:mb-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-500">{industry.name}</span>
                          <span className="font-bold text-gray-800">{industry.percentage}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-[#4068ec] h-2 rounded-full" 
                            style={{ 
                              width: typeof industry.percentage === 'string' 
                                ? industry.percentage
                                : '0%'
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {college.recruiting?.graduateSchool && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Graduate School</h3>
                <div className="bg-[#F7F9F9] p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Graduate School Attendance</span>
                    <span className="font-bold text-gray-800">{college.recruiting.graduateSchool.rate || "N/A"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Chat Interface */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 right-4 w-96 h-[500px] bg-white rounded-xl shadow-lg overflow-hidden z-40"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-[#4068ec]">Ask about {college.name}</h3>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <ScrollArea className="h-[400px] p-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-4 ${msg.role === 'user' ? 'text-right' : ''}`}
                >
                  <div
                    className={`inline-block px-4 py-2 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-[#4068ec] text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </ScrollArea>
            
            <form onSubmit={handleSendMessage} className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ask anything about the college..."
                  className="flex-1"
                  disabled={isSending}
                />
                <Button type="submit" disabled={isSending}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Toggle Button */}
      <motion.button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-4 right-4 w-12 h-12 bg-[#4068ec] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#4068ec]/90 transition-colors z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>
    </div>
  )
} 