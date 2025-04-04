"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { CollegeCard } from "@/components/college-card";
import { Loader2, ArrowRight, X, Building2, ChevronRight, ArrowLeft, ChevronLeft, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

// Default college images for when the API doesn't provide images
const DEFAULT_COLLEGE_IMAGES = [
  "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1532649538693-f3a2ec1bf8bd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1512813195386-6cf811ad3542?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1554558544-7873221d9080?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
];

export function CollegeCompare({ college, onSelectCollege }) {
  const [isLoading, setIsLoading] = useState(false);
  const [similarColleges, setSimilarColleges] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCollegeIndex, setSelectedCollegeIndex] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState(null);
  
  const handleCompareClick = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Make a real API call to the compare endpoint
      const response = await fetch('/api/colleges/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          college_id: college.id,
          limit: 3 // Request 3 similar colleges
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch similar colleges');
      }
      
      const data = await response.json();
      
      // Transform the data to match our component's expected format
      const transformedColleges = data.similar_colleges.map((college, index) => {
        // Determine which tuition to use - prefer out-of-state if available
        const tuitionValue = college.tuition?.out_of_state || 
                             college.tuition?.in_state || 
                             40000; // Default fallback
        
        // Extract SAT scores from nested structure
        const satMathAvg = college.test_scores?.sat_math?.percentile_50th || 650;
        const satVerbalAvg = college.test_scores?.sat_reading_writing?.percentile_50th || 650;
        
        return {
          id: college.id,
          name: college.name,
          state: college.state || "",
          type: college.type || "University",
          acceptanceRate: college.acceptance_rate || 0.5,
          tuition: tuitionValue,
          satMathAvg: satMathAvg,
          satVerbalAvg: satVerbalAvg,
          similarityScore: college.similarity_score,
          matchReason: college.match_reason,
          // Assign a default image since the backend doesn't provide one
          image: DEFAULT_COLLEGE_IMAGES[index % DEFAULT_COLLEGE_IMAGES.length]
        };
      });
      
      setSimilarColleges(transformedColleges);
      setIsLoading(false);
      
    } catch (error) {
      console.error("Error fetching similar colleges:", error);
      setError(error.message);
      setIsLoading(false);
    }
  };
  
  const openDialog = () => {
    setIsDialogOpen(true);
    handleCompareClick();
    setSelectedCollegeIndex(null);
    setShowDetails(false);
  };

  const handleSelectCard = (index) => {
    setSelectedCollegeIndex(index);
    setShowDetails(true);
  };

  const handleBackToCards = () => {
    setShowDetails(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          onClick={openDialog}
          className="relative overflow-hidden w-full group bg-gradient-to-r from-[#4068ec] to-[#63D2FF] text-white border-0 rounded-lg px-4 py-3 transition-all duration-300 ease-in-out transform hover:scale-[1.02] shadow-md"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#4068ec]/20 to-[#63D2FF]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
          <span className="flex items-center justify-center gap-2 relative z-10 font-medium">
            <Building2 className="w-4 h-4 flex-shrink-0" />
            Find Similar Colleges
          </span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[950px] max-h-[90vh] p-0 bg-white dark:bg-gray-900 border-0 rounded-xl overflow-hidden shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-2 border-b border-gray-100 dark:border-gray-800">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#4068ec] to-[#63D2FF] bg-clip-text text-transparent">
            Colleges Similar to {college.name || "Selected College"}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Explore institutions with comparable characteristics
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center p-12 h-[50vh]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="absolute -inset-10 bg-gradient-to-r from-[#4068ec]/10 to-[#63D2FF]/10 blur-3xl rounded-full opacity-70"></div>
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 mb-6 rounded-full bg-gradient-to-r from-[#4068ec]/10 to-[#63D2FF]/10">
                <Building2 className="w-10 h-10 text-[#4068ec]" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#4068ec] to-[#63D2FF] bg-clip-text text-transparent mb-4">
                Coming Soon
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
                We're building an advanced college comparison tool to help you discover institutions similar to {college.name}. Check back soon!
              </p>
              <div className="w-full max-w-md h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2">
                <motion.div 
                  className="h-full bg-gradient-to-r from-[#4068ec] to-[#63D2FF]"
                  initial={{ width: "20%" }}
                  animate={{ width: "70%" }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-500">Development in progress - 70%</p>
            </div>
          </motion.div>
        </div>
        
        <DialogFooter className="sticky bottom-0 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <Button 
            variant="outline" 
            onClick={() => setIsDialogOpen(false)}
            className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:text-red-400 dark:hover:border-red-800/30 transition-colors"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 