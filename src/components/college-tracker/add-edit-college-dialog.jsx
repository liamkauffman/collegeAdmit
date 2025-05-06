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
            <Button type="submit">
              {mode === "add" ? "Add College" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 