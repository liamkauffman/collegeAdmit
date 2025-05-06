"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash, Save, Edit, Check } from "lucide-react";

// Status options for different tasks
const taskStatusOptions = {
  supplements: [
    "Not Started",
    "Drafting",
    "In Progress",
    "Reviewing",
    "Completed",
    "Submitted",
  ],
  recommendations: [
    "Not Requested",
    "Requested",
    "In Progress",
    "Submitted by Recommender",
    "Confirmed Received by College",
  ],
  tests: [
    "Not Taken",
    "Scheduled",
    "Taken",
    "Scores Received",
    "Scores Sent",
    "Scores Received by College",
  ],
  transcripts: [
    "Not Requested",
    "Requested from School",
    "In Progress",
    "Sent",
    "Confirmed Received by College",
  ],
  applicationFee: [
    "Not Paid",
    "Paid",
    "Fee Waiver Requested",
    "Fee Waiver Approved",
  ],
  interview: [
    "Not Offered",
    "Offered",
    "Scheduled",
    "Completed",
  ],
  financialAid: [
    "Not Started",
    "FAFSA In Progress",
    "FAFSA Submitted",
    "CSS Profile In Progress",
    "CSS Profile Submitted",
    "All Forms Submitted",
  ],
  portfolio: [
    "Not Required",
    "Not Started",
    "In Progress",
    "Completed",
    "Submitted",
  ],
};

// Initialize an empty tracking object
const initialTrackingState = {
  supplements: [],
  recommendations: [],
  standardizedTests: [],
  transcriptStatus: "Not Requested",
  applicationFeeStatus: "Not Paid",
  interviewStatus: "Not Offered",
  financialAidStatus: "Not Started",
  portfolioStatus: "Not Required",
  customTasks: [],
};

export function DetailedTrackingDialog({
  open,
  onOpenChange,
  college,
  onUpdateSupplements,
  onUpdateTracking,
}) {
  // State for the supplements and tracking info
  const [supplements, setSupplements] = useState([]);
  const [newSupplement, setNewSupplement] = useState({ title: "", prompt: "", status: "Not Started" });
  const [recommendations, setRecommendations] = useState([]);
  const [newRecommendation, setNewRecommendation] = useState({ recommender: "", status: "Not Requested" });
  const [standardizedTests, setStandardizedTests] = useState([]);
  const [newTest, setNewTest] = useState({ testName: "", score: "", status: "Not Taken" });
  const [customTasks, setCustomTasks] = useState([]);
  const [newCustomTask, setNewCustomTask] = useState({ taskName: "", status: "Not Started" });
  const [trackingDetails, setTrackingDetails] = useState(initialTrackingState);
  const [activeTab, setActiveTab] = useState("supplements");
  const [isAddingSupp, setIsAddingSupp] = useState(false);
  const [isAddingRec, setIsAddingRec] = useState(false);
  const [isAddingTest, setIsAddingTest] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);

  // Load data when the dialog opens
  useEffect(() => {
    if (college) {
      setSupplements(college.supplements || []);
      setRecommendations(college.recommendations || []);
      setStandardizedTests(college.standardizedTests || []);
      setCustomTasks(college.customTasks || []);
      
      setTrackingDetails({
        transcriptStatus: college.transcriptStatus || "Not Requested",
        applicationFeeStatus: college.applicationFeeStatus || "Not Paid",
        interviewStatus: college.interviewStatus || "Not Offered",
        financialAidStatus: college.financialAidStatus || "Not Started",
        portfolioStatus: college.portfolioStatus || "Not Required",
      });
    }
  }, [college, open]);

  // Handle saving all tracking information
  const handleSave = () => {
    // Save supplements
    onUpdateSupplements(supplements);
    
    // Save other tracking information
    onUpdateTracking({
      recommendations,
      standardizedTests,
      customTasks,
      ...trackingDetails,
    });
    
    onOpenChange(false);
  };

  // Handle adding a new supplement
  const handleAddSupplement = () => {
    if (!newSupplement.title.trim()) {
      alert("Supplement title is required");
      return;
    }
    
    setSupplements([...supplements, { ...newSupplement, id: Date.now().toString() }]);
    setNewSupplement({ title: "", prompt: "", status: "Not Started" });
    setIsAddingSupp(false);
  };

  // Handle deleting a supplement
  const handleDeleteSupplement = (id) => {
    setSupplements(supplements.filter(supp => supp.id !== id));
  };

  // Handle updating a supplement status
  const handleSupplementStatusChange = (id, status) => {
    setSupplements(
      supplements.map(supp => 
        supp.id === id ? { ...supp, status } : supp
      )
    );
  };

  // Handle adding a new recommendation
  const handleAddRecommendation = () => {
    if (!newRecommendation.recommender.trim()) {
      alert("Recommender name is required");
      return;
    }
    
    setRecommendations([...recommendations, { ...newRecommendation, id: Date.now().toString() }]);
    setNewRecommendation({ recommender: "", status: "Not Requested" });
    setIsAddingRec(false);
  };

  // Handle deleting a recommendation
  const handleDeleteRecommendation = (id) => {
    setRecommendations(recommendations.filter(rec => rec.id !== id));
  };

  // Handle updating a recommendation status
  const handleRecommendationStatusChange = (id, status) => {
    setRecommendations(
      recommendations.map(rec => 
        rec.id === id ? { ...rec, status } : rec
      )
    );
  };

  // Handle adding a new test
  const handleAddTest = () => {
    if (!newTest.testName.trim()) {
      alert("Test name is required");
      return;
    }
    
    setStandardizedTests([...standardizedTests, { ...newTest, id: Date.now().toString() }]);
    setNewTest({ testName: "", score: "", status: "Not Taken" });
    setIsAddingTest(false);
  };

  // Handle deleting a test
  const handleDeleteTest = (id) => {
    setStandardizedTests(standardizedTests.filter(test => test.id !== id));
  };

  // Handle adding a new custom task
  const handleAddCustomTask = () => {
    if (!newCustomTask.taskName.trim()) {
      alert("Task name is required");
      return;
    }
    
    setCustomTasks([...customTasks, { ...newCustomTask, id: Date.now().toString() }]);
    setNewCustomTask({ taskName: "", status: "Not Started" });
    setIsAddingTask(false);
  };

  // Handle deleting a custom task
  const handleDeleteCustomTask = (id) => {
    setCustomTasks(customTasks.filter(task => task.id !== id));
  };

  // Handle updating tracking detail status
  const handleTrackingStatusChange = (field, value) => {
    setTrackingDetails({
      ...trackingDetails,
      [field]: value,
    });
  };

  // Status badge color based on status
  const getStatusBadgeColor = (status) => {
    if (status.includes("Not") || status === "Scheduled") return "bg-gray-200 text-gray-800";
    if (status.includes("Requested") || status === "Offered") return "bg-blue-200 text-blue-800";
    if (status.includes("In Progress")) return "bg-yellow-200 text-yellow-800";
    if (status.includes("Completed") || status.includes("Submitted") || status.includes("Confirmed") || status.includes("Approved") || status.includes("Sent")) 
      return "bg-green-200 text-green-800";
    return "bg-gray-200 text-gray-800";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {college ? `Application Details: ${college.collegeName}` : "Application Details"}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="supplements" value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="supplements">Supplements</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="custom">Additional Tasks</TabsTrigger>
          </TabsList>
          
          {/* Supplements Tab */}
          <TabsContent value="supplements">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Supplemental Essays</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsAddingSupp(true)}
                  className="text-xs"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Supplement
                </Button>
              </div>
              
              {/* Add New Supplement Form */}
              {isAddingSupp && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">New Supplemental Essay</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid gap-2">
                      <Label htmlFor="suppTitle">Title/Name</Label>
                      <Input
                        id="suppTitle"
                        value={newSupplement.title}
                        onChange={(e) => setNewSupplement({ ...newSupplement, title: e.target.value })}
                        placeholder="e.g., Why This College"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="suppPrompt">Essay Prompt (Optional)</Label>
                      <Textarea
                        id="suppPrompt"
                        value={newSupplement.prompt}
                        onChange={(e) => setNewSupplement({ ...newSupplement, prompt: e.target.value })}
                        placeholder="Enter the essay prompt"
                        rows={3}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="suppStatus">Status</Label>
                      <Select
                        value={newSupplement.status}
                        onValueChange={(value) => setNewSupplement({ ...newSupplement, status: value })}
                      >
                        <SelectTrigger id="suppStatus">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {taskStatusOptions.supplements.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsAddingSupp(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleAddSupplement}
                    >
                      <Save className="h-3.5 w-3.5 mr-1" />
                      Save
                    </Button>
                  </CardFooter>
                </Card>
              )}
              
              {/* Supplements List */}
              {supplements.length > 0 ? (
                <div className="space-y-3">
                  {supplements.map((supp) => (
                    <Card key={supp.id} className="relative">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-sm">{supp.title}</CardTitle>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 absolute top-2 right-2 text-red-600 hover:text-red-800"
                            onClick={() => handleDeleteSupplement(supp.id)}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                        <Badge className={`font-medium ${getStatusBadgeColor(supp.status)}`}>
                          {supp.status}
                        </Badge>
                      </CardHeader>
                      {supp.prompt && (
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground">{supp.prompt}</p>
                        </CardContent>
                      )}
                      <CardFooter className="flex justify-end">
                        <Select
                          value={supp.status}
                          onValueChange={(value) => handleSupplementStatusChange(supp.id, value)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Change status" />
                          </SelectTrigger>
                          <SelectContent>
                            {taskStatusOptions.supplements.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No supplemental essays added.</p>
                  <Button 
                    variant="link" 
                    onClick={() => setIsAddingSupp(true)}
                    className="mt-2"
                  >
                    Add your first supplement
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Recommendations Tab */}
          <TabsContent value="recommendations">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Letters of Recommendation</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsAddingRec(true)}
                  className="text-xs"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Recommender
                </Button>
              </div>
              
              {/* Add New Recommendation Form */}
              {isAddingRec && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">New Recommender</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid gap-2">
                      <Label htmlFor="recName">Recommender Name</Label>
                      <Input
                        id="recName"
                        value={newRecommendation.recommender}
                        onChange={(e) => setNewRecommendation({ ...newRecommendation, recommender: e.target.value })}
                        placeholder="e.g., Ms. Smith"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="recStatus">Status</Label>
                      <Select
                        value={newRecommendation.status}
                        onValueChange={(value) => setNewRecommendation({ ...newRecommendation, status: value })}
                      >
                        <SelectTrigger id="recStatus">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {taskStatusOptions.recommendations.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsAddingRec(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleAddRecommendation}
                    >
                      <Save className="h-3.5 w-3.5 mr-1" />
                      Save
                    </Button>
                  </CardFooter>
                </Card>
              )}
              
              {/* Recommendations List */}
              {recommendations.length > 0 ? (
                <div className="space-y-3">
                  {recommendations.map((rec) => (
                    <Card key={rec.id} className="relative">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-sm">{rec.recommender}</CardTitle>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 absolute top-2 right-2 text-red-600 hover:text-red-800"
                            onClick={() => handleDeleteRecommendation(rec.id)}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                        <Badge className={`font-medium ${getStatusBadgeColor(rec.status)}`}>
                          {rec.status}
                        </Badge>
                      </CardHeader>
                      <CardFooter className="flex justify-end">
                        <Select
                          value={rec.status}
                          onValueChange={(value) => handleRecommendationStatusChange(rec.id, value)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Change status" />
                          </SelectTrigger>
                          <SelectContent>
                            {taskStatusOptions.recommendations.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No recommenders added yet.</p>
                  <Button 
                    variant="link" 
                    onClick={() => setIsAddingRec(true)}
                    className="mt-2"
                  >
                    Add your first recommender
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Documents & Requirements Tab */}
          <TabsContent value="documents">
            <div className="space-y-6">
              {/* Standardized Tests */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Standardized Tests</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsAddingTest(true)}
                    className="text-xs"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add Test
                  </Button>
                </div>
                
                {/* Add New Test Form */}
                {isAddingTest && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">New Test</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid gap-2">
                        <Label htmlFor="testName">Test Name</Label>
                        <Input
                          id="testName"
                          value={newTest.testName}
                          onChange={(e) => setNewTest({ ...newTest, testName: e.target.value })}
                          placeholder="e.g., SAT, ACT, AP Calculus"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="testScore">Score (Optional)</Label>
                        <Input
                          id="testScore"
                          value={newTest.score}
                          onChange={(e) => setNewTest({ ...newTest, score: e.target.value })}
                          placeholder="Enter score if available"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="testStatus">Status</Label>
                        <Select
                          value={newTest.status}
                          onValueChange={(value) => setNewTest({ ...newTest, status: value })}
                        >
                          <SelectTrigger id="testStatus">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {taskStatusOptions.tests.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsAddingTest(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={handleAddTest}
                      >
                        <Save className="h-3.5 w-3.5 mr-1" />
                        Save
                      </Button>
                    </CardFooter>
                  </Card>
                )}
                
                {/* Tests List */}
                {standardizedTests.length > 0 ? (
                  <div className="space-y-3">
                    {standardizedTests.map((test) => (
                      <Card key={test.id} className="relative">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-sm">{test.testName}</CardTitle>
                              {test.score && (
                                <CardDescription>Score: {test.score}</CardDescription>
                              )}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 absolute top-2 right-2 text-red-600 hover:text-red-800"
                              onClick={() => handleDeleteTest(test.id)}
                            >
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                          <Badge className={`font-medium ${getStatusBadgeColor(test.status)}`}>
                            {test.status}
                          </Badge>
                        </CardHeader>
                        <CardFooter className="flex justify-end">
                          <Select
                            value={test.status}
                            onValueChange={(value) => setStandardizedTests(
                              standardizedTests.map(t => 
                                t.id === test.id ? { ...t, status: value } : t
                              )
                            )}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Change status" />
                            </SelectTrigger>
                            <SelectContent>
                              {taskStatusOptions.tests.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-muted-foreground">No tests added yet.</p>
                    <Button 
                      variant="link" 
                      onClick={() => setIsAddingTest(true)}
                      className="mt-2"
                    >
                      Add your first test
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Other Documents & Requirements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Transcript</CardTitle>
                    <Badge className={`font-medium ${getStatusBadgeColor(trackingDetails.transcriptStatus)}`}>
                      {trackingDetails.transcriptStatus}
                    </Badge>
                  </CardHeader>
                  <CardFooter>
                    <Select
                      value={trackingDetails.transcriptStatus}
                      onValueChange={(value) => handleTrackingStatusChange("transcriptStatus", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent>
                        {taskStatusOptions.transcripts.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Application Fee</CardTitle>
                    <Badge className={`font-medium ${getStatusBadgeColor(trackingDetails.applicationFeeStatus)}`}>
                      {trackingDetails.applicationFeeStatus}
                    </Badge>
                  </CardHeader>
                  <CardFooter>
                    <Select
                      value={trackingDetails.applicationFeeStatus}
                      onValueChange={(value) => handleTrackingStatusChange("applicationFeeStatus", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent>
                        {taskStatusOptions.applicationFee.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Interview</CardTitle>
                    <Badge className={`font-medium ${getStatusBadgeColor(trackingDetails.interviewStatus)}`}>
                      {trackingDetails.interviewStatus}
                    </Badge>
                  </CardHeader>
                  <CardFooter>
                    <Select
                      value={trackingDetails.interviewStatus}
                      onValueChange={(value) => handleTrackingStatusChange("interviewStatus", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent>
                        {taskStatusOptions.interview.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Financial Aid</CardTitle>
                    <Badge className={`font-medium ${getStatusBadgeColor(trackingDetails.financialAidStatus)}`}>
                      {trackingDetails.financialAidStatus}
                    </Badge>
                  </CardHeader>
                  <CardFooter>
                    <Select
                      value={trackingDetails.financialAidStatus}
                      onValueChange={(value) => handleTrackingStatusChange("financialAidStatus", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent>
                        {taskStatusOptions.financialAid.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Portfolio</CardTitle>
                    <Badge className={`font-medium ${getStatusBadgeColor(trackingDetails.portfolioStatus)}`}>
                      {trackingDetails.portfolioStatus}
                    </Badge>
                  </CardHeader>
                  <CardFooter>
                    <Select
                      value={trackingDetails.portfolioStatus}
                      onValueChange={(value) => handleTrackingStatusChange("portfolioStatus", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent>
                        {taskStatusOptions.portfolio.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Custom Tasks Tab */}
          <TabsContent value="custom">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Custom Tasks</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsAddingTask(true)}
                  className="text-xs"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Task
                </Button>
              </div>
              
              {/* Add New Custom Task Form */}
              {isAddingTask && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">New Custom Task</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid gap-2">
                      <Label htmlFor="taskName">Task Name</Label>
                      <Input
                        id="taskName"
                        value={newCustomTask.taskName}
                        onChange={(e) => setNewCustomTask({ ...newCustomTask, taskName: e.target.value })}
                        placeholder="e.g., Submit portfolio link"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="taskStatus">Status</Label>
                      <Select
                        value={newCustomTask.status}
                        onValueChange={(value) => setNewCustomTask({ ...newCustomTask, status: value })}
                      >
                        <SelectTrigger id="taskStatus">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {taskStatusOptions.supplements.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsAddingTask(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleAddCustomTask}
                    >
                      <Save className="h-3.5 w-3.5 mr-1" />
                      Save
                    </Button>
                  </CardFooter>
                </Card>
              )}
              
              {/* Custom Tasks List */}
              {customTasks.length > 0 ? (
                <div className="space-y-3">
                  {customTasks.map((task) => (
                    <Card key={task.id} className="relative">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-sm">{task.taskName}</CardTitle>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 absolute top-2 right-2 text-red-600 hover:text-red-800"
                            onClick={() => handleDeleteCustomTask(task.id)}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                        <Badge className={`font-medium ${getStatusBadgeColor(task.status)}`}>
                          {task.status}
                        </Badge>
                      </CardHeader>
                      <CardFooter className="flex justify-end">
                        <Select
                          value={task.status}
                          onValueChange={(value) => setCustomTasks(
                            customTasks.map(t => 
                              t.id === task.id ? { ...t, status: value } : t
                            )
                          )}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Change status" />
                          </SelectTrigger>
                          <SelectContent>
                            {taskStatusOptions.supplements.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No custom tasks added yet.</p>
                  <Button 
                    variant="link" 
                    onClick={() => setIsAddingTask(true)}
                    className="mt-2"
                  >
                    Add your first custom task
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            <Check className="h-4 w-4 mr-2" />
            Save All Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 