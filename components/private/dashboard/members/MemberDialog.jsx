"use client";
import React from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckboxGroup } from "@/components/private/dashboard/members/CheckboxGroup";
import { Loader2, Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import { GET_ACADEMIC_YEARS } from "@/graphql/queries/students.query";

export function MemberDialog({
  open,
  onOpenChange,
  onSave,
  member,
  isLoading,
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    roles: {
      Students: false,
      Fees: false,
      Content: false,
      Birthdays: false,
      Faculty: false,
    },
    facultyAssignments: [],
  });

  const [showFacultyAssignment, setShowFacultyAssignment] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    academicYear: "",
    grade: "",
    batch: "",
  });
  const [grades, setGrades] = useState(["8", "9", "10", "11", "12"]);
  const [batches, setBatches] = useState([
    "Morning",
    "Afternoon",
    "Evening",
    "A",
    "B",
    "C",
  ]);

  // Query to get academic years
  const { data: ayData } = useSuspenseQuery(GET_ACADEMIC_YEARS);

  useEffect(() => {
    if (member) {
      // Ensure we have the latest data structure
      setFormData({
        name: member.name || "",
        email: member.email || "",
        phone: member.phone || "",
        roles: {
          Students: member.roles?.Students || false,
          Fees: member.roles?.Fees || false,
          Content: member.roles?.Content || false,
          Birthdays: member.roles?.Birthdays || false,
          Faculty: member.roles?.Faculty || false,
        },
        facultyAssignments: Array.isArray(member.facultyAssignments)
          ? member.facultyAssignments
          : [],
      });
      setShowFacultyAssignment(member.roles?.Faculty || false);
    } else {
      // Reset form for new member
      setFormData({
        name: "",
        email: "",
        phone: "",
        roles: {
          Students: false,
          Fees: false,
          Content: false,
          Birthdays: false,
          Faculty: false,
        },
        facultyAssignments: [],
      });
      setShowFacultyAssignment(false);
    }
  }, [member, open]);

  // Reset form when dialog is closed
  useEffect(() => {
    if (!open) {
      // Reset assignment form when dialog closes
      setNewAssignment({
        academicYear: "",
        grade: "",
        batch: "",
      });
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (role, checked) => {
    const newRoles = {
      ...formData.roles,
      [role]: checked,
    };

    setFormData((prev) => ({
      ...prev,
      roles: newRoles,
    }));

    // If Faculty role is toggled, show/hide assignment section
    if (role === "Faculty") {
      setShowFacultyAssignment(checked);
    }
  };

  const handleAssignmentChange = (field, value) => {
    setNewAssignment((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addAssignment = () => {
    // Validate that at least academic year is selected
    if (!newAssignment.academicYear) {
      alert("Academic Year is required for faculty assignment");
      return;
    }

    // Process the assignment - convert "all" values to appropriate format
    const processedAssignment = {
      ...newAssignment,
      // If grade is "all", keep it as "all" in the data structure
      // If batch is "all", keep it as "all" in the data structure
    };

    // Add the new assignment
    setFormData((prev) => ({
      ...prev,
      facultyAssignments: [...prev.facultyAssignments, processedAssignment],
    }));

    // Reset the form
    setNewAssignment({
      academicYear: "",
      grade: "",
      batch: "",
    });
  };

  const removeAssignment = (index) => {
    setFormData((prev) => ({
      ...prev,
      facultyAssignments: prev.facultyAssignments.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // If Faculty role is selected but no assignments, show warning
    if (formData.roles.Faculty && formData.facultyAssignments.length === 0) {
      if (
        !confirm(
          "You haven't assigned any students to this faculty. Continue anyway?"
        )
      ) {
        return;
      }
    }

    // Save the form data
    onSave(formData);

    // Don't reset here - we'll let the component handle resets based on the open prop
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        // If closing dialog, the onOpenChange will pass in 'false'
        if (!isOpen) {
          // First notify parent of change
          onOpenChange(false);
        } else {
          // Opening dialog, just pass through
          onOpenChange(true);
        }
      }}
    >
      <DialogContent className="sm:max-w-[500px] w-[95vw] max-w-[95vw] sm:w-auto">
        <DialogHeader>
          <DialogTitle>{member ? "Edit Member" : "Add New Member"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="name" className="sm:text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="sm:col-span-3"
                required
                disabled={isLoading}
              />
            </div>
            <div className="grid sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="email" className="sm:text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="sm:col-span-3"
                required
                disabled={isLoading || member}
              />
            </div>
            <div className="grid sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="phone" className="sm:text-right">
                Phone
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="sm:col-span-3"
                required
                disabled={isLoading}
              />
            </div>
            <div className="grid sm:grid-cols-4 items-start gap-2 sm:gap-4">
              <Label className="sm:text-right pt-2">Roles</Label>
              <div className="sm:col-span-3 space-y-2">
                <CheckboxGroup
                  roles={[
                    "Students",
                    "Fees",
                    "Content",
                    "Birthdays",
                    "Faculty",
                  ]}
                  selectedRoles={formData.roles}
                  onChange={handleRoleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Faculty Assignments Section */}
            {showFacultyAssignment && (
              <div className="grid sm:grid-cols-4 items-start gap-2 sm:gap-4 border-t pt-4 mt-2">
                <Label className="sm:text-right pt-2">
                  Faculty Assignments
                </Label>
                <div className="sm:col-span-3 space-y-4">
                  {/* Current assignments */}
                  {formData.facultyAssignments.length > 0 && (
                    <div className="space-y-2">
                      <Label>Current Assignments</Label>
                      <div className="space-y-2">
                        {formData.facultyAssignments.map(
                          (assignment, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between border p-2 rounded bg-gray-50"
                            >
                              <div>
                                <span className="font-medium">
                                  Academic Year:
                                </span>{" "}
                                {assignment.academicYear}
                                {assignment.grade && (
                                  <span className="ml-2 font-medium">
                                    Grade:
                                  </span>
                                )}{" "}
                                {assignment.grade === "all"
                                  ? "All Grades"
                                  : assignment.grade}
                                {assignment.batch && (
                                  <span className="ml-2 font-medium">
                                    Batch:
                                  </span>
                                )}{" "}
                                {assignment.batch === "all"
                                  ? "All Batches"
                                  : assignment.batch}
                              </div>
                              <button
                                type="button"
                                onClick={() => removeAssignment(index)}
                                className="text-red-500"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Add new assignment */}
                  <div className="space-y-2 border p-3 rounded">
                    <Label>Add New Assignment</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label className="w-24">Academic Year*</Label>
                        <Select
                          value={newAssignment.academicYear}
                          onValueChange={(value) =>
                            handleAssignmentChange("academicYear", value)
                          }
                          disabled={isLoading}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Academic Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {ayData?.academicYears?.map((year) => (
                              <SelectItem key={year} value={year}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center gap-2">
                        <Label className="w-24">Grade</Label>
                        <Select
                          value={newAssignment.grade}
                          onValueChange={(value) =>
                            handleAssignmentChange("grade", value)
                          }
                          disabled={isLoading}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Grade (Optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Grades</SelectItem>
                            {grades.map((grade) => (
                              <SelectItem key={grade} value={grade}>
                                {grade}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center gap-2">
                        <Label className="w-24">Batch</Label>
                        <Select
                          value={newAssignment.batch}
                          onValueChange={(value) =>
                            handleAssignmentChange("batch", value)
                          }
                          disabled={isLoading || !newAssignment.grade}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Batch (Optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Batches</SelectItem>
                            {batches.map((batch) => (
                              <SelectItem key={batch} value={batch}>
                                {batch}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addAssignment}
                      disabled={isLoading || !newAssignment.academicYear}
                      className="mt-2"
                    >
                      <Plus className="mr-1 h-4 w-4" /> Add Assignment
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {member ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// TODO: make sure Edit Member is compatible with the current version.
