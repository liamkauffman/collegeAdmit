"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from "lucide-react"

export function SearchForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    type: "",
    satVerbalMin: "",
    satVerbalMax: "",
    satMathMin: "",
    satMathMax: "",
    tuitionMin: "",
    tuitionMax: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchResults, setSearchResults] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null
  })
  const resultsPerPage = 10
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef(null)

  // Load saved data from sessionStorage after mount
  useEffect(() => {
    const savedFormData = sessionStorage.getItem('collegeSearchFormData')
    if (savedFormData) {
      setFormData(JSON.parse(savedFormData))
    }
  }, [])

  // Save form data to session storage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('collegeSearchFormData', JSON.stringify(formData))
    }
  }, [formData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setCurrentPage(1)
    setSearchResults([])
    setSortConfig({ key: null, direction: null })

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to fetch results')
      }
      const data = await response.json()
      console.log("Response:", data)

      setSearchResults(data)
    } catch (err) {
      setError(err.message)
      console.error('Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      key = null;
      direction = null;
    }
    setSortConfig({ key, direction });
  };

  const getSortedResults = () => {
    if (!sortConfig.key) return searchResults;

    return [...searchResults].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle special cases for nested or formatted values
      if (sortConfig.key === 'satVerbalAvg' || sortConfig.key === 'satMathAvg') {
        aValue = aValue || 0;
        bValue = bValue || 0;
      }
      if (sortConfig.key === 'tuition') {
        aValue = aValue || 0;
        bValue = bValue || 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronsUpDown className="h-4 w-4 inline-block ml-1" />;
    }
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="h-4 w-4 inline-block ml-1" /> : 
      <ChevronDown className="h-4 w-4 inline-block ml-1" />;
  };

  const sortedResults = getSortedResults();
  const totalPages = Math.ceil(sortedResults.length / resultsPerPage)
  const startIndex = (currentPage - 1) * resultsPerPage
  const endIndex = startIndex + resultsPerPage
  const currentResults = sortedResults.slice(startIndex, endIndex)

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatChatResponse = (text) => {
    return text
      // Replace escaped newlines with actual newlines
      .replace(/\\n/g, '\n')
      // Handle bold text (both ** and * formats)
      .replace(/\*\*(.*?)\*\*/g, (_, p1) => `<strong>${p1}</strong>`)
      .replace(/\*(.*?)\*/g, (_, p1) => `<strong>${p1}</strong>`)
      // Handle bullet points
      .split('\n').map(line => {
        const trimmed = line.trim()
        if (trimmed.startsWith('* ')) {
          return '\n• ' + trimmed.substring(2)
        }
        return line
      }).join('\n')
      // Clean up extra whitespace while preserving intentional line breaks
      .split('\n').map(line => line.trim()).filter(Boolean).join('\n\n')
      .replace(/\s{2,}/g, ' ')
      .trim()
  }

  const handleCollegeClick = (collegeId) => {
    router.push(`/college/${collegeId}`)
  }

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const chatContainer = messagesEndRef.current.closest('.scroll-area-viewport')
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight
      }
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSearchChat = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    const userMessage = newMessage.trim()
    setNewMessage("")
    setIsSending(true)

    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/aggregate_chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          college_names: searchResults.map(college => college.name)
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
        if (done) {
          // Format the complete response once at the end
          setMessages(prev => {
            const newMessages = [...prev]
            const lastMessage = newMessages[newMessages.length - 1]
            lastMessage.content = formatChatResponse(accumulatedContent)
            return newMessages
          })
          break
        }

        console.log("Accumulated Content:", accumulatedContent)
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
          ? "I'm sorry, but I couldn't find information about these colleges."
          : "I apologize, but I encountered an error processing your request. Please try again."
      }])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Find Your Perfect College</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>SAT Verbal Range</Label>
                <div className="flex gap-4">
                  <Input
                    placeholder="Min"
                    type="number"
                    value={formData.satVerbalMin}
                    onChange={(e) => setFormData({ ...formData, satVerbalMin: e.target.value })}
                  />
                  <Input
                    placeholder="Max"
                    type="number"
                    value={formData.satVerbalMax}
                    onChange={(e) => setFormData({ ...formData, satVerbalMax: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>SAT Math Range</Label>
                <div className="flex gap-4">
                  <Input
                    placeholder="Min"
                    type="number"
                    value={formData.satMathMin}
                    onChange={(e) => setFormData({ ...formData, satMathMin: e.target.value })}
                  />
                  <Input
                    placeholder="Max"
                    type="number"
                    value={formData.satMathMax}
                    onChange={(e) => setFormData({ ...formData, satMathMax: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tuition Range (In-State)</Label>
                <div className="flex gap-4">
                  <Input
                    placeholder="Min"
                    type="number"
                    value={formData.tuitionMin}
                    onChange={(e) => setFormData({ ...formData, tuitionMin: e.target.value })}
                  />
                  <Input
                    placeholder="Max"
                    type="number"
                    value={formData.tuitionMax}
                    onChange={(e) => setFormData({ ...formData, tuitionMax: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {error && (
                <p className="text-red-500 text-center">{error}</p>
              )}
              <Button type="submit" className="w-full bg-[rgb(246,91,102)] hover:bg-[rgb(246,91,102)]/90" disabled={isLoading}>
                {isLoading ? "Searching..." : "Search Colleges"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {searchResults.length > 0 && (
        <div className="w-full max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr,500px] gap-6">
            {/* Search Results Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold">
                  Search Results ({searchResults.length} colleges found)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead 
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSort('name')}
                        >
                          Name {getSortIcon('name')}
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSort('state')}
                        >
                          State {getSortIcon('state')}
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSort('type')}
                        >
                          Type {getSortIcon('type')}
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSort('tuition')}
                        >
                          Tuition {getSortIcon('tuition')}
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSort('satVerbalAvg')}
                        >
                          SAT Verbal Avg {getSortIcon('satVerbalAvg')}
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSort('satMathAvg')}
                        >
                          SAT Math Avg {getSortIcon('satMathAvg')}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentResults.map((college) => (
                        <TableRow 
                          key={college.id} 
                          className="cursor-pointer hover:bg-gray-100"
                          onClick={() => handleCollegeClick(college.id)}
                        >
                          <TableCell className="font-medium text-[rgb(246,91,102)] hover:underline">
                            {college.name}
                          </TableCell>
                          <TableCell>{college.state}</TableCell>
                          <TableCell>{college.type}</TableCell>
                          <TableCell>{formatCurrency(college.tuition)}</TableCell>
                          <TableCell>{college.satVerbalAvg || 'N/A'}</TableCell>
                          <TableCell>{college.satMathAvg || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="flex justify-between items-center">
                    <div>
                      Showing {startIndex + 1}-{Math.min(endIndex, searchResults.length)} of {searchResults.length} results
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="border-[rgb(246,91,102)] text-[rgb(246,91,102)] hover:bg-[rgb(246,91,102)]/10"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        className="border-[rgb(246,91,102)] text-[rgb(246,91,102)] hover:bg-[rgb(246,91,102)]/10"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chat Interface - Fixed Position */}
            <div className="xl:sticky xl:top-8 h-fit">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Ask AI About These Colleges</CardTitle>
                  <p className="text-sm text-gray-500">Ask questions about any of the colleges in your search results</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <ScrollArea className="h-[400px] pr-4" data-testid="chat-scroll-area">
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
                              <p 
                                className="text-sm whitespace-pre-line"
                                dangerouslySetInnerHTML={{ __html: message.content }}
                              />
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>

                    <form onSubmit={handleSearchChat} className="flex gap-2">
                      <Input
                        placeholder="Ask a question about these colleges..."
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
      )}
    </div>
  )
} 