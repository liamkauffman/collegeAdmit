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

export function CollegeCompare({ college, onSelectCollege }) {
  const [isLoading, setIsLoading] = useState(false);
  const [similarColleges, setSimilarColleges] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCollegeIndex, setSelectedCollegeIndex] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const handleCompareClick = async () => {
    setIsLoading(true);
    
    try {
      // Simulating API call with setTimeout for now
      // In production, this would be replaced with an actual API call
      setTimeout(() => {
        // Mock data - replace this with actual API call
        const mockSimilarColleges = [
          {
            id: "similar1",
            name: college.name ? college.name.replace("University", "College") : "Similar College 1",
            state: college.state || "NY",
            type: college.type || "Private Liberal Arts College",
            acceptanceRate: (college.acceptanceRate ? college.acceptanceRate * 1.2 : 0.35),
            tuition: college.tuition ? Math.round(college.tuition * 0.8) : 35000,
            satMathAvg: college.satMathAvg ? Math.min(800, college.satMathAvg + 30) : 680,
            satVerbalAvg: college.satVerbalAvg ? Math.min(800, college.satVerbalAvg + 20) : 690,
            similarityScore: 92,
            matchReason: "Academic Profile, Location, Size",
            image: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
          },
          {
            id: "similar2",
            name: college.name ? "New " + college.name : "Similar College 2",
            state: college.state || "MA",
            type: college.type || "Public Research University",
            acceptanceRate: (college.acceptanceRate ? college.acceptanceRate * 1.5 : 0.42),
            tuition: college.tuition ? Math.round(college.tuition * 0.7) : 32000,
            satMathAvg: college.satMathAvg ? Math.max(400, college.satMathAvg - 40) : 630,
            satVerbalAvg: college.satVerbalAvg ? Math.max(400, college.satVerbalAvg - 30) : 650,
            similarityScore: 87,
            matchReason: "Cost, Academic Programs, Student Life",
            image: "https://images.unsplash.com/photo-1532649538693-f3a2ec1bf8bd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
          },
          {
            id: "similar3",
            name: college.name ? college.name.replace("University", "Institute") : "Similar College 3",
            state: college.state ? (college.state === "NY" ? "CT" : "NH") : "CA",
            type: college.type || "Private Research University",
            acceptanceRate: (college.acceptanceRate ? college.acceptanceRate * 0.9 : 0.28),
            tuition: college.tuition ? Math.round(college.tuition * 1.1) : 42000,
            satMathAvg: college.satMathAvg ? Math.min(800, college.satMathAvg + 50) : 720,
            satVerbalAvg: college.satVerbalAvg ? Math.min(800, college.satVerbalAvg + 40) : 710,
            similarityScore: 81,
            matchReason: "Research Opportunities, Career Outcomes",
            image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
          }
        ];
        
        setSimilarColleges(mockSimilarColleges);
        setIsLoading(false);
      }, 1500);
      
    } catch (error) {
      console.error("Error fetching similar colleges:", error);
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
        
        <ScrollArea className="max-h-[calc(100vh-16rem)] overflow-y-auto pb-16">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-[50vh]"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#4068ec]/20 to-[#63D2FF]/20 blur-xl rounded-full"></div>
                    <Loader2 className="h-12 w-12 animate-spin text-[#4068ec] dark:text-[#63D2FF] relative z-10" />
                  </div>
                  <p className="text-lg text-gray-600 dark:text-gray-400 animate-pulse mt-4">
                    Finding similar colleges...
                  </p>
                </div>
              </motion.div>
            ) : showDetails && selectedCollegeIndex !== null ? (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="p-6"
              >
                <button 
                  onClick={handleBackToCards}
                  className="flex items-center text-[#4068ec] dark:text-[#63D2FF] mb-4 hover:underline"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Back to all colleges
                </button>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="rounded-xl overflow-hidden shadow-lg">
                    <div className="relative h-48">
                      <div className="absolute inset-0 bg-black/30 z-10"></div>
                      <img 
                        src={similarColleges[selectedCollegeIndex].image} 
                        alt={similarColleges[selectedCollegeIndex].name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4 z-20">
                        <Badge className="bg-gradient-to-r from-[#4068ec] to-[#63D2FF] text-white border-0 py-1.5 px-3">
                          {similarColleges[selectedCollegeIndex].similarityScore}% Match
                        </Badge>
                      </div>
                      <h2 className="absolute bottom-4 left-4 text-white text-2xl font-bold z-20 drop-shadow-md">
                        {similarColleges[selectedCollegeIndex].name}
                      </h2>
                    </div>
                    
                    <div className="p-5 bg-white dark:bg-gray-800">
                      <div className="flex items-center mb-3">
                        <span className="text-gray-600 dark:text-gray-300">
                          {similarColleges[selectedCollegeIndex].state} • {similarColleges[selectedCollegeIndex].type}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-5">
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                          <div className="text-sm text-gray-500 dark:text-gray-400">Acceptance Rate</div>
                          <div className="text-xl font-bold text-gray-900 dark:text-white">
                            {(similarColleges[selectedCollegeIndex].acceptanceRate * 100).toFixed(1)}%
                          </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                          <div className="text-sm text-gray-500 dark:text-gray-400">Tuition</div>
                          <div className="text-xl font-bold text-gray-900 dark:text-white">
                            ${similarColleges[selectedCollegeIndex].tuition.toLocaleString()}
                          </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                          <div className="text-sm text-gray-500 dark:text-gray-400">SAT Math</div>
                          <div className="text-xl font-bold text-gray-900 dark:text-white">
                            {similarColleges[selectedCollegeIndex].satMathAvg}
                          </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                          <div className="text-sm text-gray-500 dark:text-gray-400">SAT Verbal</div>
                          <div className="text-xl font-bold text-gray-900 dark:text-white">
                            {similarColleges[selectedCollegeIndex].satVerbalAvg}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        Why {similarColleges[selectedCollegeIndex].name} is similar
                      </h3>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/30">
                        <div className="text-[#4068ec] dark:text-[#63D2FF] font-medium">
                          Similar in: {similarColleges[selectedCollegeIndex].matchReason}
                        </div>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                          Based on our analysis, this institution shares key characteristics with your selected college in terms of academic offerings, campus culture, and student outcomes.
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">About This College</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {similarColleges[selectedCollegeIndex].name} is known for its excellent programs and vibrant campus life. With a {(similarColleges[selectedCollegeIndex].acceptanceRate * 100).toFixed(1)}% acceptance rate, the institution maintains high academic standards while offering diverse opportunities for student growth and development.
                      </p>
                      
                      <Button 
                        onClick={() => {
                          onSelectCollege(similarColleges[selectedCollegeIndex]);
                          setIsDialogOpen(false);
                        }}
                        className="w-full bg-gradient-to-r from-[#4068ec] to-[#63D2FF] hover:from-[#4068ec]/90 hover:to-[#63D2FF]/90 text-white py-2.5 rounded-lg shadow transition-all duration-300"
                      >
                        View College Profile
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="cards"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-6 py-4"
              >
                
                <div className="w-full bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 mb-6 backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/30">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Currently Viewing</h3>
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="font-semibold text-xl text-[#4068ec] dark:text-[#63D2FF]">
                        {college.name || "Selected College"}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{college.state || ""}</span>
                        {college.type && (
                          <span className="text-sm text-gray-600 dark:text-gray-400">• {college.type}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6 mb-4">
                  {similarColleges.map((similarCollege, index) => (
                    <motion.div
                      key={similarCollege.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.15 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      onClick={() => handleSelectCard(index)}
                      className="rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-md hover:shadow-lg cursor-pointer transition-all duration-300"
                    >
                      <div className="relative h-40">
                        <div className="absolute inset-0 bg-black/30 z-10"></div>
                        <img 
                          src={similarCollege.image} 
                          alt={similarCollege.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 right-3 z-20">
                          <Badge className="bg-gradient-to-r from-[#4068ec] to-[#63D2FF] text-white border-0 py-1 px-2.5">
                            {similarCollege.similarityScore}% Match
                          </Badge>
                        </div>
                        <h3 className="absolute bottom-3 left-3 text-white text-xl font-bold z-20 drop-shadow-md">
                          {similarCollege.name}
                        </h3>
                      </div>
                      
                      <div className="p-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {similarCollege.state} • {similarCollege.type}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Acceptance:</div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {(similarCollege.acceptanceRate * 100).toFixed(1)}%
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Tuition:</div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              ${similarCollege.tuition.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 text-xs">
                          <span className="text-gray-500 dark:text-gray-400">Similar in: </span>
                          <span className="text-[#4068ec] dark:text-[#63D2FF] font-medium">
                            {similarCollege.matchReason}
                          </span>
                        </div>
                        
                        <div className="flex justify-center mt-3">
                          <div className="flex items-center gap-1 text-[#4068ec] dark:text-[#63D2FF] text-sm font-medium">
                            View Details
                            <ChevronRight className="h-3 w-3" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>
        
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