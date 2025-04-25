"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import axios from "axios";
import * as XLSX from 'xlsx';
import { 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Search, 
  X,
  ArrowRight,
  GraduationCap,
  BarChart, 
  Award,
  MoveHorizontal,
  AlertCircle,
  FileSpreadsheet,
  Download,
  CheckCircle,
  History,
  Save,
  Clock,
  Trash,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { API_URL } from "@/config";
import { useRouter } from "next/navigation";

// Custom scrollbar style
const scrollbarStyle = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

export function CustomCollegeCompare() {
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([
    { id: 1, name: "Academics", weight: 5 },
    { id: 2, name: "Campus Life", weight: 3 },
    { id: 3, name: "Location", weight: 2 },
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedColleges, setSelectedColleges] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [comparisonResults, setComparisonResults] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [error, setError] = useState(null);
  const [exportSuccess, setExportSuccess] = useState(false);
  
  // Comparison history state
  const [comparisonHistory, setComparisonHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [comparisonName, setComparisonName] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isRenamingId, setIsRenamingId] = useState(null);
  const [newComparisonName, setNewComparisonName] = useState("");
  const [historySort, setHistorySort] = useState("newest"); // "newest", "oldest", "a-z", "z-a"
  
  // Session for authenticated users
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  
  // Expanded section states
  const [expandedSection, setExpandedSection] = useState(["ranking", "categories", "details"]);
  const [expandedCollege, setExpandedCollege] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  
  // Drag and drop state
  const [draggedCollege, setDraggedCollege] = useState(null);
  const [draggedOver, setDraggedOver] = useState(null);
  
  // Ref for the category container
  const newCategoryRef = useRef(null);
  const dragItemRef = useRef(null);
  const dragOverItemRef = useRef(null);

  // Load comparison history when component mounts if user is authenticated
  useEffect(() => {
    if (isAuthenticated && step === 1) {
      fetchComparisonHistory();
    }
  }, [isAuthenticated, step]);
  
  // Sort and filter comparison history
  const filteredHistory = useMemo(() => {
    if (!comparisonHistory.length) return [];
    
    // First filter by search query
    let filtered = comparisonHistory;
    if (historySearchQuery.trim()) {
      const query = historySearchQuery.toLowerCase().trim();
      filtered = filtered.filter(comp => 
        comp.name.toLowerCase().includes(query)
      );
    }
    
    // Then sort according to selected sort option
    return filtered.sort((a, b) => {
      switch (historySort) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "a-z":
          return a.name.localeCompare(b.name);
        case "z-a":
          return b.name.localeCompare(a.name);
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
  }, [comparisonHistory, historySearchQuery, historySort]);

  // Function to rename a comparison
  const renameComparison = async (id, newName) => {
    if (!isAuthenticated || !newName.trim()) return;
    
    try {
      await axios.patch(`/api/comparisons/${id}`, {
        name: newName.trim()
      });
      
      // Update the local state
      setComparisonHistory(comparisonHistory.map(comp => 
        comp.id === id ? { ...comp, name: newName.trim() } : comp
      ));
      
      // Reset renaming state
      setIsRenamingId(null);
      setNewComparisonName("");
    } catch (error) {
      console.error('Error renaming comparison:', error);
      setError('Failed to rename comparison');
    }
  };

  // Search for colleges with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchColleges(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Handle search for colleges
  const searchColleges = async (query) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setError(null);
    
    try {
      console.log(`Searching for colleges with query: "${query}"`);
      
      const response = await axios.post('/api/colleges/search', {
        name: query,
        limit: 15 // Increased limit for more results
      });
      
      // The API now returns an array directly
      const results = response.data;
      console.log(`Received ${results.length} colleges in search results`);
      
      if (Array.isArray(results)) {
        setSearchResults(results);
      } else {
        console.warn('Unexpected search response format:', results);
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching colleges:", error);
      setError("Failed to search for colleges. Please try again.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Add a new category
  const addCategory = () => {
    if (categories.length >= 8) return; // Limit to 8 categories
    
    const newId = Math.max(0, ...categories.map(c => c.id)) + 1;
    setCategories([...categories, { id: newId, name: "", weight: 3 }]);
    
    // Focus the new category input
    setTimeout(() => {
      if (newCategoryRef.current) {
        newCategoryRef.current.focus();
      }
    }, 100);
  };

  // Update a category
  const updateCategory = (id, field, value) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, [field]: value } : cat
    ));
  };

  // Remove a category
  const removeCategory = (id) => {
    setCategories(categories.filter(cat => cat.id !== id));
  };

  // Add a college to the selected list
  const addCollege = (college) => {
    if (selectedColleges.some(c => c.id === college.id)) return;
    
    setSelectedColleges([...selectedColleges, college]);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Remove a college from the selected list
  const removeCollege = (collegeId) => {
    setSelectedColleges(selectedColleges.filter(c => c.id !== collegeId));
  };

  // Handle drag start
  const handleDragStart = (e, college, index) => {
    dragItemRef.current = index;
    setDraggedCollege(college);
  };

  // Handle drag over
  const handleDragOver = (e, index) => {
    e.preventDefault();
    dragOverItemRef.current = index;
    setDraggedOver(index);
  };

  // Handle drop to reorder colleges
  const handleDrop = (e) => {
    e.preventDefault();
    const draggedIndex = dragItemRef.current;
    const dragOverIndex = dragOverItemRef.current;
    
    if (draggedIndex === null || dragOverIndex === null || draggedIndex === dragOverIndex) {
      setDraggedCollege(null);
      setDraggedOver(null);
      return;
    }
    
    // Create a new array and reorder
    const newColleges = [...selectedColleges];
    const draggedItem = newColleges[draggedIndex];
    newColleges.splice(draggedIndex, 1);
    newColleges.splice(dragOverIndex, 0, draggedItem);
    
    // Update state
    setSelectedColleges(newColleges);
    setDraggedCollege(null);
    setDraggedOver(null);
    dragItemRef.current = null;
    dragOverItemRef.current = null;
  };

  // Run the comparison
  const runComparison = async () => {
    // Make sure we have at least 2 colleges and at least 1 valid category
    if (selectedColleges.length < 2) {
      setError("Please select at least 2 colleges to compare");
      return;
    }

    const validCategories = categories.filter(c => c.name.trim());
    if (validCategories.length === 0) {
      setError("Please add at least one category for comparison");
      return;
    }

    // Check if user is authenticated before proceeding
    if (!isAuthenticated) {
      // Redirect to sign in page
      router.push('/auth/signin');
      return;
    }

    setIsComparing(true);
    setError(null);
    
    try {
      // Step 1: Submit the comparison job
      const jobResponse = await axios.post(`/api/colleges/custom-compare`, {
        college_ids: selectedColleges.map(c => c.id),
        categories: validCategories.map(c => ({
          name: c.name,
          weight: c.weight
        }))
      });
      
      if (jobResponse.data.status !== "queued" && !jobResponse.data.job_id) {
        throw new Error(`Job submission failed: ${jobResponse.data.error || "Unknown error"}`);
      }
      
      const jobId = jobResponse.data.job_id;
      
      // Step 2: Poll for results indefinitely until complete
      let polling = true;
      
      while (polling) {
        try {
          const statusResponse = await axios.get(`/api/colleges/custom-compare/${jobId}`);
          
          // Check if job is complete (response will have colleges array)
          if (statusResponse.data.colleges) {
            setComparisonResults(statusResponse.data);
            setStep(3); // Move to results step
            return;
          }
          
          // Check for failure
          if (statusResponse.data.status === "failed") {
            throw new Error(`Comparison failed: ${statusResponse.data.error || "Unknown error"}`);
          }
          
          // Otherwise wait and try again
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (pollError) {
          console.error("Error during polling:", pollError);
          // If there's a network error during polling, retry after a delay rather than failing
          if (!pollError.response) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Longer delay on network errors
          } else {
            // For API errors like 500, propagate the error
            throw pollError;
          }
        }
      }
    } catch (error) {
      console.error("Error comparing colleges:", error);
      setError(error.message || "Failed to compare colleges");
    } finally {
      setIsComparing(false);
    }
  };

  // Reset the comparison
  const resetComparison = () => {
    setComparisonResults(null);
    setStep(1);
  };

  // Check if we can proceed to the next step
  const canProceedToColleges = categories.some(c => c.name.trim());
  const canProceedToCompare = selectedColleges.length >= 2;

  // Format scores for display
  const formatScore = (score) => {
    return typeof score === 'number' ? score.toFixed(1) : '0.0';
  };

  // Export comparison results to Excel
  const exportToExcel = () => {
    if (!comparisonResults) return;
    
    try {
      // Get valid categories
      const validCategories = categories.filter(c => c.name.trim());
      
      // Sort colleges by total score (highest first)
      const sortedColleges = [...comparisonResults.colleges].sort((a, b) => b.total_score - a.total_score);
      
      // Create headers
      const basicHeaders = ['College', 'State', 'Type', 'Total Score'];
      const categoryHeaders = validCategories.map(c => `${c.name} (weight: ${c.weight})`);
      const reasoningHeaders = validCategories.map(c => `${c.name} Reasoning`);
      const headers = [...basicHeaders, ...categoryHeaders, ...reasoningHeaders];
      
      // Create data rows
      const rows = sortedColleges.map(college => {
        const basicInfo = [
          college.name,
          college.state || 'N/A',
          college.type || 'N/A',
          formatScore(college.total_score)
        ];
        
        // Add scores for each category
        const categoryScores = validCategories.map(category => 
          formatScore(college.category_scores[category.name]?.score || 0)
        );
        
        // Add reasoning for each category
        const categoryReasons = validCategories.map(category => 
          college.category_scores[category.name]?.reasoning || "No reasoning provided."
        );
        
        return [...basicInfo, ...categoryScores, ...categoryReasons];
      });
      
      // Create worksheet data with headers
      const wsData = [headers, ...rows];
      
      // If there's a summary, add it with a blank row separation
      if (comparisonResults.comparison_summary) {
        wsData.push([]);  // Empty row as separator
        wsData.push(['Overall Summary', comparisonResults.comparison_summary]);
      }
      
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      
      // Set column widths for better readability
      const colWidths = headers.map(header => ({ wch: Math.min(50, Math.max(12, header.length * 1.2)) }));
      ws['!cols'] = colWidths;
      
      // Format header row with bold
      const headerRange = XLSX.utils.decode_range(ws['!ref']);
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!ws[cellRef]) continue;
        if (!ws[cellRef].s) ws[cellRef].s = {};
        ws[cellRef].s.font = { bold: true };
      }
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(wb, ws, 'College Comparison');
      
      // Set file name with timestamp
      const date = new Date();
      const timestamp = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      const fileName = `college-comparison-${timestamp}.xlsx`;
      
      // Generate and trigger download
      XLSX.writeFile(wb, fileName);
      
      // Show success notification
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000); // Hide after 3 seconds
      
    } catch (err) {
      console.error("Error exporting data:", err);
      setError("Failed to export to Excel. Please try again.");
    }
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSection(expandedSection.includes(section) ? expandedSection.filter(s => s !== section) : [...expandedSection, section]);
  };
  
  // Toggle college details expansion
  const toggleCollege = (collegeId) => {
    setExpandedCollege(expandedCollege === collegeId ? null : collegeId);
    // Reset expanded category when changing college
    setExpandedCategory(null);
  };
  
  // Toggle category details for a college
  const toggleCategory = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  // Fetch comparison history for the logged in user
  const fetchComparisonHistory = async () => {
    if (!isAuthenticated) return;
    
    setIsLoadingHistory(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/comparisons');
      setComparisonHistory(response.data);
    } catch (error) {
      console.error('Error fetching comparison history:', error);
      setError('Failed to load comparison history');
    } finally {
      setIsLoadingHistory(false);
    }
  };
  
  // Save current comparison to history
  const saveComparison = async () => {
    if (!isAuthenticated || !comparisonResults) return;
    
    if (!comparisonName.trim()) {
      // Generate a default name based on colleges
      const colleges = comparisonResults.colleges;
      const collegeNames = colleges.slice(0, 2).map(c => c.name.split(' ')[0]);
      if (colleges.length > 2) {
        collegeNames.push(`+${colleges.length - 2} more`);
      }
      setComparisonName(`Comparison: ${collegeNames.join(', ')}`);
    }
    
    setError(null);
    
    try {
      const validCategories = categories.filter(c => c.name.trim());
      
      // Create a simplified version of the comparison results to reduce data size
      const simplifiedResults = {
        colleges: comparisonResults.colleges.map(college => ({
          id: college.id,
          name: college.name,
          total_score: college.total_score,
          category_scores: college.category_scores
        })),
        comparison_summary: comparisonResults.comparison_summary
      };
      
      const comparisonData = {
        name: comparisonName.trim() || `Comparison from ${new Date().toLocaleDateString()}`,
        colleges: selectedColleges.map(c => String(c.id)),
        categories: validCategories.map(c => ({
          id: c.id,
          name: c.name,
          weight: c.weight
        })),
        results: simplifiedResults
      };
      
      console.log('Saving comparison with data:', {
        name: comparisonData.name,
        collegesCount: comparisonData.colleges.length,
        categoriesCount: comparisonData.categories.length
      });
      
      // Use axios for better error handling
      const response = await axios.post('/api/comparisons', comparisonData);
      console.log('Comparison saved successfully with ID:', response.data.id);
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      setSaveDialogOpen(false);
      
      // Refresh the history list
      fetchComparisonHistory();
    } catch (error) {
      console.error('Error saving comparison:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
      setError('Failed to save comparison: ' + errorMessage);
    }
  };
  
  // Load a saved comparison
  const loadComparison = (comparison) => {
    if (!comparison) return;
    
    try {
      // Set categories
      setCategories(comparison.categories);
      
      // Set selected colleges
      setSelectedColleges(comparison.colleges);
      
      // Set comparison results
      setComparisonResults(comparison.results);
      
      // Move to results step
      setStep(3);
      
      // Close history dialog
      setShowHistoryDialog(false);
    } catch (error) {
      console.error('Error loading comparison:', error);
      setError('Failed to load comparison');
    }
  };
  
  // Delete a saved comparison
  const deleteComparison = async (id) => {
    if (!isAuthenticated) return;
    
    setError(null);
    
    try {
      await axios.delete(`/api/comparisons/${id}`);
      
      // Update the history list
      setComparisonHistory(comparisonHistory.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting comparison:', error);
      setError('Failed to delete comparison');
    }
  };
  
  const router = useRouter();

  return (
    <div className="flex flex-col w-full relative">
      {/* Add the custom scrollbar styles */}
      <style jsx global>{scrollbarStyle}</style>
      
      {/* Step indicators */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                step === s 
                  ? "bg-blue-600 text-white" 
                  : step > s 
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-500"
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div className={`h-1 w-16 md:w-24 ${
                step > s ? "bg-green-500" : "bg-gray-200"
              }`}></div>
            )}
          </div>
        ))}
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 text-red-700 p-3 mb-6 rounded-lg flex items-center"
          >
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            <p className="text-sm">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Success notification */}
        {exportSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-50 text-green-700 p-3 mb-6 rounded-lg flex items-center fixed top-4 right-4 left-4 sm:left-auto sm:w-80 z-50 shadow-md"
          >
            <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            <p className="text-sm">Successfully exported comparison data!</p>
            <button 
              onClick={() => setExportSuccess(false)}
              className="ml-auto text-green-500 hover:text-green-700"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Save Success Notification */}
        {saveSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-50 text-green-700 p-3 mb-6 rounded-lg flex items-center fixed top-4 right-4 left-4 sm:left-auto sm:w-80 z-50 shadow-md"
          >
            <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            <p className="text-sm">Comparison saved successfully!</p>
            <button 
              onClick={() => setSaveSuccess(false)}
              className="ml-auto text-green-500 hover:text-green-700"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 1: Categories or History Dashboard */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {isAuthenticated && comparisonHistory.length > 0 ? (
              <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold flex items-center">
                    <History className="w-5 h-5 mr-2 text-blue-600" />
                    Your Comparison History
                  </h2>
                  <Button
                    onClick={() => setStep(2)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Comparison
                  </Button>
                </div>

                <div className="mb-6 flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search your comparisons..."
                      className="pl-10"
                      value={historySearchQuery}
                      onChange={(e) => setHistorySearchQuery(e.target.value)}
                    />
                  </div>
                  <select
                    className="h-10 px-3 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={historySort}
                    onChange={(e) => setHistorySort(e.target.value)}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="a-z">A-Z</option>
                    <option value="z-a">Z-A</option>
                  </select>
                </div>

                {isLoadingHistory ? (
                  <div className="flex items-center justify-center py-20">
                    <motion.div 
                      className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span className="ml-3 text-gray-600">Loading your comparison history...</span>
                  </div>
                ) : filteredHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Search className="w-12 h-12 text-gray-300 mb-3" />
                    <h3 className="font-medium text-gray-700 mb-1">No matches found</h3>
                    <p className="text-gray-500 text-sm max-w-md">
                      We couldn't find any comparisons matching "{historySearchQuery}". 
                      Try a different search term or clear the search.
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setHistorySearchQuery("")}
                    >
                      Clear Search
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredHistory.map((comparison) => (
                      <div 
                        key={comparison.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all group"
                      >
                        {isRenamingId === comparison.id ? (
                          <div className="flex mb-2">
                            <Input
                              type="text"
                              value={newComparisonName}
                              onChange={(e) => setNewComparisonName(e.target.value)}
                              placeholder="Enter new name..."
                              className="flex-grow"
                              autoFocus
                            />
                            <div className="flex ml-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-green-600 border-green-200 hover:bg-green-50 px-2"
                                onClick={() => renameComparison(comparison.id, newComparisonName)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50 ml-1 px-2"
                                onClick={() => setIsRenamingId(null)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-blue-800 truncate pr-2">
                              {comparison.name}
                            </h3>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex">
                              <button
                                className="text-gray-400 hover:text-blue-600 p-1"
                                onClick={() => {
                                  setIsRenamingId(comparison.id);
                                  setNewComparisonName(comparison.name);
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M12 20h9"></path>
                                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                                </svg>
                              </button>
                              <button
                                className="text-gray-400 hover:text-red-600 p-1"
                                onClick={() => setDeleteConfirmId(comparison.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        )}
                        
                        <div className="text-xs text-gray-500 mb-3 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>{new Date(comparison.createdAt).toLocaleDateString()}</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full mx-2"></span>
                          <GraduationCap className="w-3 h-3 mr-1" />
                          <span>{comparison.colleges.length} colleges</span>
                        </div>

                        <div className="mb-3 flex flex-wrap gap-2">
                          {Array.isArray(comparison.categories) ? 
                            comparison.categories.slice(0, 3).map((cat, i) => (
                              <Badge key={i} variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-100">
                                {cat.name}
                              </Badge>
                            )) : 
                            <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-100">
                              Custom comparison
                            </Badge>
                          }
                          {Array.isArray(comparison.categories) && comparison.categories.length > 3 && (
                            <Badge variant="outline" className="text-xs text-gray-500">
                              +{comparison.categories.length - 3} more
                            </Badge>
                          )}
                        </div>

                        <Button 
                          onClick={() => loadComparison(comparison)}
                          className="w-full text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200"
                        >
                          <ArrowRight className="w-4 h-4 mr-2" />
                          View Results
                        </Button>

                        {deleteConfirmId === comparison.id && (
                          <div className="absolute inset-0 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center p-4 z-10">
                            <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                            <h4 className="font-medium text-gray-900 mb-1 text-center">Delete this comparison?</h4>
                            <p className="text-sm text-gray-600 mb-4 text-center">
                              Are you sure you want to delete "{comparison.name}"? This cannot be undone.
                            </p>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setDeleteConfirmId(null)}
                              >
                                Cancel
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => {
                                  deleteComparison(comparison.id);
                                  setDeleteConfirmId(null);
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-blue-600" />
                  Define Your Categories
                </h2>

                <p className="text-gray-600 mb-6">
                  Add categories that matter to you and set their importance with weight values from 1 to 10.
                </p>

                {isAuthenticated && isLoadingHistory ? (
                  <div className="border border-dashed border-gray-300 rounded-lg p-8 mb-6 flex flex-col items-center justify-center">
                    <motion.div 
                      className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mb-4"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <p className="text-gray-500 text-center">Loading your comparison history...</p>
                  </div>
                ) : isAuthenticated && comparisonHistory.length === 0 ? (
                  <div className="border border-dashed border-gray-300 rounded-lg p-8 mb-6 text-center">
                    <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="font-medium text-gray-700 mb-1">No comparison history yet</h3>
                    <p className="text-gray-500 text-sm">
                      Once you create and save your comparisons, they will appear here for easy access.
                    </p>
                  </div>
                ) : null}

                <div className="space-y-3">
                  {categories.map((category, index) => (
                    <motion.div 
                      key={category.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4"
                    >
                      <Input
                        type="text"
                        value={category.name}
                        onChange={(e) => updateCategory(category.id, "name", e.target.value)}
                        placeholder="Category name"
                        className="flex-grow"
                        ref={index === categories.length - 1 ? newCategoryRef : null}
                      />
                      <div className="flex items-center gap-2 min-w-52">
                        <span className="text-sm text-gray-500 whitespace-nowrap">Weight:</span>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={category.weight}
                          onChange={(e) => updateCategory(category.id, "weight", parseInt(e.target.value))}
                          className="flex-grow"
                        />
                        <span className="text-sm font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-md min-w-8 text-center">
                          {category.weight}
                        </span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeCategory(category.id)}
                        className="text-gray-400 hover:text-red-500 flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={addCategory}
                    disabled={categories.length >= 8}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!canProceedToColleges}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 2: College Selection */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
                Select Colleges to Compare
              </h2>

              <p className="text-gray-600 mb-6">
                Search and select colleges to compare (minimum 2). Drag to reorder your preferences.
              </p>

              {/* College search */}
              <div className="relative mb-6">
                <div className="flex items-center">
                  <div className="relative flex-grow group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                      <Search className="h-4 w-4" />
                    </div>
                    <Input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for colleges by name..."
                      className="pl-10 pr-10 shadow-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
                    />
                    {isSearching ? (
                      <motion.div 
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent" />
                      </motion.div>
                    ) : searchQuery ? (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                </div>

                {/* Small helper text */}
                <p className="text-xs text-gray-500 mt-1 ml-1">
                  {selectedColleges.length > 0 
                    ? `${selectedColleges.length} college${selectedColleges.length !== 1 ? 's' : ''} selected` 
                    : "Search for and select colleges to compare (minimum 2)"}
                </p>

                {/* Search results */}
                <AnimatePresence>
                  {searchQuery.trim().length >= 2 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute z-10 mt-1 w-full bg-white shadow-xl rounded-md border border-gray-200"
                    >
                      {isSearching ? (
                        <div className="p-6 text-center text-gray-500 flex flex-col items-center justify-center">
                          <motion.div 
                            className="w-8 h-8 mb-3"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <div className="w-8 h-8 rounded-full border-3 border-blue-300 border-t-blue-600" />
                          </motion.div>
                          <p>Searching for colleges matching "{searchQuery}"...</p>
                        </div>
                      ) : !searchResults || searchResults.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                          <AlertCircle className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                          <p className="font-medium">No colleges found</p>
                          <p className="text-sm mt-1">Try adjusting your search term or try another college name</p>
                        </div>
                      ) : (
                        <>
                          <div className="p-2 bg-blue-50 border-b border-blue-200 text-xs text-blue-700 font-medium flex items-center justify-between sticky top-0 z-10">
                            <span>Found {searchResults.length} colleges matching "{searchQuery}"</span>
                            <span className="text-gray-500 italic">Click to add</span>
                          </div>
                          <div className="max-h-64 overflow-y-auto custom-scrollbar">
                            {searchResults.map((college, index) => (
                              <motion.div
                                key={college.id}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                whileHover={{ backgroundColor: "#f0f7ff" }}
                                className="p-3 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                                onClick={() => addCollege(college)}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium text-gray-900">{college.name}</p>
                                    <div className="flex items-center text-sm text-gray-500 mt-1">
                                      <p>
                                        {college.state && (
                                          <span className="inline-flex items-center">
                                            <span>{college.state}</span>
                                          </span>
                                        )}
                                        {college.type && (
                                          <span className="inline-flex items-center ml-2 pl-2 border-l border-gray-300">
                                            <span>{college.type}</span>
                                          </span>
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end">
                                    {college.acceptance_rate !== undefined && (
                                      <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                                        {(college.acceptance_rate * 100).toFixed(0)}% acceptance
                                      </Badge>
                                    )}
                                    {college.tuition && (
                                      <span className="text-xs text-gray-500 mt-1">
                                        ${college.tuition.toLocaleString()} tuition
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Selected colleges */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 flex items-center mb-2">
                  <MoveHorizontal className="w-4 h-4 mr-1 text-blue-500" />
                  Selected Colleges 
                  <Badge className="ml-2 bg-blue-100 text-blue-700 border-blue-200">
                    {selectedColleges.length} selected
                  </Badge>
                  {selectedColleges.length >= 10 && (
                    <span className="ml-2 text-xs text-amber-600">
                      Pro tip: Many colleges might take longer to compare
                    </span>
                  )}
                </h3>

                {selectedColleges.length === 0 ? (
                  <div className="p-6 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <GraduationCap className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">No colleges selected yet.</p>
                    <p className="text-sm text-gray-400 mt-1">Search above to find and add colleges to compare.</p>
                  </div>
                ) : (
                  <div className={`space-y-2 ${selectedColleges.length > 8 ? 'max-h-80 overflow-y-auto pr-1 custom-scrollbar' : ''}`}>
                    {selectedColleges.map((college, index) => (
                      <motion.div
                        key={college.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          scale: draggedOver === index ? 1.02 : 1,
                          boxShadow: draggedOver === index ? "0 8px 16px rgba(0, 0, 0, 0.1)" : "0 1px 3px rgba(0, 0, 0, 0.05)"
                        }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 500, 
                          damping: 30,
                          scale: { duration: 0.1 }
                        }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, college, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDrop}
                        className={`p-3 rounded-lg border ${
                          draggedOver === index ? "border-blue-400 bg-blue-50" : "border-gray-200"
                        } flex items-center cursor-move hover:shadow-md transition-all duration-200 ${
                          dragItemRef.current === index ? "opacity-60 border-blue-300 bg-blue-50 scale-[1.02]" : "opacity-100"
                        }`}
                      >
                        <div className="flex-grow">
                          <div className="flex items-center">
                            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold mr-2 flex-shrink-0">
                              {index + 1}
                            </div>
                            <p className="font-medium text-gray-900">{college.name}</p>
                          </div>
                          <div className="flex flex-wrap items-center pl-8 mt-1 text-sm text-gray-500">
                            {college.state && <span>{college.state}</span>}
                            {college.type && <span className="ml-2 pl-2 border-l border-gray-300">{college.type}</span>}
                            {college.acceptance_rate && (
                              <span className="ml-2 pl-2 border-l border-gray-300">
                                {(college.acceptance_rate * 100).toFixed(0)}% acceptance
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 hidden sm:flex">
                            <MoveHorizontal className="w-3 h-3 mr-1" />
                            Drag
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeCollege(college.id)}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Compare button for smaller screens */}
              {selectedColleges.length >= 2 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="sm:hidden mt-4"
                >
                  <Button
                    onClick={runComparison}
                    disabled={!canProceedToCompare || isComparing}
                    className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                  >
                    {isComparing ? (
                      <>
                        <motion.div 
                          className="w-4 h-4 mr-2 rounded-full border-2 border-white border-t-transparent"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        {selectedColleges.length > 5 ? "This may take a minute..." : "Comparing..."}
                      </>
                    ) : (
                      <>
                        Compare {selectedColleges.length} Colleges
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={runComparison}
                disabled={!canProceedToCompare || isComparing}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isComparing ? (
                  <>
                    <motion.div 
                      className="w-4 h-4 mr-2 rounded-full border-2 border-white border-t-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    {selectedColleges.length > 5 ? "This may take a minute..." : "Comparing..."}
                  </>
                ) : (
                  <>
                    Compare Colleges
                    <ArrowRight className="ml-2 h-4 w-4" />
                    {selectedColleges.length > 5 && (
                      <span className="ml-1 text-xs bg-blue-500 px-1 py-0.5 rounded">
                        ({selectedColleges.length})
                      </span>
                    )}
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Loading Animation Screen */}
        {isComparing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="max-w-lg w-full px-4">
              <div className="text-center mb-8">
                <motion.h2 
                  className="text-2xl font-bold text-blue-700 mb-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Comparing Your Colleges
                </motion.h2>
                <motion.p 
                  className="text-gray-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {selectedColleges.length > 5 
                    ? "Our AI is processing multiple colleges. This may take a while..." 
                    : "Our AI is analyzing your colleges based on your priorities..."}
                </motion.p>
                <motion.p
                  className="text-sm text-blue-500 mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  Your comparison job is being processed. This can take a few minutes.
                </motion.p>
              </div>
              
              <div className="relative h-64 mb-8">
                {/* Animated college cards */}
                {selectedColleges.slice(0, Math.min(selectedColleges.length, 5)).map((college, index) => {
                  // Calculate different initial positions for each card
                  const positions = [
                    { x: -160, y: -60 },  // left
                    { x: -40, y: -90 },   // top
                    { x: 80, y: -60 },    // right
                    { x: -100, y: 40 },   // bottom left
                    { x: 20, y: 40 },     // bottom right
                  ];
                  const position = positions[index % positions.length];
                  
                  return (
                    <motion.div
                      key={college.id}
                      className="absolute left-1/2 top-1/2 bg-white rounded-lg shadow-lg border border-blue-200 p-4 w-48"
                      initial={{ 
                        x: position.x, 
                        y: position.y,
                        rotate: -5 + (index * 3),
                        scale: 0.8,
                        opacity: 0 
                      }}
                      animate={{ 
                        x: [
                          position.x, 
                          position.x + Math.sin(index * 0.5) * 15, 
                          position.x
                        ],
                        y: [
                          position.y, 
                          position.y + Math.cos(index * 0.5) * 15, 
                          position.y
                        ],
                        rotate: [-5 + (index * 3), index * 3, -5 + (index * 3)],
                        opacity: [0.9, 1, 0.9],
                        scale: [0.9, 1, 0.9],
                        zIndex: 5 - index
                      }}
                      transition={{ 
                        duration: 5 + index, 
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut",
                        delay: index * 0.3
                      }}
                    >
                      <h3 className="font-semibold text-blue-800 mb-2">{college.name}</h3>
                      <div className="text-sm text-gray-600">
                        {college.state && <p>{college.state}</p>}
                        {college.type && <p className="mt-1">{college.type}</p>}
                      </div>
                      
                      {/* Animated progress  */}
                      <div className="mt-3 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-blue-500"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ 
                            duration: 2.5, 
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut",
                            delay: index * 0.3
                          }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
                
                {/* Center glowing circle */}
                <motion.div 
                  className="absolute left-1/2 top-1/2 w-16 h-16 rounded-full bg-blue-600/20"
                  style={{ 
                    filter: "blur(8px)",
                    transform: "translate(-50%, -50%)" 
                  }}
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
              </div>

            </div>
          </motion.div>
        )}

        {/* Step 3: Results */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <BarChart className="w-5 h-5 mr-2 text-blue-600" />
                Comparison Results
              </h2>

              {comparisonResults ? (
                <div className="space-y-6">
                  {/* Overall ranking - Always expanded */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Overall Ranking</h3>
                    </div>
                    <div className="space-y-3">
                      {comparisonResults.colleges
                        .sort((a, b) => b.total_score - a.total_score)
                        .map((college, index) => (
                          <motion.div
                            key={college.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center"
                          >
                            <div className={`w-8 h-8 rounded-full ${
                              index === 0 ? "bg-blue-600" : index === 1 ? "bg-blue-500" : "bg-blue-400"
                            } text-white flex items-center justify-center font-bold mr-3`}>
                              {index + 1}
                            </div>
                            <div className="flex-grow">
                              <div className="flex justify-between">
                                <h4 className="font-medium">{college.name}</h4>
                                <span className="font-bold text-blue-700">
                                  {formatScore(college.total_score)}/10
                                </span>
                              </div>
                              <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(college.total_score / 10) * 100}%` }}
                                  transition={{ delay: 0.5, duration: 0.8 }}
                                  className="h-2 bg-blue-600 rounded-full"
                                />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  </div>

                  {/* Collapsible Categories Breakdown */}
                  <div className="border rounded-lg overflow-hidden">
                    <button 
                      onClick={() => toggleSection("categories")}
                      className={`w-full px-4 py-3 flex items-center justify-between text-left ${
                        expandedSection.includes("categories") ? "bg-blue-50" : "bg-gray-50"
                      } border-b transition-colors`}
                    >
                      <h3 className="text-lg font-medium">Category Breakdown</h3>
                      <ChevronRight className={`h-5 w-5 text-gray-500 transition-transform ${
                        expandedSection.includes("categories") ? "transform rotate-90" : ""
                      }`} />
                    </button>
                    
                    <AnimatePresence>
                      {expandedSection.includes("categories") && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 shadow-sm">
                                    Category
                                  </th>
                                  {comparisonResults.colleges.map(college => (
                                    <th key={college.id} className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      {college.name}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {categories.filter(cat => cat.name.trim()).map(category => (
                                  <tr key={category.id}>
                                    <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10 shadow-sm">
                                      <span>{category.name}</span>
                                      <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-200">
                                        x{category.weight}
                                      </Badge>
                                    </td>
                                    {comparisonResults.colleges.map(college => (
                                      <td key={college.id} className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center">
                                          <span className="font-semibold mr-2">
                                            {formatScore(college.category_scores[category.name]?.score || 0)}
                                          </span>
                                          <div className="w-24 bg-gray-200 rounded-full h-2">
                                            <div 
                                              className="bg-blue-600 h-2 rounded-full" 
                                              style={{ width: `${((college.category_scores[category.name]?.score || 0) / 10) * 100}%` }}
                                            ></div>
                                          </div>
                                        </div>
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                                <tr className="bg-blue-50">
                                  <td className="px-3 py-3 whitespace-nowrap text-sm font-bold text-gray-900 sticky left-0 bg-blue-50 z-10 shadow-sm">
                                    Total Score
                                  </td>
                                  {comparisonResults.colleges.map(college => (
                                    <td key={college.id} className="px-3 py-3 whitespace-nowrap text-sm font-bold text-blue-700">
                                      {formatScore(college.total_score)}/10
                                    </td>
                                  ))}
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* College Comparison Cards - Horizontal Layout */}
                  <div className="border rounded-lg overflow-hidden">
                    <button 
                      onClick={() => toggleSection("details")}
                      className={`w-full px-4 py-3 flex items-center justify-between text-left ${
                        expandedSection.includes("details") ? "bg-blue-50" : "bg-gray-50"
                      } border-b transition-colors`}
                    >
                      <h3 className="text-lg font-medium">Detailed Reasoning</h3>
                      <ChevronRight className={`h-5 w-5 text-gray-500 transition-transform ${
                        expandedSection.includes("details") ? "transform rotate-90" : ""
                      }`} />
                    </button>
                    
                    <AnimatePresence>
                      {expandedSection.includes("details") && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden p-4"
                        >
                          {/* Horizontal scroll container for college cards */}
                          <div className="flex space-x-4 overflow-x-auto pb-4 custom-scrollbar">
                            {comparisonResults.colleges
                              .sort((a, b) => b.total_score - a.total_score)
                              .map((college, idx) => (
                                <motion.div
                                  key={college.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: idx * 0.1 }}
                                  className="flex-shrink-0 w-80 max-w-full h-full"
                                >
                                  <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-t-xl p-4 text-white flex items-center justify-between">
                                    <div className="flex items-center">
                                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mr-3 flex-shrink-0">
                                        <span className="text-xs font-bold">{idx + 1}</span>
                                      </div>
                                      <h4 className="font-semibold text-sm">{college.name}</h4>
                                    </div>
                                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 text-sm font-bold">
                                      {formatScore(college.total_score)}/10
                                    </div>
                                  </div>
                                  
                                  <div className="bg-white rounded-b-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="divide-y divide-gray-100">
                                      {categories.filter(cat => cat.name.trim()).map((category, catIdx) => {
                                        const score = college.category_scores[category.name]?.score || 0;
                                        const reasoning = college.category_scores[category.name]?.reasoning || "No reasoning provided.";
                                        const isExpanded = expandedCollege === college.id && expandedCategory === category.id;
                                        
                                        return (
                                          <div key={category.id} className="group">
                                            <div 
                                              className="px-4 py-3 hover:bg-blue-50/50 transition-colors cursor-pointer"
                                              onClick={() => {
                                                if (expandedCollege !== college.id) {
                                                  toggleCollege(college.id);
                                                  toggleCategory(category.id);
                                                } else {
                                                  toggleCategory(category.id);
                                                }
                                              }}
                                            >
                                              <div className="flex items-center justify-between mb-1">
                                                <h5 className="font-medium text-gray-800 text-sm flex items-center">
                                                  {category.name}
                                                  <Badge className="ml-2 text-xs text-blue-600 bg-blue-100/70 px-1.5 py-0.5 rounded-full">
                                                    x{category.weight}
                                                  </Badge>
                                                </h5>
                                                <div className="flex items-center gap-1">
                                                  <span className={`text-xs font-semibold ${
                                                    score >= 7 ? 'text-green-600' : 
                                                    score >= 4 ? 'text-blue-600' : 
                                                    'text-amber-600'
                                                  }`}>
                                                    {formatScore(score)}
                                                  </span>
                                                  <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${
                                                    isExpanded ? "transform rotate-90" : ""
                                                  }`} />
                                                </div>
                                              </div>
                                              
                                              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                                <motion.div 
                                                  className={`h-full rounded-full ${
                                                    score >= 7 ? 'bg-green-500' : 
                                                    score >= 4 ? 'bg-blue-500' : 
                                                    'bg-amber-500'
                                                  }`}
                                                  initial={{ width: '0%' }}
                                                  animate={{ width: `${(score / 10) * 100}%` }}
                                                  transition={{ duration: 0.5 }}
                                                />
                                              </div>
                                              
                                              <AnimatePresence>
                                                {isExpanded && (
                                                  <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden mt-2"
                                                  >
                                                    <p className="text-sm text-gray-600 leading-relaxed">
                                                      {reasoning}
                                                    </p>
                                                  </motion.div>
                                                )}
                                              </AnimatePresence>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-2 italic text-center">
                            Click on a category to see the detailed reasoning
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-blue-200 border-t-transparent rounded-full mb-4"
                  />
                  <p className="text-gray-500">Loading comparison results...</p>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div className="flex space-x-3">
                {isAuthenticated && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setShowHistoryDialog(true)}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50 flex items-center gap-2"
                    >
                      <History className="h-4 w-4" />
                      <span>History</span>
                    </Button>
                    <Button
                      variant="outline" 
                      onClick={() => {
                        // Generate default name before opening dialog
                        if (!comparisonName && comparisonResults) {
                          const colleges = comparisonResults.colleges;
                          const collegeNames = colleges.slice(0, 2).map(c => c.name.split(' ')[0]);
                          if (colleges.length > 2) {
                            collegeNames.push(`+${colleges.length - 2} more`);
                          }
                          setComparisonName(`Comparison: ${collegeNames.join(', ')}`);
                        }
                        setSaveDialogOpen(true);
                      }}
                      className="text-green-600 border-green-200 hover:bg-green-50 flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save</span>
                    </Button>
                  </>
                )}
                <Button
                  onClick={exportToExcel}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Export to Excel</span>
                </Button>
                <Button
                  onClick={resetComparison}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Start New Comparison
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Comparison Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Comparison</DialogTitle>
            <DialogDescription>
              Save this comparison to access it later.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-4 py-4">
            <div className="flex flex-col space-y-2">
              <label htmlFor="comparison-name" className="text-sm font-medium">
                Comparison Name
              </label>
              <Input
                id="comparison-name"
                placeholder="Enter a name for this comparison"
                value={comparisonName}
                onChange={(e) => setComparisonName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveComparison} disabled={!isAuthenticated}>
              <Save className="h-4 w-4 mr-2" />
              Save Comparison
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Comparison History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <History className="h-5 w-5 mr-2 text-blue-600" />
              Comparison History
            </DialogTitle>
            <DialogDescription>
              View and load your previously saved comparisons.
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar py-2">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full"
                />
                <span className="ml-3 text-gray-500">Loading comparisons...</span>
              </div>
            ) : comparisonHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <History className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No saved comparisons</p>
                <p className="text-sm mt-1">Your saved comparisons will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {comparisonHistory.map((comparison) => (
                  <div 
                    key={comparison.id}
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-blue-200 hover:bg-blue-50/20 transition-colors group"
                  >
                    <div className="flex-grow">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-blue-600 mr-2" />
                        <h4 className="font-medium text-gray-900">{comparison.name}</h4>
                      </div>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-500">
                          {new Date(comparison.createdAt).toLocaleDateString()} • 
                          {comparison.colleges.length} colleges • 
                          {comparison.categories.length} categories
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => loadComparison(comparison)}
                            >
                              <ArrowRight className="h-4 w-4 text-blue-600" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Load comparison</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => deleteComparison(comparison.id)}
                            >
                              <Trash className="h-4 w-4 text-red-500" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete comparison</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 