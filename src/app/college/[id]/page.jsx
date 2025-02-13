"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from "lucide-react"
import { API_URL } from "@/config"

export default function CollegePage() {
  const params = useParams()
  const router = useRouter()
  const [college, setCollege] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const chatContainer = messagesEndRef.current.closest('.scroll-area-viewport')
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight
      }
    }
  }

  useEffect(() => {
    const fetchCollegeDetails = async () => {
      try {
        const response = await fetch(`${API_URL}/api/v1/college/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch college details')
        }
        const data = await response.json()
        setCollege(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCollegeDetails()
  }, [params.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg">Loading college details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-red-500">Error: {error}</p>
      </div>
    )
  }

  if (!college) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg">College not found</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button 
        variant="outline" 
        onClick={() => router.back()}
        className="mb-4 border-[rgb(246,91,102)] text-[rgb(246,91,102)] hover:bg-[rgb(246,91,102)]/10"
      >
        ← Back to Search
      </Button>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr,400px] gap-6">
        {/* Main College Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="max-w-7xl">
              <CardTitle className="text-3xl font-bold text-[rgb(246,91,102)]">{college.name}</CardTitle>
              <p className="text-gray-500">{college.state} • {college.type}</p>
              {college.calendar_system && (
                <p className="text-gray-500 mt-1">Calendar System: {college.calendar_system}</p>
              )}
              {college.open_admission && (
                <p className="text-green-600 font-medium mt-1">Open Admission Policy</p>
              )}
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Tuition Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold border-b pb-2 text-[rgb(246,91,102)]">Tuition & Costs</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-600">Undergraduate Tuition</h4>
                    <div className="space-y-2">
                      <p>In-State: {formatCurrency(college.undergraduate_tuition.in_state)}</p>
                      <p>Out-of-State: {formatCurrency(college.undergraduate_tuition.out_of_state)}</p>
                      {college.undergraduate_tuition.in_state_fees && (
                        <p>In-State Fees: {formatCurrency(college.undergraduate_tuition.in_state_fees)}</p>
                      )}
                      {college.undergraduate_tuition.out_of_state_fees && (
                        <p>Out-of-State Fees: {formatCurrency(college.undergraduate_tuition.out_of_state_fees)}</p>
                      )}
                    </div>
                    {college.graduate_tuition && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-600">Graduate Tuition</h4>
                        <p>{formatCurrency(college.graduate_tuition)}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-600">Additional Costs</h4>
                    <div className="space-y-2">
                      {college.cost_of_attendance.books_and_supplies && (
                        <p>Books & Supplies: {formatCurrency(college.cost_of_attendance.books_and_supplies)}</p>
                      )}
                      {college.cost_of_attendance.on_campus_housing && (
                        <p>On-Campus Housing: {formatCurrency(college.cost_of_attendance.on_campus_housing)}</p>
                      )}
                      {college.cost_of_attendance.on_campus_other && (
                        <p>Other On-Campus Costs: {formatCurrency(college.cost_of_attendance.on_campus_other)}</p>
                      )}
                      {college.cost_of_attendance.off_campus_housing && (
                        <p>Off-Campus Housing: {formatCurrency(college.cost_of_attendance.off_campus_housing)}</p>
                      )}
                      {college.cost_of_attendance.off_campus_other && (
                        <p>Other Off-Campus Costs: {formatCurrency(college.cost_of_attendance.off_campus_other)}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Test Scores Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold border-b pb-2 text-[rgb(246,91,102)]">Test Scores</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-600">SAT Scores</h4>
                      <p className="text-sm text-gray-500">
                        {formatNumber(college.admissions.test_scores.sat_submitted_count)} students submitted ({formatPercentage(college.admissions.test_scores.sat_submitted_percentage)})
                      </p>
                      <div className="mt-2 space-y-2">
                        <div>
                          <p className="font-medium">Reading & Writing</p>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <p className="text-sm text-gray-500">25th</p>
                              <p>{college.admissions.test_scores.sat_reading_writing.percentile_25th || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Median</p>
                              <p>{college.admissions.test_scores.sat_reading_writing.percentile_50th || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">75th</p>
                              <p>{college.admissions.test_scores.sat_reading_writing.percentile_75th || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="font-medium">Math</p>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <p className="text-sm text-gray-500">25th</p>
                              <p>{college.admissions.test_scores.sat_math.percentile_25th || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Median</p>
                              <p>{college.admissions.test_scores.sat_math.percentile_50th || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">75th</p>
                              <p>{college.admissions.test_scores.sat_math.percentile_75th || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-600">ACT Scores</h4>
                      <p className="text-sm text-gray-500">
                        {formatNumber(college.admissions.test_scores.act_submitted_count)} students submitted ({formatPercentage(college.admissions.test_scores.act_submitted_percentage)})
                      </p>
                      <div className="mt-2 space-y-2">
                        <div>
                          <p className="font-medium">Composite</p>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <p className="text-sm text-gray-500">25th</p>
                              <p>{college.admissions.test_scores.act_composite.percentile_25th || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Median</p>
                              <p>{college.admissions.test_scores.act_composite.percentile_50th || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">75th</p>
                              <p>{college.admissions.test_scores.act_composite.percentile_75th || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="font-medium">English</p>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <p className="text-sm text-gray-500">25th</p>
                              <p>{college.admissions.test_scores.act_english.percentile_25th || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Median</p>
                              <p>{college.admissions.test_scores.act_english.percentile_50th || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">75th</p>
                              <p>{college.admissions.test_scores.act_english.percentile_75th || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="font-medium">Math</p>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <p className="text-sm text-gray-500">25th</p>
                              <p>{college.admissions.test_scores.act_math.percentile_25th || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Median</p>
                              <p>{college.admissions.test_scores.act_math.percentile_50th || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">75th</p>
                              <p>{college.admissions.test_scores.act_math.percentile_75th || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admissions Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold border-b pb-2 text-[rgb(246,91,102)]">Admissions Statistics</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-600">Acceptance Rate</h4>
                    <p className="text-2xl font-bold">
                      {college.acceptance_rate ? formatPercentage(college.acceptance_rate * 100) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-600">Applications by Gender</h4>
                    <div className="space-y-2">
                      <p>Total: {formatNumber(college.admissions.applications.total)}</p>
                      <p>Men: {formatNumber(college.admissions.applications.men)}</p>
                      <p>Women: {formatNumber(college.admissions.applications.women)}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-600">Admission Considerations</h4>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      {college.admissions.admission_considerations.map((consideration, index) => (
                        <li key={index}>{consideration}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                  <div>
                    <h4 className="font-medium text-gray-600">Full-Time Enrollment</h4>
                    <div className="space-y-2">
                      <p>Total: {formatNumber(college.admissions.enrolled_full_time.total)}</p>
                      <p>Men: {formatNumber(college.admissions.enrolled_full_time.men)}</p>
                      <p>Women: {formatNumber(college.admissions.enrolled_full_time.women)}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-600">Part-Time Enrollment</h4>
                    <div className="space-y-2">
                      <p>Total: {formatNumber(college.admissions.enrolled_part_time.total)}</p>
                      <p>Men: {formatNumber(college.admissions.enrolled_part_time.men)}</p>
                      <p>Women: {formatNumber(college.admissions.enrolled_part_time.women)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Opportunities Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold border-b pb-2 text-[rgb(246,91,102)]">Academic Opportunities</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {college.special_learning_opportunities && Object.keys(college.special_learning_opportunities).length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-600">Special Learning Opportunities</h4>
                      <ul className="list-disc list-inside">
                        {Object.entries(college.special_learning_opportunities).map(([key, value]) => (
                          value && <li key={key}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {college.distance_education && Object.keys(college.distance_education).length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-600">Distance Education</h4>
                      <ul className="list-disc list-inside">
                        {Object.entries(college.distance_education).map(([key, value]) => (
                          value && <li key={key}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {college.library_resources && Object.keys(college.library_resources).length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-600">Library Resources</h4>
                      <ul className="list-disc list-inside">
                        {Object.entries(college.library_resources).map(([key, value]) => (
                          value && <li key={key}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Student Services Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold border-b pb-2 text-[rgb(246,91,102)]">Student Services & Campus Life</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {college.student_services && Object.keys(college.student_services).length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-600">Available Services</h4>
                      <ul className="list-disc list-inside">
                        {Object.entries(college.student_services).map(([key, value]) => (
                          value && <li key={key}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {college.housing_capacity && (
                    <div>
                      <h4 className="font-medium text-gray-600">Housing & Dining</h4>
                      <div className="space-y-2">
                        <p>Housing Capacity: {college.housing_capacity}</p>
                        {college.meal_plans && <p>Meal Plans: {college.meal_plans}</p>}
                      </div>
                    </div>
                  )}
                  {college.veteran_services && Object.keys(college.veteran_services).length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-600">Veteran Services</h4>
                      <ul className="list-disc list-inside">
                        {Object.entries(college.veteran_services).map(([key, value]) => (
                          value && <li key={key}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold border-b pb-2 text-[rgb(246,91,102)]">Additional Information</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {college.athletic_associations && college.athletic_associations.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-600">Athletic Associations</h4>
                      <ul className="list-disc list-inside">
                        {college.athletic_associations.map((association, index) => (
                          <li key={index}>{association}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {college.disability_services_pct !== undefined && (
                    <div>
                      <h4 className="font-medium text-gray-600">Students with Disabilities</h4>
                      <p>{formatPercentage(college.disability_services_pct)}</p>
                    </div>
                  )}
                  {college.promise_program && (
                    <div>
                      <h4 className="font-medium text-gray-600">Promise Program</h4>
                      <p>Available</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface - Fixed Position */}
        <div className="xl:sticky xl:top-8 h-fit">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold">Ask AI About {college.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ScrollArea className="h-[600px] pr-4" data-testid="chat-scroll-area">
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            message.role === 'user'
                              ? 'bg-[rgb(246,91,102)] text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    placeholder="Ask a question about this college..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={isSending}
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    disabled={isSending || !newMessage.trim()}
                    className="px-4 bg-[rgb(246,91,102)] hover:bg-[rgb(246,91,102)]/90"
                  >
                    {isSending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 