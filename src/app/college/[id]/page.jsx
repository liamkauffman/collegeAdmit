"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, MessageCircle, X, Star, LightbulbIcon, Loader2, BookOpen, GraduationCap, MapPin, ExternalLink } from "lucide-react"
import { API_URL } from "@/config"
import NavigationBar from '@/components/navigation-bar'
import { mockCollegeDetails } from '@/lib/mock-college-details'
import { motion, AnimatePresence } from "framer-motion"
import { fetchCollegeDetails } from '@/lib/api'
import { useSession } from "next-auth/react"
import ReactMarkdown from 'react-markdown'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Script from "next/script"

// Simple function to format text with basic markdown
const formatMarkdown = (text) => {
  if (!text) return "";
  
  // Handle bold text: **text** -> <strong>text</strong>
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Handle italic text: *text* -> <em>text</em>
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Handle links: [text](url) -> <a href="url">text</a>
  formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>');
  
  // Handle lists: - item -> <li>item</li>
  formatted = formatted.replace(/- (.*?)(?=\n|$)/g, '<li>$1</li>');
  
  // Wrap lists in <ul>
  if (formatted.includes('<li>')) {
    formatted = '<ul class="list-disc pl-4 my-2">' + formatted + '</ul>';
  }
  
  return formatted;
}

export default function CollegePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [college, setCollege] = useState(null)
  const [selectedMajor, setSelectedMajor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(true)
  const [activeSection, setActiveSection] = useState('quick-facts')
  const messagesEndRef = useRef(null)
  const sectionsRef = useRef({})
  const [scrollY, setScrollY] = useState(0)
  const [isStarred, setIsStarred] = useState(false)
  const [academicMetrics, setAcademicMetrics] = useState({
    gpa: '',
    satScore: '',
    actScore: ''
  })
  const [collegeCoordinates, setCollegeCoordinates] = useState(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef(null)
  const mapContainerRef = useRef(null)

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
        
        // Add additional error handling and timeout to the fetch operation
        let fetchPromise = fetchCollegeDetails(collegeId);
        
        // Set a timeout for the fetch operation (30 seconds)
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timed out')), 30000)
        );
        
        // Race the fetch against the timeout
        const collegeData = await Promise.race([fetchPromise, timeoutPromise]);
        
        // Transform the API response to match expected format in UI
        const transformedData = {
          id: collegeData.id,
          name: collegeData.name,
          type: collegeData.type,
          // Default hero image if none provided
          heroImage: collegeData.heroImage || "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
          // Preserve the original location object with longitude/latitude if available
          location: collegeData.location || {
            city: collegeData.quality_of_life?.location?.nearest_city || "Unknown",
            state: collegeData.state || "Unknown",
            nearestCity: collegeData.quality_of_life?.location?.nearest_city
          },
          state: collegeData.state,
          ranking: {
            usNews: collegeData.rankings?.us_news || "N/A"
          },
          size: {
            category: getSizeCategory(collegeData.size?.total_enrollment),
            students: collegeData.size?.total_enrollment || 0
          },
          // Extract complete major data including links
          majors: collegeData.top_majors?.map(major => major.name) || [],
          top_majors: collegeData.top_majors || [],  // Add this line to store complete major objects
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
        setError(`Failed to load college details: ${error.message}`);
        
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

  // Add effect for welcome message when chat opens
  useEffect(() => {
    if (isChatOpen && messages.length === 0 && college) {
      setMessages([
        {
          role: 'assistant',
          content: `Welcome! I'm the ${college.name} AI assistant. You can ask me anything about admissions, campus life, majors, costs, or student outcomes.`,
          sources: [],
          isLoading: false
        }
      ]);
    }
  }, [isChatOpen, messages.length, college]);

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
    if (rate < 0.10) return "Reach";
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
      // Add initial empty assistant message with loading state
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '', 
        isLoading: true,
        sources: []
      }])

      // Use the local Next.js API route instead of direct backend URL
      const response = await fetch(`/api/colleges/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          college_name: college.name,
          message: userMessage
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      // Handle streaming response
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulatedContent = ''
      let sources = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        accumulatedContent += chunk
        
        // Check for sources in the response
        if (chunk.includes('Sources:')) {
          const sourcesText = chunk.split('Sources:')[1]?.trim()
          if (sourcesText) {
            sources = sourcesText.split(',').map(s => s.trim())
          }
        }
        
        // Update message with streaming content
        setMessages(prev => {
          const newMessages = [...prev]
          const lastMessage = newMessages[newMessages.length - 1]
          lastMessage.content = accumulatedContent.replace('Sources:', '').trim()
          lastMessage.sources = sources
          lastMessage.isLoading = false
          return newMessages
        })
      }
    } catch (err) {
      console.error('Error:', err)
      setMessages(prev => {
        const messages = [...prev]
        const lastMessage = messages[messages.length - 1]
        
        if (lastMessage.role === 'assistant' && lastMessage.isLoading) {
          // Update the loading message with error
          lastMessage.content = "I apologize, but I encountered an error processing your request. Please try again."
          lastMessage.isLoading = false
        } else {
          // Add a new error message
          messages.push({
        role: 'assistant', 
            content: "I apologize, but I encountered an error processing your request. Please try again.",
            isLoading: false,
            sources: []
          })
        }
        
        return messages
      })
    } finally {
      setIsSending(false)
    }
  }

  // Add useEffect to fetch favorite status
  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      if (!session || !college) return;
      
      try {
        const response = await fetch('/api/colleges');
        if (!response.ok) return;
        
        const data = await response.json();
        setIsStarred(data.favorites.includes(college.id));
      } catch (error) {
        console.error('Error fetching favorite status:', error);
      }
    };

    fetchFavoriteStatus();
  }, [session, college]);

  const handleStarClick = async () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    try {
      const response = await fetch('/api/colleges/favorite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collegeId: college.id,
          action: isStarred ? 'unfavorite' : 'favorite'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update favorite status');
      }

      setIsStarred(!isStarred);
    } catch (error) {
      console.error('Error updating favorite status:', error);
    }
  };

  // Add useEffect to handle sidebar resize
  useEffect(() => {
    const handleResize = () => {
      // Close sidebar automatically on mobile
      if (window.innerWidth < 768 && isChatOpen) {
        setIsChatOpen(false)
      }
    }
    
    window.addEventListener('resize', handleResize)
    // Set initial state based on screen size
    handleResize()
    
    return () => window.removeEventListener('resize', handleResize)
  }, [isChatOpen])

  // Add effect to fetch user's academic metrics
  useEffect(() => {
    const fetchUserMetrics = async () => {
      if (session) {
        try {
          const response = await fetch('/api/user/preferences');
          if (response.ok) {
            const data = await response.json();
            if (data.preferences) {
              setAcademicMetrics({
                gpa: data.preferences.gpa || '',
                satScore: data.preferences.testScores?.sat || '',
                actScore: data.preferences.testScores?.act || ''
              });
            }
          }
        } catch (error) {
          console.error('Error fetching user metrics:', error);
        }
      }
    };
    
    fetchUserMetrics();
  }, [session]);

  // Get college coordinates when college data loads
  useEffect(() => {
    const getCoordinates = async () => {
      if (!college) return;
      
      try {
        // Check if the API has provided location coordinates directly
        if (college.location && 
            typeof college.location.longitude === 'number' && 
            typeof college.location.latitude === 'number') {
          console.log('Using provided coordinates:', college.location);
          setCollegeCoordinates({
            lat: college.location.latitude,
            lng: college.location.longitude
          });
          return;
        }
        
        // If we don't have coordinates but have city/state, try to geocode
        const cityState = (college.location?.city || college.city) && (college.location?.state || college.state);
        if (cityState) {
          console.log('No coordinates provided, attempting to geocode from city/state');
          // Geocode from city and state
          const response = await fetch(`/api/geocode?address=${encodeURIComponent(
            `${college.name}, ${college.location?.city || college.city}, ${college.location?.state || college.state}`
          )}`);
          
          if (!response.ok) {
            console.error('Geocoding request failed');
            setCollegeCoordinates(null);
            return;
          }
          
          const data = await response.json();
          
          if (data.coordinates) {
            setCollegeCoordinates(data.coordinates);
          } else {
            console.log('No coordinates found for this college');
            setCollegeCoordinates(null);
          }
        } else {
          console.log('No location data available for this college');
          setCollegeCoordinates(null);
        }
      } catch (error) {
        console.error('Error getting coordinates:', error);
        setCollegeCoordinates(null);
      }
    };
    
    getCoordinates();
  }, [college]);

  // Google Maps initialization
  const initMap = useCallback(() => {
    if (!collegeCoordinates || !mapContainerRef.current || mapRef.current) return;
    
    // Initialize the map
    const mapOptions = {
      center: collegeCoordinates,
      zoom: 14, // Use a slightly lower zoom level for better context
      mapId: 'DEMO_MAP_ID', // Replace with your Map ID for styled maps
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true
    };
    
    const map = new google.maps.Map(mapContainerRef.current, mapOptions);
    mapRef.current = map;
    
    // Add a marker for the college
    const marker = new google.maps.Marker({
      position: collegeCoordinates,
      map: map,
      title: college.name,
      animation: google.maps.Animation.DROP
    });
    
    // Add an info window
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 10px; max-width: 200px;">
          <h3 style="margin: 0 0 10px 0; font-weight: bold;">${college.name}</h3>
          <p style="margin: 0 0 5px 0;">
            ${college.location?.city || college.city}, ${college.location?.state || college.state}
          </p>
        </div>
      `
    });
    
    // Open info window when marker is clicked
    marker.addListener('click', () => {
      infoWindow.open(map, marker);
    });
    
    setMapLoaded(true);
  }, [college, collegeCoordinates]);

  // Initialize map when Google Maps API loads
  const handleGoogleMapsLoaded = useCallback(() => {
    initMap();
  }, [initMap]);

  // College map section renderer
  const renderCollegeMap = () => {
    return (
      <div ref={el => sectionsRef.current['campus-map'] = el} className="bg-white rounded-xl shadow-md overflow-hidden mb-8 transition-transform hover:scale-[1.01]">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-[#4068ec] mb-4">Campus Map</h2>
          
          {collegeCoordinates === null ? (
            <div className="w-full h-[400px] rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
              <div className="text-center p-6">
                <MapPin className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">Map Unavailable</h3>
                <p className="text-gray-500 max-w-md">
                  We couldn't locate the exact coordinates for this campus. 
                  Please check the college's official website for campus map information.
                </p>
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Map container */}
              <div 
                ref={mapContainerRef} 
                className="w-full h-[400px] rounded-lg overflow-hidden"
                style={{ backgroundColor: '#f5f5f5' }}
              />
              
              {!mapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 rounded-lg">
                  <div className="w-10 h-10 border-4 border-[#4068ec] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              
              {/* Map controls */}
              <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
                <motion.button
                  className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (mapRef.current) {
                      mapRef.current.setMapTypeId(
                        mapRef.current.getMapTypeId() === 'satellite' 
                          ? 'roadmap' 
                          : 'satellite'
                      );
                    }
                  }}
                >
                  <ExternalLink className="w-5 h-5 text-gray-700" />
                </motion.button>
              </div>
            </div>
          )}
          
          <div className="mt-4 text-sm text-gray-500 flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
            {collegeCoordinates === null ? (
              <p>Campus location information is not available at this time.</p>
            ) : (
              <p>Explore the {college.name} campus. Zoom in and out to view buildings and landmarks.</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
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
      <div className="min-h-screen flex flex-col bg-white">
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
      <div className="min-h-screen flex flex-col bg-white">
        <NavigationBar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-[#4068ec] text-xl">College not found</div>
        </main>
      </div>
    )
  }

  const sections = [
    { id: 'quick-facts', label: 'Quick Facts' },
    { id: 'campus-map', label: 'Campus Map' },
    { id: 'majors', label: 'Majors' },
    { id: 'acceptance', label: 'Acceptance' },
    { id: 'quality-of-life', label: 'Quality of Life' },
    { id: 'costs', label: 'Costs' },
    { id: 'recruiting', label: 'Recruiting' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=Function.prototype`}
        onLoad={handleGoogleMapsLoaded}
      />
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
          <div className="flex items-center justify-between">
            <motion.h1 
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-md"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {college.name}
            </motion.h1>
            <motion.button
              onClick={handleStarClick}
              className="p-3 rounded-full bg-white/90 hover:bg-white transition-colors shadow-md"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Star
                className={`w-6 h-6 ${
                  isStarred 
                    ? 'fill-yellow-400 text-yellow-400' 
                    : 'text-gray-400 hover:text-yellow-400'
                } transition-colors`}
              />
            </motion.button>
          </div>
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
        <div className="flex flex-col md:flex-row">
          {/* Main content area */}
          <div className={`flex-1 transition-all duration-300 ${isChatOpen ? 'md:pr-4 md:w-[calc(100%-384px)]' : ''}`}>
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
        
        {/* Add the Campus Map section */}
        {renderCollegeMap()}
        
        <div ref={el => sectionsRef.current['majors'] = el} className="bg-white rounded-xl shadow-md overflow-hidden mb-8 transition-transform hover:scale-[1.01]">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-[#4068ec] mb-4">Majors</h2>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Popular Majors</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {college.top_majors?.map((major, index) => (
                  <div 
                    key={index}
                    onClick={() => setSelectedMajor(major.name === selectedMajor ? null : major.name)}
                    className={`group relative rounded-lg p-4 transition-all duration-200 cursor-pointer ${
                      selectedMajor === major.name 
                        ? 'bg-[#4068ec] text-white shadow-md' 
                        : 'bg-[#F7F9F9] hover:bg-[#EDF3F8] text-gray-800 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium truncate pr-2">{major.name}</h4>
                      {major.popularity && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          selectedMajor === major.name 
                            ? 'bg-white/20 text-white' 
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {(major.popularity * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                    
                    {major.ranking && (
                      <div className={`text-xs mb-1 ${selectedMajor === major.name ? 'text-white/90' : 'text-gray-600'}`}>
                        Ranking: #{major.ranking}
                      </div>
                    )}
                    
                    {major.admission_rate && (
                      <div className={`text-xs mb-1 ${selectedMajor === major.name ? 'text-white/90' : 'text-gray-600'}`}>
                        Admission: {(major.admission_rate * 100).toFixed(1)}%
                      </div>
                    )}
                    
                    {major.source_url && (
                      <a 
                        href={major.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className={`text-xs font-medium flex items-center mt-2 ${
                          selectedMajor === major.name 
                            ? 'text-white/90 hover:text-white' 
                            : 'text-blue-600 hover:text-blue-700'
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Learn More
                      </a>
                    )}
                    
                    <div className={`absolute bottom-0 left-0 h-1 transition-all duration-300 ${
                      selectedMajor === major.name 
                        ? 'bg-white/30 w-full'
                        : 'bg-[#4068ec]/30 group-hover:w-full w-0'
                    }`}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div ref={el => sectionsRef.current['acceptance'] = el} className="bg-white rounded-xl shadow-md overflow-hidden mb-8 transition-transform hover:scale-[1.01]">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-[#4068ec] mb-4">Acceptance Information</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Acceptance Rate</h3>
                <div className="flex items-center">
                  <div className="text-3xl font-bold text-gray-800">{college.acceptance.rate}</div>
                  <div className="ml-4 flex items-center">
                    {(() => {
                      let difficultyText = "";
                      let difficultyColor = "";
                      
                      if (college.acceptance.rate < 10) {
                        difficultyText = "Extremely Competitive";
                        difficultyColor = "bg-red-600";
                      } else if (college.acceptance.rate < 20) {
                        difficultyText = "Highly Competitive";
                        difficultyColor = "bg-orange-500";
                      } else if (college.acceptance.rate < 35) {
                        difficultyText = "Very Competitive";
                        difficultyColor = "bg-yellow-500";
                      } else if (college.acceptance.rate < 50) {
                        difficultyText = "Competitive";
                        difficultyColor = "bg-blue-500";
                      } else if (college.acceptance.rate < 70) {
                        difficultyText = "Moderately Competitive";
                        difficultyColor = "bg-green-500";
                      } else {
                        difficultyText = "Less Competitive";
                        difficultyColor = "bg-green-600";
                      }
                      
                      return (
                        <span className={`${difficultyColor} text-white text-xs px-2 py-1 rounded-full`}>
                          {difficultyText}
                        </span>
                      );
                    })()}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  This is the percentage of applicants who are offered admission.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">International Students</h3>
                <div className="flex items-center">
                  <div className="text-3xl font-bold text-gray-800">{college.acceptance.internationalStudents}</div>
                  <div className="ml-4 flex items-center">
                    <span className="text-sm text-gray-600">
                      {college.acceptance.internationalStudents === "N/A" ? "Not Available" : ""}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  This is the percentage of international students.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">General Acceptance</h3>
                <div className="bg-[#F7F9F9] p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-500">Your Chances</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      college.acceptance.yourChances === 'Reach' ? 'bg-red-500 text-white' :
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
                  {/* SAT Score Range */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>SAT Score Range</span>
                      <span>{college.academics.satRange.min} - {college.academics.satRange.max}</span>
                    </div>
                    <div className="relative h-2">
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-full bg-blue-500 rounded-full absolute" 
                          style={{ 
                            width: `${
                              college.academics.satRange.min !== "N/A" && college.academics.satRange.max !== "N/A" 
                                ? ((parseInt(college.academics.satRange.max) - parseInt(college.academics.satRange.min)) / 1600) * 100
                                : 0
                            }%`,
                            left: `${
                              college.academics.satRange.min !== "N/A" 
                                ? (parseInt(college.academics.satRange.min) / 1600) * 100 
                                : 0
                            }%`
                          }}
                        />
                      </div>
                      
                      {/* User's SAT score marker */}
                      {academicMetrics?.satScore && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div 
                                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-yellow-400 border-2 border-white rounded-full shadow-md transform -translate-x-1/2 transition-all hover:scale-110 cursor-pointer"
                                style={{ 
                                  left: `${(parseInt(academicMetrics.satScore) / 1600) * 100}%` 
                                }}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs font-medium">This is you: {academicMetrics.satScore}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>

                  {/* ACT Score Range */}
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>ACT Score Range</span>
                      <span>{college.academics.actRange.min} - {college.academics.actRange.max}</span>
                    </div>
                    <div className="relative h-2">
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-full bg-blue-500 rounded-full absolute" 
                          style={{ 
                            width: `${
                              college.academics.actRange.min !== "N/A" && college.academics.actRange.max !== "N/A" 
                                ? ((parseInt(college.academics.actRange.max) - parseInt(college.academics.actRange.min)) / 36) * 100
                                : 0
                            }%`,
                            left: `${
                              college.academics.actRange.min !== "N/A" 
                                ? (parseInt(college.academics.actRange.min) / 36) * 100 
                                : 0
                            }%`
                          }}
                        />
                      </div>
                      
                      {/* User's ACT score marker */}
                      {academicMetrics?.actScore && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div 
                                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-yellow-400 border-2 border-white rounded-full shadow-md transform -translate-x-1/2 transition-all hover:scale-110 cursor-pointer"
                                style={{ 
                                  left: `${(parseInt(academicMetrics.actScore) / 36) * 100}%` 
                                }}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs font-medium">This is you: {academicMetrics.actScore}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>
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
          </div>

          {/* Chat Sidebar */}
          <div className="hidden md:block">
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 384 }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="bg-white rounded-l-xl shadow-xl h-[calc(100vh-180px)] sticky top-[100px] overflow-hidden border-l border-t border-b border-gray-200"
                >
                  <div className="flex items-center justify-between p-4 border-b bg-white text-gray-900">
                    <motion.h3 
                      className="font-semibold flex items-center"
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.3 }}
                      >
                        <MessageCircle className="w-4 h-4 mr-2 text-gray-500" />
                      </motion.div>
                      Chat with {college.name}
                    </motion.h3>
                    <motion.button
                      onClick={() => setIsChatOpen(false)}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      whileHover={{ rotate: 90 }}
                      transition={{ type: "spring", stiffness: 300, damping: 10 }}
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </motion.button>
                  </div>
                  
                  <div className="flex flex-col h-[calc(100%-64px)]">
                    <ScrollArea className="flex-1 px-4 py-2">
                      {messages.length === 0 ? (
                        <motion.div 
                          className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4, duration: 0.6 }}
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ 
                              type: "spring", 
                              stiffness: 260, 
                              damping: 20, 
                              delay: 0.5 
                            }}
                          >
                            <MessageCircle className="w-12 h-12 mb-4 text-gray-300" />
                          </motion.div>
                          <motion.p 
                            className="text-sm mb-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                          >
                            Ask anything about {college.name}!
                          </motion.p>
                          <motion.p 
                            className="text-xs"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                          >
                            Try asking about admissions, campus life, majors, costs, or student outcomes.
                          </motion.p>
                        </motion.div>
                      ) : (
                        <div className="pt-2">
                          {messages.map((msg, index) => (
                            <motion.div
                              key={index}
                              className={`mb-4 ${msg.role === 'user' ? 'text-right' : ''}`}
                              initial={{ 
                                opacity: 0, 
                                x: msg.role === 'user' ? 20 : -20,
                                scale: 0.95 
                              }}
                              animate={{ 
                                opacity: 1, 
                                x: 0,
                                scale: 1 
                              }}
                              transition={{ 
                                type: "spring", 
                                damping: 25, 
                                stiffness: 300,
                                delay: Math.min(0.1 * index, 0.5) 
                              }}
                            >
                              <div
                                className={`inline-block px-4 py-3 rounded-xl shadow-sm ${
                                  msg.role === 'user'
                                    ? 'bg-gray-900 text-white rounded-tr-none'
                                    : 'bg-gray-50 text-gray-800 rounded-tl-none border border-gray-200'
                                } max-w-[85%]`}
                              >
                                {msg.isLoading ? (
                                  <div className="flex items-center space-x-2">
                                    <motion.div 
                                      className="w-2 h-2 rounded-full bg-gray-300"
                                      animate={{ 
                                        scale: [1, 1.2, 1],
                                        opacity: [0.5, 1, 0.5]
                                      }}
                                      transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                      }}
                                    />
                                    <motion.div 
                                      className="w-2 h-2 rounded-full bg-gray-300"
                                      animate={{ 
                                        scale: [1, 1.2, 1],
                                        opacity: [0.5, 1, 0.5]
                                      }}
                                      transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: 0.2
                                      }}
                                    />
                                    <motion.div 
                                      className="w-2 h-2 rounded-full bg-gray-300"
                                      animate={{ 
                                        scale: [1, 1.2, 1],
                                        opacity: [0.5, 1, 0.5]
                                      }}
                                      transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: 0.4
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div>
                                    <ReactMarkdown 
                                      className={`whitespace-pre-wrap text-sm prose prose-sm max-w-none ${
                                        msg.role === 'user' 
                                          ? 'prose-invert text-white prose-headings:text-white prose-p:text-white prose-strong:text-white' 
                                          : 'prose-blue'
                                      }`}
                                      components={{
                                        strong: ({node, ...props}) => <span className={`font-bold ${msg.role === 'user' ? 'text-white' : ''}`} {...props} />,
                                        a: ({node, ...props}) => <a className={`${msg.role === 'user' ? 'text-blue-300' : 'text-blue-600'} hover:underline`} {...props} />,
                                        ul: ({node, ...props}) => <ul className="list-disc pl-4 my-2" {...props} />,
                                        ol: ({node, ...props}) => <ol className="list-decimal pl-4 my-2" {...props} />,
                                        li: ({node, ...props}) => <li className="mb-1" {...props} />,
                                        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                        h1: ({node, ...props}) => <h1 className="text-xl font-bold my-3" {...props} />,
                                        h2: ({node, ...props}) => <h2 className="text-lg font-bold my-2" {...props} />,
                                        h3: ({node, ...props}) => <h3 className="text-base font-bold my-2" {...props} />,
                                        code: ({node, ...props}) => <code className={`px-1 py-0.5 rounded text-sm font-mono ${msg.role === 'user' ? 'bg-gray-700' : 'bg-gray-100'}`} {...props} />
                                      }}
                                    >
                                      {msg.content}
                                    </ReactMarkdown>
                                    
                                    {/* Source attribution */}
                                    {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                                      <motion.div 
                                        className="mt-2 pt-2 border-t border-gray-200"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        transition={{ delay: 0.3 }}
                                      >
                                        <p className="text-xs text-gray-500 font-medium">Sources:</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {msg.sources.map((source, i) => (
                                            <motion.span 
                                              key={i} 
                                              className="inline-block px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-600"
                                              initial={{ opacity: 0, scale: 0.8 }}
                                              animate={{ opacity: 1, scale: 1 }}
                                              transition={{ delay: 0.3 + (i * 0.1) }}
                                              whileHover={{ 
                                                scale: 1.05,
                                                backgroundColor: "#f3f4f6"
                                              }}
                                            >
                                              {source}
                                            </motion.span>
                                          ))}
                                        </div>
                                      </motion.div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </ScrollArea>
                    
                    <motion.form 
                      onSubmit={handleSendMessage} 
                      className="p-4 border-t bg-white"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                    >
                      {messages.length === 1 && messages[0].role === 'assistant' && !messages[0].isLoading && (
                        <motion.div 
                          className="mb-3"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5, duration: 0.3 }}
                        >
                          <p className="text-xs text-gray-500 mb-2">Try asking:</p>
                          <div className="flex flex-wrap gap-2">
                            {[
                              "What are the admission requirements?",
                              `What majors is ${college.name} known for?`,
                              "What is campus life like?",
                              "What is the cost of attendance?",
                              "What is the acceptance rate?"
                            ].map((question, i) => (
                              <motion.button
                                key={i}
                                type="button"
                                className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 py-1 px-2 rounded-md border border-gray-200 transition-colors"
                                onClick={() => {
                                  setNewMessage(question);
                                  // Use setTimeout to allow state update before submitting
                                  setTimeout(() => {
                                    // Create and dispatch a submit event on the form
                                    const form = document.querySelector('form');
                                    if (form) {
                                      const submitEvent = new Event('submit', { cancelable: true, bubbles: true });
                                      form.dispatchEvent(submitEvent);
                                    }
                                  }, 10);
                                }}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6 + (i * 0.1) }}
                                whileHover={{ 
                                  scale: 1.05,
                                  backgroundColor: "#f3f4f6"
                                }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {question}
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                      <div className="flex gap-2" style={{ marginBottom: '20px' }}>
                        <motion.input 
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Ask anything about the college..."
                          className="w-full py-5 px-5 text-base rounded-xl border border-gray-300 bg-white/80 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all shadow-sm h-14 leading-normal"
                          disabled={isSending}
                          whileFocus={{ scale: 1.01, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        />
                        <motion.button 
                          type="submit" 
                          disabled={isSending || !newMessage.trim()}
                          className="bg-gray-900 hover:bg-gray-800 text-white p-3 rounded-xl shadow-sm flex items-center justify-center"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          animate={isSending ? { rotate: 360 } : {}}
                          transition={{ 
                            type: "spring", 
                            stiffness: 500, 
                            damping: 15
                          }}
                        >
                          {isSending ? (
                            <motion.div 
                              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ 
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear"
                              }}
                            />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </motion.button>
                      </div>
                    </motion.form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Mobile Chat UI */}
          <AnimatePresence>
            {isChatOpen && (
              <motion.div
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed inset-0 z-50 md:hidden bg-white"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-4 border-b bg-white text-gray-900">
                    <motion.h3 
                      className="font-semibold flex items-center"
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.3 }}
                      >
                        <MessageCircle className="w-4 h-4 mr-2 text-gray-500" />
                      </motion.div>
                      Chat with {college.name}
                    </motion.h3>
                    <motion.button
                onClick={() => setIsChatOpen(false)}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      whileHover={{ rotate: 90 }}
                      transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <X className="w-5 h-5 text-gray-500" />
                    </motion.button>
            </div>
            
                  <ScrollArea className="flex-1 px-4 py-2">
                    {messages.length === 0 ? (
                      <motion.div 
                        className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ 
                            type: "spring", 
                            stiffness: 260, 
                            damping: 20, 
                            delay: 0.5 
                          }}
                        >
                          <MessageCircle className="w-12 h-12 mb-4 text-gray-300" />
                        </motion.div>
                        <motion.p 
                          className="text-sm mb-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.7 }}
                        >
                          Ask anything about {college.name}!
                        </motion.p>
                        <motion.p 
                          className="text-xs"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.8 }}
                        >
                          Try asking about admissions, campus life, majors, costs, or student outcomes.
                        </motion.p>
                      </motion.div>
                    ) : (
                      <div className="pt-2">
              {messages.map((msg, index) => (
                          <motion.div
                  key={index}
                  className={`mb-4 ${msg.role === 'user' ? 'text-right' : ''}`}
                            initial={{ 
                              opacity: 0, 
                              x: msg.role === 'user' ? 20 : -20,
                              scale: 0.95 
                            }}
                            animate={{ 
                              opacity: 1, 
                              x: 0,
                              scale: 1 
                            }}
                            transition={{ 
                              type: "spring", 
                              damping: 25, 
                              stiffness: 300,
                              delay: Math.min(0.1 * index, 0.5) 
                            }}
                >
                  <div
                              className={`inline-block px-4 py-3 rounded-xl shadow-sm ${
                      msg.role === 'user'
                                  ? 'bg-gray-900 text-white rounded-tr-none'
                                  : 'bg-gray-50 text-gray-800 rounded-tl-none border border-gray-200'
                              } max-w-[85%]`}
                            >
                              {msg.isLoading ? (
                                <div className="flex items-center space-x-2">
                                  <motion.div 
                                    className="w-2 h-2 rounded-full bg-gray-300"
                                    animate={{ 
                                      scale: [1, 1.2, 1],
                                      opacity: [0.5, 1, 0.5]
                                    }}
                                    transition={{
                                      duration: 1.5,
                                      repeat: Infinity,
                                      ease: "easeInOut"
                                    }}
                                  />
                                  <motion.div 
                                    className="w-2 h-2 rounded-full bg-gray-300"
                                    animate={{ 
                                      scale: [1, 1.2, 1],
                                      opacity: [0.5, 1, 0.5]
                                    }}
                                    transition={{
                                      duration: 1.5,
                                      repeat: Infinity,
                                      ease: "easeInOut",
                                      delay: 0.2
                                    }}
                                  />
                                  <motion.div 
                                    className="w-2 h-2 rounded-full bg-gray-300"
                                    animate={{ 
                                      scale: [1, 1.2, 1],
                                      opacity: [0.5, 1, 0.5]
                                    }}
                                    transition={{
                                      duration: 1.5,
                                      repeat: Infinity,
                                      ease: "easeInOut",
                                      delay: 0.4
                                    }}
                                  />
                  </div>
                              ) : (
                                <div>
                                  <ReactMarkdown 
                                    className={`whitespace-pre-wrap text-sm prose prose-sm max-w-none ${
                                      msg.role === 'user' 
                                        ? 'prose-invert text-white prose-headings:text-white prose-p:text-white prose-strong:text-white' 
                                        : 'prose-blue'
                                    }`}
                                    components={{
                                      strong: ({node, ...props}) => <span className={`font-bold ${msg.role === 'user' ? 'text-white' : ''}`} {...props} />,
                                      a: ({node, ...props}) => <a className={`${msg.role === 'user' ? 'text-blue-300' : 'text-blue-600'} hover:underline`} {...props} />,
                                      ul: ({node, ...props}) => <ul className="list-disc pl-4 my-2" {...props} />,
                                      ol: ({node, ...props}) => <ol className="list-decimal pl-4 my-2" {...props} />,
                                      li: ({node, ...props}) => <li className="mb-1" {...props} />,
                                      p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                      h1: ({node, ...props}) => <h1 className="text-xl font-bold my-3" {...props} />,
                                      h2: ({node, ...props}) => <h2 className="text-lg font-bold my-2" {...props} />,
                                      h3: ({node, ...props}) => <h3 className="text-base font-bold my-2" {...props} />,
                                      code: ({node, ...props}) => <code className={`px-1 py-0.5 rounded text-sm font-mono ${msg.role === 'user' ? 'bg-gray-700' : 'bg-gray-100'}`} {...props} />
                                    }}
                                  >
                                    {msg.content}
                                  </ReactMarkdown>
                                  
                                  {/* Source attribution */}
                                  {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                                    <motion.div 
                                      className="mt-2 pt-2 border-t border-gray-200"
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      transition={{ delay: 0.3 }}
                                    >
                                      <p className="text-xs text-gray-500 font-medium">Sources:</p>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {msg.sources.map((source, i) => (
                                          <motion.span 
                                            key={i} 
                                            className="inline-block px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-600"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.3 + (i * 0.1) }}
                                            whileHover={{ 
                                              scale: 1.05,
                                              backgroundColor: "#f3f4f6"
                                            }}
                                          >
                                            {source}
                                          </motion.span>
                                        ))}
                  </div>
                                    </motion.div>
                                  )}
                </div>
                              )}
                            </div>
                          </motion.div>
              ))}
              <div ref={messagesEndRef} />
                      </div>
                    )}
            </ScrollArea>
            
                  <motion.form 
                    onSubmit={handleSendMessage} 
                    className="p-4 border-t bg-white"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    {messages.length === 1 && messages[0].role === 'assistant' && !messages[0].isLoading && (
                      <motion.div 
                        className="mb-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.3 }}
                      >
                        <p className="text-xs text-gray-500 mb-2">Try asking:</p>
                        <div className="flex flex-wrap gap-2">
                          {[
                            "What are the admission requirements?",
                            `What majors is ${college.name} known for?`,
                            "What is campus life like?",
                            "What is the cost of attendance?",
                            "What is the acceptance rate?"
                          ].map((question, i) => (
                            <motion.button
                              key={i}
                              type="button"
                              className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 py-1 px-2 rounded-md border border-gray-200 transition-colors"
                              onClick={() => {
                                setNewMessage(question);
                                // Use setTimeout to allow state update before submitting
                                setTimeout(() => {
                                  // Create and dispatch a submit event on the form
                                  const form = document.querySelector('form');
                                  if (form) {
                                    const submitEvent = new Event('submit', { cancelable: true, bubbles: true });
                                    form.dispatchEvent(submitEvent);
                                  }
                                }, 10);
                              }}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.6 + (i * 0.1) }}
                              whileHover={{ 
                                scale: 1.05,
                                backgroundColor: "#f3f4f6"
                              }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {question}
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}
              <div className="flex gap-2">
                      <motion.input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ask anything about the college..."
                        className="w-full py-5 px-5 text-base rounded-xl border border-gray-300 bg-white/80 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all shadow-sm h-14 leading-normal"
                  disabled={isSending}
                        whileFocus={{ scale: 1.01, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      />
                      <motion.button 
                        type="submit" 
                        disabled={isSending || !newMessage.trim()}
                        className="bg-gray-900 hover:bg-gray-800 text-white p-3 rounded-xl shadow-sm flex items-center justify-center"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        animate={isSending ? { rotate: 360 } : {}}
                        transition={{ 
                          type: "spring", 
                          stiffness: 500, 
                          damping: 15
                        }}
                      >
                        {isSending ? (
                          <motion.div 
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ 
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear"
                            }}
                          />
                        ) : (
                  <Send className="w-4 h-4" />
                        )}
                      </motion.button>
              </div>
                  </motion.form>
                </div>
          </motion.div>
        )}
      </AnimatePresence>
        </div>

      {/* Chat Toggle Button */}
        <AnimatePresence>
          {!isChatOpen && (
      <motion.button
              onClick={() => setIsChatOpen(true)}
              className="fixed md:hidden bottom-4 right-4 w-14 h-14 bg-gray-900 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-800 transition-all z-40"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.1, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              whileTap={{ scale: 0.95 }}
              transition={{ 
                type: "spring",
                stiffness: 400,
                damping: 17
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 500 }}
      >
        <MessageCircle className="w-6 h-6" />
              </motion.div>
      </motion.button>
          )}
        </AnimatePresence>
        
        {/* Toggle Button for Desktop */}
        <AnimatePresence>
          {!isChatOpen && (
            <motion.button
              onClick={() => setIsChatOpen(true)}
              className="hidden md:flex fixed right-0 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white py-4 px-3 rounded-l-lg shadow-lg items-center justify-center hover:bg-gray-800 transition-all z-40"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              whileHover={{ x: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              transition={{ 
                type: "spring",
                stiffness: 400,
                damping: 22
              }}
            >
              <motion.div 
                className="flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                <span className="font-medium text-sm">Chat</span>
              </motion.div>
            </motion.button>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
} 