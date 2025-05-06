"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Check, RotateCcw } from "lucide-react";

// All available columns with labels
const availableColumns = [
  { id: "collegeName", label: "College Name" },
  { id: "collegeDetails", label: "College Details" },
  { id: "supplements", label: "Supplements" },
  { id: "deadline", label: "Application Deadline" },
  { id: "applicationType", label: "Application Type" },
  { id: "mainEssay", label: "Main Essay Progress" },
  { id: "category", label: "School Category" },
  { id: "decision", label: "Application Decision" },
  { id: "actions", label: "Actions" },
];

// Default visible columns
const defaultColumns = [
  "collegeName",
  "collegeDetails",
  "supplements",
  "deadline",
  "applicationType",
  "mainEssay",
  "category",
  "decision",
  "actions",
];

export function ColumnsDialog({
  open,
  onOpenChange,
  visibleColumns,
  setVisibleColumns,
}) {
  const [selectedColumns, setSelectedColumns] = useState(visibleColumns);

  // Reset selected columns when the dialog opens
  useEffect(() => {
    setSelectedColumns(visibleColumns);
  }, [visibleColumns, open]);

  // Handle checkbox change
  const handleColumnToggle = (columnId) => {
    if (selectedColumns.includes(columnId)) {
      // Don't allow unchecking "collegeName" and "actions"
      if (columnId === "collegeName" || columnId === "actions") {
        return;
      }
      
      setSelectedColumns(selectedColumns.filter((col) => col !== columnId));
    } else {
      setSelectedColumns([...selectedColumns, columnId]);
    }
  };

  // Save changes
  const handleSave = () => {
    setVisibleColumns(selectedColumns);
    onOpenChange(false);
  };

  // Reset to defaults
  const handleReset = () => {
    setSelectedColumns(defaultColumns);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle>Customize Visible Columns</DialogTitle>
          <DialogDescription>
            Select which columns to display in your college list.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="grid gap-4">
            {availableColumns.map((column) => (
              <div key={column.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`column-${column.id}`}
                  checked={selectedColumns.includes(column.id)}
                  onCheckedChange={() => handleColumnToggle(column.id)}
                  // Disable checkboxes for required columns
                  disabled={column.id === "collegeName" || column.id === "actions"}
                />
                <Label
                  htmlFor={`column-${column.id}`}
                  className={
                    column.id === "collegeName" || column.id === "actions"
                      ? "text-gray-500 cursor-not-allowed"
                      : ""
                  }
                >
                  {column.label}
                  {(column.id === "collegeName" || column.id === "actions") && (
                    <span className="ml-2 text-xs text-gray-500">(Required)</span>
                  )}
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        <DialogFooter className="flex-col gap-3 sm:flex-row sm:justify-between sm:items-center pt-4">
          <Button type="button" variant="outline" onClick={handleReset} className="w-full sm:w-auto">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Default
          </Button>
          <div className="flex gap-3 w-full sm:w-auto justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} className="w-full sm:w-auto">
              <Check className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 