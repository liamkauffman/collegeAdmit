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
    // In a real app, we would fetch the college data based on the ID
    // For now, we'll use mock data
    const collegeId = params.id
    
    // Simulate API call
    setTimeout(() => {
      // Find the college in our mock data
      const foundCollege = mockCollegeDetails[collegeId] || mockCollegeDetails.stanford // Default to Stanford if not found
      setCollege(foundCollege)
      setLoading(false)
    }, 500)
  }, [params.id])

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (value) => {
    if (!value && value !== 0) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      maximumFractionDigits: 1,
    }).format(value / 100)
  }

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value)
  }

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
            <div className="w-16 h-16 border-4 border-[#2081C3] border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-[#2081C3] text-xl">Loading college information...</div>
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
          <div className="text-[#2081C3] text-xl">College not found</div>
        </main>
      </div>
    )
  }

  if (!college) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#F7F9F9] to-[#BED8D4]">
        <NavigationBar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-[#2081C3] text-xl">College not found</div>
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
                    ? 'text-[#2081C3] border-b-2 border-[#2081C3]'
                    : 'text-gray-500 hover:text-[#2081C3]'
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
            <h2 className="text-2xl font-bold text-[#2081C3] mb-4">Quick Facts</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-[#F7F9F9] p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Type</h3>
                <p className="font-semibold text-gray-800">{college.type}</p>
              </div>
              
              <div className="bg-[#F7F9F9] p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Rating</h3>
                <div className="flex items-center">
                  <span className="font-semibold text-gray-800 mr-2">{college.rating.score}/5</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${i < Math.floor(college.rating.score) ? 'text-yellow-400' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-500">({college.rating.reviewCount} reviews)</span>
                </div>
              </div>
              
              <div className="bg-[#F7F9F9] p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">US News Ranking</h3>
                <p className="font-semibold text-gray-800">#{college.ranking.usNews}</p>
              </div>
              
              <div className="bg-[#F7F9F9] p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Size</h3>
                <div>
                  <p className="font-semibold text-gray-800">{college.size.category}</p>
                  <p className="text-sm text-gray-500">{college.size.students.toLocaleString()} students</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div ref={el => sectionsRef.current['majors'] = el} className="bg-white rounded-xl shadow-md overflow-hidden mb-8 transition-transform hover:scale-[1.01]">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-[#2081C3] mb-4">Majors</h2>
            
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
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-colors ${selectedMajor === major ? 'bg-[#2081C3] text-white' : 'bg-[#F7F9F9] text-gray-700 hover:bg-[#BED8D4]/50'}`}
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
            <h2 className="text-2xl font-bold text-[#2081C3] mb-4">Acceptance</h2>
            
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
                      <div className="bg-[#2081C3] h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-500">SAT Range (25-75%)</span>
                      <span className="font-bold text-gray-800">{college.academics.satRange.min} - {college.academics.satRange.max}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-[#2081C3] h-2 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                  </div>
                  
                  {college.academics.actRange && (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-500">ACT Range (25-75%)</span>
                        <span className="font-bold text-gray-800">{college.academics.actRange.min} - {college.academics.actRange.max}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-[#2081C3] h-2 rounded-full" style={{ width: '65%' }}></div>
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
            <h2 className="text-2xl font-bold text-[#2081C3] mb-4">Quality of Life</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {college.qualityOfLife.factors.map((factor, index) => (
                <div key={index} className="bg-[#F7F9F9] p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">{factor.name}</h3>
                  <div className="flex items-center">
                    <span className="font-bold text-gray-800 mr-2">{factor.score}/10</span>
                    <div className="w-full bg-gray-200 rounded-full h-2 flex-1">
                      <div 
                        className="bg-[#2081C3] h-2 rounded-full" 
                        style={{ width: `${(factor.score / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-sm text-gray-500">
              <p>{college.qualityOfLife.description}</p>
            </div>
          </div>
        </div>
        
        <div ref={el => sectionsRef.current['costs'] = el} className="bg-white rounded-xl shadow-md overflow-hidden mb-8 transition-transform hover:scale-[1.01]">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-[#2081C3] mb-4">Costs</h2>
            
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
            <h2 className="text-2xl font-bold text-[#2081C3] mb-4">Recruiting & Outcomes</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Employment</h3>
                <div className="bg-[#F7F9F9] p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-500">Employment Rate</span>
                    <span className="font-bold text-gray-800">{college.recruiting.employmentRate}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-500">Average Starting Salary</span>
                    <span className="font-bold text-gray-800">{college.recruiting.startingSalary}</span>
                  </div>
                  {college.recruiting.salaryAfterYears && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">
                        Salary after {college.recruiting.salaryAfterYears.years} years
                      </span>
                      <span className="font-bold text-gray-800">
                        {college.recruiting.salaryAfterYears.amount}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
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
                          className="bg-[#2081C3] h-2 rounded-full" 
                          style={{ width: industry.percentage }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {college.recruiting.graduateSchool && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Graduate School</h3>
                <div className="bg-[#F7F9F9] p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Graduate School Attendance</span>
                    <span className="font-bold text-gray-800">{college.recruiting.graduateSchool.rate}</span>
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
              <h3 className="font-semibold text-[#2081C3]">Ask about {college.name}</h3>
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
                        ? 'bg-[#2081C3] text-white'
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
        className="fixed bottom-4 right-4 w-12 h-12 bg-[#2081C3] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#1a6da4] transition-colors z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>
    </div>
  )
} 