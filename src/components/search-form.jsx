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
import { API_URL } from "@/config"
import { tailwindColors } from "@/lib/theme"
import { Checkbox } from "@/components/ui/checkbox"

export function SearchForm({ isSidebar = false }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    type: "",
    collegeTypes: [],
    satVerbalMin: "",
    satVerbalMax: "",
    satMathMin: "",
    satMathMax: "",
    tuitionMin: "",
    tuitionMax: "",
    studyAreas: [],
    onlineOptions: [],
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
      try {
        const parsedData = JSON.parse(savedFormData)
        // Ensure arrays are initialized
        setFormData({
          ...parsedData,
          collegeTypes: parsedData.collegeTypes || [],
          studyAreas: parsedData.studyAreas || [],
          onlineOptions: parsedData.onlineOptions || []
        })
      } catch (e) {
        console.error("Error parsing saved form data:", e)
        // If there's an error, use the default state
      }
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
      const response = await fetch(`${API_URL}/api/v1/search`, {
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
      const response = await fetch(`${API_URL}/api/v1/aggregate_chat`, {
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCheckboxChange = (field, value, checked) => {
    setFormData(prev => {
      const currentValues = prev[field] || [];
      return {
        ...prev,
        [field]: checked 
          ? [...currentValues, value]
          : currentValues.filter(item => item !== value)
      };
    });
  }

  // Render a sidebar-optimized form if isSidebar is true
  if (isSidebar) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2 text-[#2081C3]">College type</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <Checkbox 
                  id="type-4year" 
                  checked={(formData.collegeTypes || []).includes('4-year')}
                  onCheckedChange={(checked) => handleCheckboxChange('collegeTypes', '4-year', checked)}
                  className="border-[#BED8D4] text-[#2081C3]"
                />
                <label htmlFor="type-4year" className="ml-2 text-sm text-[#2081C3]/80">4-year</label>
              </div>
              <div className="flex items-center">
                <Checkbox 
                  id="type-private" 
                  checked={(formData.collegeTypes || []).includes('private')}
                  onCheckedChange={(checked) => handleCheckboxChange('collegeTypes', 'private', checked)}
                  className="border-[#BED8D4] text-[#2081C3]"
                />
                <label htmlFor="type-private" className="ml-2 text-sm text-[#2081C3]/80">Private</label>
              </div>
              <div className="flex items-center">
                <Checkbox 
                  id="type-public" 
                  checked={(formData.collegeTypes || []).includes('public')}
                  onCheckedChange={(checked) => handleCheckboxChange('collegeTypes', 'public', checked)}
                  className="border-[#BED8D4] text-[#2081C3]"
                />
                <label htmlFor="type-public" className="ml-2 text-sm text-[#2081C3]/80">Public</label>
              </div>
              <div className="flex items-center">
                <Checkbox 
                  id="type-2year" 
                  checked={(formData.collegeTypes || []).includes('2-year')}
                  onCheckedChange={(checked) => handleCheckboxChange('collegeTypes', '2-year', checked)}
                  className="border-[#BED8D4] text-[#2081C3]"
                />
                <label htmlFor="type-2year" className="ml-2 text-sm text-[#2081C3]/80">2-year</label>
              </div>
              <div className="flex items-center">
                <Checkbox 
                  id="type-community" 
                  checked={(formData.collegeTypes || []).includes('community')}
                  onCheckedChange={(checked) => handleCheckboxChange('collegeTypes', 'community', checked)}
                  className="border-[#BED8D4] text-[#2081C3]"
                />
                <label htmlFor="type-community" className="ml-2 text-sm text-[#2081C3]/80">Community</label>
              </div>
              <div className="flex items-center">
                <Checkbox 
                  id="type-other" 
                  checked={(formData.collegeTypes || []).includes('other')}
                  onCheckedChange={(checked) => handleCheckboxChange('collegeTypes', 'other', checked)}
                  className="border-[#BED8D4] text-[#2081C3]"
                />
                <label htmlFor="type-other" className="ml-2 text-sm text-[#2081C3]/80">Other</label>
              </div>
            </div>
          </div>

          <div className="border-t border-[#BED8D4] pt-4">
            <h3 className="text-sm font-medium mb-2 text-[#2081C3] flex items-center">
              General area of study 
              <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#BED8D4] text-[#2081C3] text-xs">?</span>
            </h3>
            <Select
              value={formData.studyArea}
              onValueChange={(value) => handleInputChange("studyArea", value)}
            >
              <SelectTrigger className="border-[#BED8D4] focus:ring-[#63D2FF] text-[#2081C3] text-sm">
                <SelectValue placeholder="Select area" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#BED8D4]">
                <SelectItem value="arts">Arts & Humanities</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="science">Science</SelectItem>
                <SelectItem value="social">Social Sciences</SelectItem>
                <SelectItem value="health">Health Sciences</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border-t border-[#BED8D4] pt-4">
            <h3 className="text-sm font-medium mb-2 text-[#2081C3] flex items-center">
              Majors
              <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#BED8D4] text-[#2081C3] text-xs">?</span>
            </h3>
            <Input
              placeholder="Search majors..."
              className="border-[#BED8D4] focus:ring-[#63D2FF] text-[#2081C3] text-sm mb-2"
            />
            <div className="space-y-2">
              <div className="flex items-center">
                <Checkbox 
                  id="campus" 
                  checked={(formData.onlineOptions || []).includes('campus')}
                  onCheckedChange={(checked) => handleCheckboxChange('onlineOptions', 'campus', checked)}
                  className="border-[#BED8D4] text-[#2081C3]"
                />
                <label htmlFor="campus" className="ml-2 text-sm text-[#2081C3]/80">Campus</label>
              </div>
            </div>
            <div className="mt-2">
              <a href="#" className="text-sm text-[#2081C3] hover:underline">See all majors</a>
            </div>
          </div>

          <div className="border-t border-[#BED8D4] pt-4">
            <h3 className="text-sm font-medium mb-2 text-[#2081C3]">SAT Verbal Range</h3>
            <div className="space-y-2">
              <div>
                <label htmlFor="satVerbalMin" className="text-xs text-[#2081C3]/70 mb-1 block">Minimum</label>
                <Input
                  id="satVerbalMin"
                  type="number"
                  placeholder="Min"
                  value={formData.satVerbalMin}
                  onChange={(e) => handleInputChange("satVerbalMin", e.target.value)}
                  className="border-[#BED8D4] focus:ring-[#63D2FF] text-[#2081C3] text-sm"
                />
              </div>
              <div>
                <label htmlFor="satVerbalMax" className="text-xs text-[#2081C3]/70 mb-1 block">Maximum</label>
                <Input
                  id="satVerbalMax"
                  type="number"
                  placeholder="Max"
                  value={formData.satVerbalMax}
                  onChange={(e) => handleInputChange("satVerbalMax", e.target.value)}
                  className="border-[#BED8D4] focus:ring-[#63D2FF] text-[#2081C3] text-sm"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-[#BED8D4] pt-4">
            <h3 className="text-sm font-medium mb-2 text-[#2081C3]">SAT Math Range</h3>
            <div className="space-y-2">
              <div>
                <label htmlFor="satMathMin" className="text-xs text-[#2081C3]/70 mb-1 block">Minimum</label>
                <Input
                  id="satMathMin"
                  type="number"
                  placeholder="Min"
                  value={formData.satMathMin}
                  onChange={(e) => handleInputChange("satMathMin", e.target.value)}
                  className="border-[#BED8D4] focus:ring-[#63D2FF] text-[#2081C3] text-sm"
                />
              </div>
              <div>
                <label htmlFor="satMathMax" className="text-xs text-[#2081C3]/70 mb-1 block">Maximum</label>
                <Input
                  id="satMathMax"
                  type="number"
                  placeholder="Max"
                  value={formData.satMathMax}
                  onChange={(e) => handleInputChange("satMathMax", e.target.value)}
                  className="border-[#BED8D4] focus:ring-[#63D2FF] text-[#2081C3] text-sm"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-[#BED8D4] pt-4">
            <h3 className="text-sm font-medium mb-2 text-[#2081C3]">Tuition Range (In-State)</h3>
            <div className="space-y-2">
              <div>
                <label htmlFor="tuitionMin" className="text-xs text-[#2081C3]/70 mb-1 block">Minimum</label>
                <Input
                  id="tuitionMin"
                  type="number"
                  placeholder="Min"
                  value={formData.tuitionMin}
                  onChange={(e) => handleInputChange("tuitionMin", e.target.value)}
                  className="border-[#BED8D4] focus:ring-[#63D2FF] text-[#2081C3] text-sm"
                />
              </div>
              <div>
                <label htmlFor="tuitionMax" className="text-xs text-[#2081C3]/70 mb-1 block">Maximum</label>
                <Input
                  id="tuitionMax"
                  type="number"
                  placeholder="Max"
                  value={formData.tuitionMax}
                  onChange={(e) => handleInputChange("tuitionMax", e.target.value)}
                  className="border-[#BED8D4] focus:ring-[#63D2FF] text-[#2081C3] text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-center text-sm">{error}</p>
        )}

        <Button 
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full bg-[#2081C3] hover:bg-[#2081C3]/90 text-white"
        >
          {isLoading ? "Searching..." : "Search Colleges"}
        </Button>
      </div>
    );
  }

  // Original card-based form for non-sidebar usage
  return (
    <div className="space-y-8">
      <Card className="border-[#BED8D4] bg-white/90">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold text-[#2081C3]">Find Your Perfect College</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="type" className="text-[#2081C3]">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange("type", value)}
                >
                  <SelectTrigger id="type" className="border-[#BED8D4] focus:ring-[#63D2FF] text-[#2081C3]">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#BED8D4]">
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="community">Community College</SelectItem>
                    <SelectItem value="liberal-arts">Liberal Arts</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tuitionMin" className="text-[#2081C3]">Tuition Range (In-State)</Label>
                <div className="space-y-2">
                  <div>
                    <label htmlFor="tuitionMin" className="text-xs text-[#2081C3]/70 mb-1 block">Minimum</label>
                    <Input
                      id="tuitionMin"
                      type="number"
                      placeholder="Min"
                      value={formData.tuitionMin}
                      onChange={(e) => handleInputChange("tuitionMin", e.target.value)}
                      className="border-[#BED8D4] focus:ring-[#63D2FF] text-[#2081C3]"
                    />
                  </div>
                  <div>
                    <label htmlFor="tuitionMax" className="text-xs text-[#2081C3]/70 mb-1 block">Maximum</label>
                    <Input
                      id="tuitionMax"
                      type="number"
                      placeholder="Max"
                      value={formData.tuitionMax}
                      onChange={(e) => handleInputChange("tuitionMax", e.target.value)}
                      className="border-[#BED8D4] focus:ring-[#63D2FF] text-[#2081C3]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="satVerbalMin" className="text-[#2081C3]">SAT Verbal Range</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="satVerbalMin"
                    type="number"
                    placeholder="Min"
                    value={formData.satVerbalMin}
                    onChange={(e) => handleInputChange("satVerbalMin", e.target.value)}
                    className="border-[#BED8D4] focus:ring-[#63D2FF] text-[#2081C3]"
                  />
                  <Input
                    id="satVerbalMax"
                    type="number"
                    placeholder="Max"
                    value={formData.satVerbalMax}
                    onChange={(e) => handleInputChange("satVerbalMax", e.target.value)}
                    className="border-[#BED8D4] focus:ring-[#63D2FF] text-[#2081C3]"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="satMathMin" className="text-[#2081C3]">SAT Math Range</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="satMathMin"
                    type="number"
                    placeholder="Min"
                    value={formData.satMathMin}
                    onChange={(e) => handleInputChange("satMathMin", e.target.value)}
                    className="border-[#BED8D4] focus:ring-[#63D2FF] text-[#2081C3]"
                  />
                  <Input
                    id="satMathMax"
                    type="number"
                    placeholder="Max"
                    value={formData.satMathMax}
                    onChange={(e) => handleInputChange("satMathMax", e.target.value)}
                    className="border-[#BED8D4] focus:ring-[#63D2FF] text-[#2081C3]"
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-center">{error}</p>
            )}

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#2081C3] hover:bg-[#2081C3]/90 text-white"
            >
              {isLoading ? "Searching..." : "Search Colleges"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {searchResults.length > 0 && (
        <>
          <Card className="border-[#BED8D4] bg-white/90">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold text-[#2081C3]">Search Results</CardTitle>
              <p className="text-[#2081C3]/80 text-sm">
                Found {searchResults.length} colleges matching your criteria
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#F7F9F9] border-b border-[#BED8D4]">
                        <TableHead 
                          className="cursor-pointer hover:bg-[#BED8D4]/20"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center text-[#2081C3]">
                            College Name {getSortIcon('name')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-[#BED8D4]/20"
                          onClick={() => handleSort('state')}
                        >
                          <div className="flex items-center text-[#2081C3]">
                            State {getSortIcon('state')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-[#BED8D4]/20"
                          onClick={() => handleSort('type')}
                        >
                          <div className="flex items-center text-[#2081C3]">
                            Type {getSortIcon('type')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-[#BED8D4]/20"
                          onClick={() => handleSort('tuition')}
                        >
                          <div className="flex items-center text-[#2081C3]">
                            Tuition {getSortIcon('tuition')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-[#BED8D4]/20"
                          onClick={() => handleSort('satVerbalAvg')}
                        >
                          <div className="flex items-center text-[#2081C3]">
                            SAT Verbal Avg {getSortIcon('satVerbalAvg')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-[#BED8D4]/20"
                          onClick={() => handleSort('satMathAvg')}
                        >
                          <div className="flex items-center text-[#2081C3]">
                            SAT Math Avg {getSortIcon('satMathAvg')}
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentResults.map((college) => (
                        <TableRow 
                          key={college.id} 
                          className="cursor-pointer hover:bg-[#F7F9F9] border-b border-[#BED8D4]/50"
                          onClick={() => handleCollegeClick(college.id)}
                        >
                          <TableCell className="font-medium text-[#2081C3] hover:text-[#63D2FF]">
                            {college.name}
                          </TableCell>
                          <TableCell className="text-[#2081C3]/80">{college.state}</TableCell>
                          <TableCell className="text-[#2081C3]/80">{college.type}</TableCell>
                          <TableCell className="text-[#2081C3]/80">{formatCurrency(college.tuition)}</TableCell>
                          <TableCell className="text-[#2081C3]/80">{college.satVerbalAvg || 'N/A'}</TableCell>
                          <TableCell className="text-[#2081C3]/80">{college.satMathAvg || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>

                {totalPages > 1 && (
                  <div className="flex justify-center space-x-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="border-[#BED8D4] text-[#2081C3] hover:bg-[#BED8D4]/20"
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-3 text-[#2081C3]">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="border-[#BED8D4] text-[#2081C3] hover:bg-[#BED8D4]/20"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chat Interface */}
          <Card className="border-[#BED8D4] bg-white/90 mt-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold text-[#2081C3]">Ask AI About These Colleges</CardTitle>
              <p className="text-[#2081C3]/80 text-sm">
                Ask questions about any of the colleges in your search results
              </p>
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
                              ? 'bg-[#2081C3] text-white'
                              : 'bg-[#F7F9F9] border border-[#BED8D4] text-[#2081C3]'
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
                    className="flex-1 border-[#BED8D4] focus:ring-[#63D2FF] text-[#2081C3]"
                  />
                  <Button 
                    type="submit" 
                    disabled={isSending || !newMessage.trim()}
                    className="px-4 bg-[#2081C3] hover:bg-[#2081C3]/90 text-white"
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
        </>
      )}
    </div>
  )
} 