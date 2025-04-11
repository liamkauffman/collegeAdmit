"use client";

import { useState } from "react";
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
import { Building2, AlertCircle, Info } from "lucide-react";
import { motion } from "framer-motion";

// Real college ID for Brown University
const COLLEGE_ID = "217156";

export function TestCollegeCompare() {
  const [isLoading, setIsLoading] = useState(false);
  const [baseCollege, setBaseCollege] = useState(null);
  const [similarColleges, setSimilarColleges] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState(null);
  
  const handleCompareClick = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Make a real API call to the compare endpoint with a real college ID
      const response = await fetch('/api/colleges/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          college_id: COLLEGE_ID,
          limit: 5 // Request 5 similar colleges
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch similar colleges');
      }
      
      const data = await response.json();
      console.log("Comparison API response:", data);
      
      setBaseCollege(data.base_college || null);
      setSimilarColleges(data.similar_colleges || []);
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
  };

  // Format acceptance rate as percentage
  const formatAcceptanceRate = (rate) => {
    if (rate === undefined || rate === null) return "N/A";
    return `${(rate * 100).toFixed(1)}%`;
  };

  // Format tuition cost as currency
  const formatTuition = (tuition) => {
    if (!tuition) return "N/A";
    const value = tuition.out_of_state || tuition.in_state;
    if (!value) return "N/A";
    return `$${value.toLocaleString()}`;
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          onClick={openDialog}
          variant="outline"
          className="w-full text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <span className="flex items-center justify-center gap-2 font-medium">
            <Building2 className="w-4 h-4 flex-shrink-0" />
            Test College Compare
          </span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[950px] max-h-[90vh] p-0 bg-white dark:bg-gray-900 border-0 rounded-xl overflow-hidden shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-2 border-b border-gray-100 dark:border-gray-800">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
            College Comparison Test
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Testing the college comparison API with Brown University (ID: {COLLEGE_ID})
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col p-6 space-y-6 overflow-auto max-h-[70vh]">
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h3 className="font-semibold flex items-center gap-2 text-amber-700 mb-2">
              <Info className="w-5 h-5" />
              Test with Real Data
            </h3>
            <p className="text-amber-700">
              This test uses Brown University (ID: {COLLEGE_ID}) as the base college for comparison.
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-t-2 border-b-2 border-amber-500 rounded-full"
              />
              <p className="mt-4 text-gray-600">Loading comparison data...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 rounded-lg text-red-700 border border-red-200">
              <h3 className="font-semibold mb-2">Error</h3>
              <p>{error}</p>
            </div>
          ) : (
            <>
              {/* Base College Section */}
              {baseCollege && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 text-lg">Base College:</h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Building2 className="w-5 h-5 text-blue-700" />
                      </div>
                      <h4 className="text-xl font-semibold text-blue-900">{baseCollege.name}</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-3 rounded-lg border border-blue-100">
                        <p className="text-xs text-blue-500 uppercase font-medium">Location</p>
                        <p className="text-blue-900 font-medium">{baseCollege.state || 'N/A'}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-blue-100">
                        <p className="text-xs text-blue-500 uppercase font-medium">Type</p>
                        <p className="text-blue-900 font-medium">{baseCollege.type || 'N/A'}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-blue-100">
                        <p className="text-xs text-blue-500 uppercase font-medium">Acceptance Rate</p>
                        <p className="text-blue-900 font-medium">{formatAcceptanceRate(baseCollege.acceptance_rate)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Similar Colleges Section */}
              {similarColleges.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 text-lg">Similar Colleges:</h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">College</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acceptance</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tuition</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Similarity</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {similarColleges.map((college, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{college.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{college.state || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{college.type || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatAcceptanceRate(college.acceptance_rate)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatTuition(college.tuition)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                  <div 
                                    className="bg-amber-500 h-2 rounded-full" 
                                    style={{ width: `${college.similarity_score || 0}%` }}
                                  ></div>
                                </div>
                                <span>{college.similarity_score ? `${college.similarity_score.toFixed(0)}%` : 'N/A'}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Match Reasons Section */}
                  <div className="mt-6 space-y-4">
                    <h3 className="font-semibold text-gray-800">Match Reasons:</h3>
                    <div className="space-y-3">
                      {similarColleges.map((college, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <h4 className="font-medium text-gray-800 mb-1">{college.name}</h4>
                          <p className="text-sm text-gray-600">{college.match_reason || 'No match reason provided'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : !isLoading && (
                <div className="p-6 bg-gray-50 rounded-lg text-gray-700 border border-gray-200 text-center">
                  <p>No comparison data available yet.</p>
                </div>
              )}
            </>
          )}
        </div>
        
        <DialogFooter className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <Button 
            variant="outline" 
            onClick={() => setIsDialogOpen(false)}
            className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
          >
            Close
          </Button>
          <Button 
            onClick={handleCompareClick}
            className="bg-amber-500 hover:bg-amber-600 text-white"
            disabled={isLoading}
          >
            Retry Test
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 