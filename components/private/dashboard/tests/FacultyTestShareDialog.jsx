import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useLazyQuery, useMutation } from "@apollo/client";
import {
  GET_ACADEMIC_YEARS,
  GET_STUDENTS,
} from "@/graphql/queries/students.query";
import { X, Search, Lock, Unlock, Plus, Loader } from "lucide-react";
import { LOCK_SHARE_WITH } from "@/graphql/mutations/testPaper.mutation";
import { GET_TESTPAPER } from "@/graphql/queries/testPaper.query";
import toast from "react-hot-toast";

const FacultyTestShareDialog = ({
  sharedWith,
  setSharedWith,
  testpaperId,
  facultyAssignments = [],
  lockShareWith = false,
}) => {
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [academicYears, setAcademicYears] = useState([]);
  const [grades, setGrades] = useState([]);
  const [batches, setBatches] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocking, setIsLocking] = useState(false);

  // Query to get the academic years
  const [getAcademicYears, { loading: academicYearsLoading }] = useLazyQuery(
    GET_ACADEMIC_YEARS,
    {
      onCompleted: (data) => {
        // Extract unique academic years, grades, and batches from faculty assignments
        const uniqueYears = Array.from(
          new Set(
            facultyAssignments.map((assignment) => assignment.academicYear)
          )
        ).sort((a, b) => b.localeCompare(a)); // Sort in descending order

        setAcademicYears(uniqueYears);

        if (uniqueYears.length > 0 && !selectedAcademicYear) {
          setSelectedAcademicYear(uniqueYears[0]);
        }
      },
      fetchPolicy: "network-only",
    }
  );

  // Mutation to lock/unlock the shared with field
  const [lockShareWithMutation] = useMutation(LOCK_SHARE_WITH, {
    refetchQueries: [
      {
        query: GET_TESTPAPER,
        variables: { id: testpaperId, published: false },
      },
    ],
    onCompleted: () => {
      toast.success(
        lockShareWith ? "Share settings unlocked" : "Share settings locked"
      );
      setIsLocking(false);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
      setIsLocking(false);
    },
  });

  // Query to search for students
  const [searchStudents, { loading: studentsLoading }] = useLazyQuery(
    GET_STUDENTS,
    {
      onCompleted: (data) => {
        if (data?.students) {
          // Filter students based on faculty assignments
          const assignmentFilters = {
            academicYear: selectedAcademicYear,
            grade: selectedGrade,
            batch: selectedBatch,
          };

          let filtered = data.students;

          // Filter by search term
          if (searchTerm) {
            filtered = filtered.filter(
              (student) =>
                student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }

          // Filter by academic year, grade, and batch if selected
          filtered = filtered.filter((student) => {
            // Check if student matches any of the faculty's assignments
            return facultyAssignments.some(
              (assignment) =>
                (!selectedAcademicYear ||
                  student.academicYear === selectedAcademicYear) &&
                (!selectedGrade || student.grade === selectedGrade) &&
                (!selectedBatch || student.batch === selectedBatch) &&
                student.academicYear === assignment.academicYear &&
                student.grade === assignment.grade &&
                student.batch === assignment.batch
            );
          });

          setSearchResults(filtered);
        }
        setIsSearching(false);
      },
      fetchPolicy: "network-only",
    }
  );

  // Get the academic years on component mount
  useEffect(() => {
    getAcademicYears();
  }, []);

  // Update grades and batches when academic year changes
  useEffect(() => {
    if (selectedAcademicYear && facultyAssignments.length > 0) {
      // Filter assignments by selected academic year
      const filteredAssignments = facultyAssignments.filter(
        (assignment) => assignment.academicYear === selectedAcademicYear
      );

      // Extract unique grades
      const uniqueGrades = Array.from(
        new Set(filteredAssignments.map((assignment) => assignment.grade))
      ).sort();
      setGrades(uniqueGrades);

      // Reset selected grade if it's not in the new list
      if (uniqueGrades.length > 0) {
        if (!uniqueGrades.includes(selectedGrade)) {
          setSelectedGrade(uniqueGrades[0]);
        }
      } else {
        setSelectedGrade("");
      }
    } else {
      setGrades([]);
      setSelectedGrade("");
    }
  }, [selectedAcademicYear, facultyAssignments]);

  // Update batches when grade changes
  useEffect(() => {
    if (
      selectedGrade &&
      selectedAcademicYear &&
      facultyAssignments.length > 0
    ) {
      // Filter assignments by selected academic year and grade
      const filteredAssignments = facultyAssignments.filter(
        (assignment) =>
          assignment.academicYear === selectedAcademicYear &&
          assignment.grade === selectedGrade
      );

      // Extract unique batches
      const uniqueBatches = Array.from(
        new Set(filteredAssignments.map((assignment) => assignment.batch))
      ).sort();
      setBatches(uniqueBatches);

      // Reset selected batch if it's not in the new list
      if (uniqueBatches.length > 0) {
        if (!uniqueBatches.includes(selectedBatch)) {
          setSelectedBatch(uniqueBatches[0]);
        }
      } else {
        setSelectedBatch("");
      }
    } else {
      setBatches([]);
      setSelectedBatch("");
    }
  }, [selectedGrade, selectedAcademicYear, facultyAssignments]);

  // Search for students when filters change
  useEffect(() => {
    if (selectedAcademicYear && !lockShareWith) {
      setIsSearching(true);
      searchStudents({
        variables: {
          academicYear: selectedAcademicYear,
          grade: selectedGrade,
          batch: selectedBatch,
        },
      });
    }
  }, [selectedAcademicYear, selectedGrade, selectedBatch, lockShareWith]);

  // Debounced search function
  const debouncedSearch = useDebouncedCallback((term) => {
    setSearchTerm(term);
    if (selectedAcademicYear && !lockShareWith) {
      setIsSearching(true);
      searchStudents({
        variables: {
          academicYear: selectedAcademicYear,
          grade: selectedGrade,
          batch: selectedBatch,
        },
      });
    }
  }, 300);

  // Add student to shared with list
  const addStudent = (student) => {
    const isAlreadyShared = sharedWith.some(
      (share) => share.email === student.email
    );

    if (!isAlreadyShared) {
      const newShareInfo = {
        email: student.email,
        name: student.name,
        academicYear: student.academicYear,
        grade: student.grade,
        batch: student.batch,
      };

      setSharedWith([...sharedWith, newShareInfo]);
    }
  };

  // Add filter (all students matching current filter)
  const addAllInFilter = () => {
    const filteredToAdd = searchResults.filter(
      (student) => !sharedWith.some((share) => share.email === student.email)
    );

    if (filteredToAdd.length > 0) {
      const newShareWith = [
        ...sharedWith,
        ...filteredToAdd.map((student) => ({
          email: student.email,
          name: student.name,
          academicYear: student.academicYear,
          grade: student.grade,
          batch: student.batch,
        })),
      ];

      setSharedWith(newShareWith);
    }
  };

  // Remove student from shared with list
  const removeStudent = (email) => {
    const updatedSharedWith = sharedWith.filter(
      (share) => share.email !== email
    );
    setSharedWith(updatedSharedWith);
  };

  // Lock/unlock share with
  const toggleLockShareWith = async () => {
    setIsLocking(true);
    try {
      await lockShareWithMutation({
        variables: {
          id: testpaperId,
          lockShareWith: !lockShareWith,
        },
      });
    } catch (error) {
      console.error("Error toggling lock share with:", error);
      setIsLocking(false);
    }
  };

  // Get count of students that would match the current filter
  const getFilterMatchCount = () => {
    return searchResults.length;
  };

  return (
    <div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="mb-4" disabled={lockShareWith}>
            {lockShareWith ? (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Sharing Locked
              </>
            ) : (
              "Manage Sharing"
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Share Test Paper</DialogTitle>
            <DialogDescription>
              Choose students to share this test paper with.
            </DialogDescription>
          </DialogHeader>

          {/* Filter Options */}
          <div className="grid gap-4 pb-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-2">
                <Label htmlFor="academicYear">Academic Year</Label>
                <select
                  id="academicYear"
                  value={selectedAcademicYear}
                  onChange={(e) => setSelectedAcademicYear(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  disabled={academicYearsLoading || lockShareWith}
                >
                  <option value="">Select Year</option>
                  {academicYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <select
                  id="grade"
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  disabled={!selectedAcademicYear || lockShareWith}
                >
                  <option value="">All Grades</option>
                  {grades.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="batch">Batch</Label>
                <select
                  id="batch"
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  disabled={!selectedGrade || lockShareWith}
                >
                  <option value="">All Batches</option>
                  {batches.map((batch) => (
                    <option key={batch} value={batch}>
                      {batch}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="search" className="mr-2">
                  Search Students
                </Label>
                <div className="ml-auto text-xs text-gray-500">
                  {getFilterMatchCount()} students match filter
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  id="search"
                  type="text"
                  placeholder="Search by name or email"
                  className="w-full pl-8 p-2 border border-gray-300 rounded-md"
                  onChange={(e) => debouncedSearch(e.target.value)}
                  disabled={lockShareWith}
                />
              </div>
            </div>

            {/* Student Results */}
            <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
              {isSearching ? (
                <div className="flex justify-center items-center h-20">
                  <Loader className="h-5 w-5 animate-spin" />
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center text-gray-500 p-4">
                  No students found matching the criteria
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm font-medium">
                      Students ({searchResults.length})
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={addAllInFilter}
                      disabled={lockShareWith}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add All
                    </Button>
                  </div>
                  {searchResults.map((student) => (
                    <div
                      key={student.email}
                      className="flex justify-between items-center py-1 px-2 hover:bg-gray-50 rounded"
                    >
                      <div className="text-sm">
                        <div className="font-medium">{student.name}</div>
                        <div className="text-xs text-gray-500">
                          {student.email} - {student.grade} {student.batch}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8"
                        onClick={() => addStudent(student)}
                        disabled={
                          lockShareWith ||
                          sharedWith.some(
                            (share) => share.email === student.email
                          )
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Currently Shared With */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Shared With ({sharedWith.length})</Label>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={toggleLockShareWith}
                  disabled={isLocking || sharedWith.length === 0}
                >
                  {isLocking ? (
                    <Loader className="h-3 w-3 animate-spin mr-1" />
                  ) : lockShareWith ? (
                    <Unlock className="h-3 w-3 mr-1" />
                  ) : (
                    <Lock className="h-3 w-3 mr-1" />
                  )}
                  {lockShareWith ? "Unlock" : "Lock"}
                </Button>
              </div>
              <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                {sharedWith.length === 0 ? (
                  <div className="text-center text-gray-500 p-4">
                    Test paper is not shared with anyone yet
                  </div>
                ) : (
                  <div className="space-y-1">
                    {sharedWith.map((share) => (
                      <div
                        key={share.email}
                        className="flex justify-between items-center py-1 px-2 hover:bg-gray-50 rounded"
                      >
                        <div className="text-sm">
                          <div className="font-medium">{share.name}</div>
                          <div className="text-xs text-gray-500">
                            {share.email} - {share.grade} {share.batch}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => removeStudent(share.email)}
                          disabled={lockShareWith}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Display Shared Students Summary */}
      <div className="border rounded-md p-4 mb-4">
        <h3 className="text-sm font-medium mb-2">
          Shared with {sharedWith.length} students
        </h3>
        <div className="max-h-40 overflow-y-auto">
          {sharedWith.length === 0 ? (
            <p className="text-sm text-gray-500">
              This test paper is not shared with anyone yet
            </p>
          ) : (
            <div className="space-y-1">
              {sharedWith.map((share) => (
                <div
                  key={share.email}
                  className="text-sm py-1 px-2 flex justify-between items-center"
                >
                  <div>
                    <span className="font-medium">{share.name}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      {share.email} - {share.grade} {share.batch}
                    </span>
                  </div>
                  {!lockShareWith && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeStudent(share.email)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyTestShareDialog;
