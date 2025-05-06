"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { Search, X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Application types
const applicationTypes = [
  "RD", // Regular Decision
  "EA", // Early Action
  "ED", // Early Decision
  "Rolling", // Rolling Admission
  "Priority", // Priority
];

// Essay status options
const essayStatusOptions = [
  "Not Started",
  "Drafting",
  "In Progress",
  "Reviewing",
  "Ready to Submit",
  "Drafts Done",
  "Completed",
  "Submitted",
];

// School category options
const schoolCategoryOptions = [
  "Safety",
  "Target",
  "Reach",
  "Hard Reach",
  "Hard Target",
];

// Application decision options
const decisionOptions = [
  "Not Applied Yet",
  "Applied",
  "Pending Decision",
  "Accepted",
  "Accepted + Scholarship",
  "Rejected",
  "Waitlisted",
  "Deferred",
];

// Initial college state
const initialCollegeState = {
  collegeName: "",
  deadline: "",
  applicationType: "RD",
  mainEssay: "Not Started",
  category: "Target",
  decision: "Not Applied Yet",
  supplements: [],
};

export function AddEditCollegeDialog({ 
  open, 
  onOpenChange, 
  onSave, 
  college = null, 
  mode = "add" 
}) {
  // State for college form data
  const [formData, setFormData] = useState(initialCollegeState);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);

  // Set form data when editing an existing college
  useEffect(() => {
    if (mode === "edit" && college) {
      setFormData({
        ...initialCollegeState,
        ...college,
      });
    } else {
      setFormData(initialCollegeState);
    }
  }, [college, mode, open]);

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
        limit: 10
      });
      
      // The API returns an array directly
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

  // Select a college from search results
  const selectCollege = (college) => {
    setFormData({
      ...formData,
      collegeName: college.name,
      collegeId: college.id, // Store the college ID
      // Pre-populate other fields based on college data if available
      state: college.state || "",
      type: college.type || "",
      acceptance_rate: college.acceptance_rate,
      tuition: college.tuition
    });
    
    setSearchQuery("");
    setSearchResults([]);
  };

  // Handle input change
  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    
    // Make sure we have the required fields
    if (!formData.collegeName.trim()) {
      alert("College name is required");
      return;
    }
    
    // If editing, preserve the ID
    const dataToSave = mode === "edit" 
      ? { ...formData, id: college.id } 
      : { ...formData };
    
    onSave(dataToSave);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add New College" : "Edit College"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4">
            {mode === "add" ? (
              <div className="space-y-2">
                <div className="relative">
                  <Label htmlFor="collegeSearch">Search for a College</Label>
                  <div className="mt-1.5 relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Search className="h-4 w-4" />
                    </div>
                    <Input
                      id="collegeSearch"
                      placeholder="Search by college name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    {isSearching ? (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"
                        />
                      </div>
                    ) : searchQuery ? (
                      <button 
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>

                  {/* Helpful hint */}
                  <p className="text-xs text-gray-500 mt-1.5 ml-1">
                    Type at least 2 characters to search
                  </p>
                </div>
                
                {/* Search results */}
                <AnimatePresence>
                  {searchQuery.trim().length >= 2 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="border border-gray-200 rounded-md shadow-md mt-1 overflow-hidden max-h-60 overflow-y-auto bg-white z-10"
                    >
                      {isSearching ? (
                        <div className="p-4 text-center text-gray-500">
                          <motion.div 
                            className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          <p>Searching...</p>
                        </div>
                      ) : error ? (
                        <div className="p-4 text-center text-red-600">
                          <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                          <p className="text-sm">{error}</p>
                        </div>
                      ) : searchResults.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          <p>No colleges found</p>
                        </div>
                      ) : (
                        <div>
                          {searchResults.map((college, index) => (
                            <div
                              key={college.id}
                              onClick={() => selectCollege(college)}
                              className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium">{college.name}</div>
                              <div className="text-sm text-gray-500 flex items-center gap-2">
                                {college.state && <span>{college.state}</span>}
                                {college.type && (
                                  <span className="flex items-center">
                                    <span className="w-1 h-1 bg-gray-300 rounded-full mx-1"></span>
                                    <span>{college.type}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Selected college display */}
                {formData.collegeName && !searchQuery && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-blue-800">{formData.collegeName}</h4>
                        <div className="text-sm text-gray-600 mt-1">
                          {formData.state && <span>{formData.state}</span>}
                          {formData.type && (
                            <span className="ml-2">{formData.type}</span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({...formData, collegeName: ""});
                          setSearchQuery("");
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="collegeName">College Name</Label>
                <Input
                  id="collegeName"
                  value={formData.collegeName}
                  onChange={(e) => handleChange("collegeName", e.target.value)}
                  placeholder="Enter college name"
                  required
                />
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="deadline">Application Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => handleChange("deadline", e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="applicationType">Application Type</Label>
                <Select
                  value={formData.applicationType}
                  onValueChange={(value) => handleChange("applicationType", value)}
                >
                  <SelectTrigger id="applicationType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {applicationTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="mainEssay">Main Essay Progress</Label>
                <Select
                  value={formData.mainEssay}
                  onValueChange={(value) => handleChange("mainEssay", value)}
                >
                  <SelectTrigger id="mainEssay">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {essayStatusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">School Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleChange("category", value)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {schoolCategoryOptions.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="decision">Application Decision</Label>
                <Select
                  value={formData.decision}
                  onValueChange={(value) => handleChange("decision", value)}
                >
                  <SelectTrigger id="decision">
                    <SelectValue placeholder="Select decision" />
                  </SelectTrigger>
                  <SelectContent>
                    {decisionOptions.map((decision) => (
                      <SelectItem key={decision} value={decision}>
                        {decision}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mode === "add" && !formData.collegeName}>
              {mode === "add" ? "Add College" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 