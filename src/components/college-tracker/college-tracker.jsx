"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Settings, Edit, Trash, FileEdit } from "lucide-react";
import { AddEditCollegeDialog } from "./add-edit-college-dialog";
import { DetailedTrackingDialog } from "./detailed-tracking-dialog";
import { ColumnsDialog } from "./columns-dialog";

// Status color mappings
const statusColors = {
  "Not Started": "bg-gray-200 text-gray-800",
  "Drafting": "bg-blue-200 text-blue-800",
  "In Progress": "bg-blue-200 text-blue-800",
  "Reviewing": "bg-yellow-200 text-yellow-800",
  "Completed": "bg-green-200 text-green-800",
  "Submitted": "bg-green-200 text-green-800",
  "Ready to Submit": "bg-purple-200 text-purple-800",
  "Drafts Done": "bg-indigo-200 text-indigo-800",
};

const typeColors = {
  "RD": "bg-sky-200 text-sky-800",
  "EA": "bg-emerald-200 text-emerald-800",
  "ED": "bg-violet-200 text-violet-800",
  "Rolling": "bg-amber-200 text-amber-800",
  "Priority": "bg-rose-200 text-rose-800",
};

const categoryColors = {
  "Safety": "bg-green-200 text-green-800",
  "Target": "bg-blue-200 text-blue-800",
  "Reach": "bg-amber-200 text-amber-800",
  "Hard Reach": "bg-red-200 text-red-800",
  "Hard Target": "bg-indigo-200 text-indigo-800",
};

const decisionColors = {
  "Not Applied Yet": "bg-gray-200 text-gray-800",
  "Applied": "bg-blue-200 text-blue-800",
  "Pending Decision": "bg-yellow-200 text-yellow-800",
  "Accepted": "bg-green-200 text-green-800",
  "Accepted + Scholarship": "bg-emerald-200 text-emerald-800",
  "Rejected": "bg-red-200 text-red-800",
  "Waitlisted": "bg-amber-200 text-amber-800",
  "Deferred": "bg-purple-200 text-purple-800",
};

// Default visible columns
const defaultVisibleColumns = [
  "collegeName",
  "supplements",
  "deadline",
  "applicationType",
  "mainEssay",
  "category",
  "decision",
  "actions",
];

export function CollegeTracker() {
  // State for college list
  const [colleges, setColleges] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTrackingDialogOpen, setIsTrackingDialogOpen] = useState(false);
  const [isColumnsDialogOpen, setIsColumnsDialogOpen] = useState(false);
  const [currentCollege, setCurrentCollege] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState(defaultVisibleColumns);

  // Load colleges from localStorage on component mount
  useEffect(() => {
    const savedColleges = localStorage.getItem("collegeTrackerData");
    if (savedColleges) {
      setColleges(JSON.parse(savedColleges));
    }
    
    const savedColumns = localStorage.getItem("collegeTrackerColumns");
    if (savedColumns) {
      setVisibleColumns(JSON.parse(savedColumns));
    }
  }, []);

  // Save colleges to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("collegeTrackerData", JSON.stringify(colleges));
  }, [colleges]);

  // Save visible columns to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("collegeTrackerColumns", JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  // Handle adding a new college
  const handleAddCollege = (newCollege) => {
    const collegeWithId = {
      ...newCollege,
      id: Date.now().toString(),
      supplements: newCollege.supplements || [],
    };
    setColleges([...colleges, collegeWithId]);
    setIsAddDialogOpen(false);
  };

  // Handle editing a college
  const handleEditCollege = (updatedCollege) => {
    setColleges(
      colleges.map((college) => 
        college.id === updatedCollege.id ? updatedCollege : college
      )
    );
    setIsEditDialogOpen(false);
  };

  // Handle deleting a college
  const handleDeleteCollege = (id) => {
    if (confirm("Are you sure you want to delete this college from your list?")) {
      setColleges(colleges.filter((college) => college.id !== id));
    }
  };

  // Open add college dialog
  const openAddDialog = () => {
    setCurrentCollege(null);
    setIsAddDialogOpen(true);
  };

  // Open edit college dialog
  const openEditDialog = (college) => {
    setCurrentCollege(college);
    setIsEditDialogOpen(true);
  };

  // Open detailed tracking dialog
  const openTrackingDialog = (college) => {
    setCurrentCollege(college);
    setIsTrackingDialogOpen(true);
  };

  // Update supplements for a college
  const updateSupplements = (collegeId, updatedSupplements) => {
    setColleges(
      colleges.map((college) => 
        college.id === collegeId 
          ? { ...college, supplements: updatedSupplements } 
          : college
      )
    );
  };

  // Update detailed tracking for a college
  const updateDetailedTracking = (collegeId, trackingDetails) => {
    setColleges(
      colleges.map((college) => 
        college.id === collegeId 
          ? { ...college, ...trackingDetails } 
          : college
      )
    );
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate supplements status
  const getSupplementsStatus = (supplements) => {
    if (!supplements || supplements.length === 0) return "0 supplements";
    
    const completed = supplements.filter(s => s.status === "Completed" || s.status === "Submitted").length;
    return `${completed} of ${supplements.length} complete`;
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Your College List
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track and manage all your college applications in one place
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsColumnsDialogOpen(true)} variant="outline" size="sm" className="h-9">
            <Settings className="h-4 w-4 mr-2" />
            Columns
          </Button>
          <Button onClick={openAddDialog} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add College
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.includes("collegeName") && (
                <TableHead className="min-w-[200px]">College Name</TableHead>
              )}
              {visibleColumns.includes("supplements") && (
                <TableHead className="min-w-[150px]">Supplements</TableHead>
              )}
              {visibleColumns.includes("deadline") && (
                <TableHead className="min-w-[150px]">Application Deadline</TableHead>
              )}
              {visibleColumns.includes("applicationType") && (
                <TableHead className="min-w-[120px]">Application Type</TableHead>
              )}
              {visibleColumns.includes("mainEssay") && (
                <TableHead className="min-w-[150px]">Main Essay Progress</TableHead>
              )}
              {visibleColumns.includes("category") && (
                <TableHead className="min-w-[120px]">School Category</TableHead>
              )}
              {visibleColumns.includes("decision") && (
                <TableHead className="min-w-[150px]">Application Decision</TableHead>
              )}
              {visibleColumns.includes("actions") && (
                <TableHead className="w-[80px]">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {colleges.length > 0 ? (
              colleges.map((college) => (
                <TableRow key={college.id}>
                  {visibleColumns.includes("collegeName") && (
                    <TableCell className="font-medium">{college.collegeName}</TableCell>
                  )}
                  {visibleColumns.includes("supplements") && (
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openTrackingDialog(college)}
                        className="text-xs"
                      >
                        <FileEdit className="h-3.5 w-3.5 mr-1" />
                        {getSupplementsStatus(college.supplements)}
                      </Button>
                    </TableCell>
                  )}
                  {visibleColumns.includes("deadline") && (
                    <TableCell>{formatDate(college.deadline)}</TableCell>
                  )}
                  {visibleColumns.includes("applicationType") && (
                    <TableCell>
                      {college.applicationType && (
                        <Badge className={`font-medium ${typeColors[college.applicationType] || "bg-gray-200 text-gray-800"}`}>
                          {college.applicationType}
                        </Badge>
                      )}
                    </TableCell>
                  )}
                  {visibleColumns.includes("mainEssay") && (
                    <TableCell>
                      {college.mainEssay && (
                        <Badge className={`font-medium ${statusColors[college.mainEssay] || "bg-gray-200 text-gray-800"}`}>
                          {college.mainEssay}
                        </Badge>
                      )}
                    </TableCell>
                  )}
                  {visibleColumns.includes("category") && (
                    <TableCell>
                      {college.category && (
                        <Badge className={`font-medium ${categoryColors[college.category] || "bg-gray-200 text-gray-800"}`}>
                          {college.category}
                        </Badge>
                      )}
                    </TableCell>
                  )}
                  {visibleColumns.includes("decision") && (
                    <TableCell>
                      {college.decision && (
                        <Badge className={`font-medium ${decisionColors[college.decision] || "bg-gray-200 text-gray-800"}`}>
                          {college.decision}
                        </Badge>
                      )}
                    </TableCell>
                  )}
                  {visibleColumns.includes("actions") && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openEditDialog(college)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openTrackingDialog(college)}>
                            <FileEdit className="mr-2 h-4 w-4" />
                            Manage Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600" 
                            onClick={() => handleDeleteCollege(college.id)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={visibleColumns.length} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">
                      No colleges added yet
                    </p>
                    <Button 
                      onClick={openAddDialog} 
                      variant="link" 
                      className="mt-2 text-blue-600"
                    >
                      Add your first college
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add College Dialog */}
      <AddEditCollegeDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddCollege}
        mode="add"
      />

      {/* Edit College Dialog */}
      <AddEditCollegeDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleEditCollege}
        college={currentCollege}
        mode="edit"
      />

      {/* Detailed Tracking Dialog */}
      <DetailedTrackingDialog
        open={isTrackingDialogOpen}
        onOpenChange={setIsTrackingDialogOpen}
        college={currentCollege}
        onUpdateSupplements={(updatedSupplements) => 
          currentCollege && updateSupplements(currentCollege.id, updatedSupplements)
        }
        onUpdateTracking={(trackingDetails) => 
          currentCollege && updateDetailedTracking(currentCollege.id, trackingDetails)
        }
      />

      {/* Columns Configuration Dialog */}
      <ColumnsDialog
        open={isColumnsDialogOpen}
        onOpenChange={setIsColumnsDialogOpen}
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
      />
    </div>
  );
} 