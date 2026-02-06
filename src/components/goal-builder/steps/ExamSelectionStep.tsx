import { useState, useEffect, useCallback } from "react";
import { Search, GraduationCap, BookOpen, Calendar, CheckSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { GoalDefinition, University, Course, Semester, Subject } from "@/types/goal";

interface ExamSelectionStepProps {
  data: Partial<GoalDefinition>;
  onUpdate: (data: Partial<GoalDefinition>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ExamSelectionStep({ data, onUpdate, onNext, onBack }: ExamSelectionStepProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [universities, setUniversities] = useState<University[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  const [selectedUniversity, setSelectedUniversity] = useState<University | undefined>(data.university);
  const [selectedCourse, setSelectedCourse] = useState<Course | undefined>(data.course);
  const [selectedSemester, setSelectedSemester] = useState<Semester | undefined>(data.semester);
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>(data.subjects || []);

  // Fetch universities with search
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/api/exam/universities?search=${encodeURIComponent(searchQuery)}`
        );
        const data = await response.json();
        setUniversities(data);
      } catch (error) {
        console.error("Failed to fetch universities:", error);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchUniversities();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Fetch courses when university is selected
  useEffect(() => {
    if (!selectedUniversity) {
      setCourses([]);
      return;
    }

    const fetchCourses = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/api/exam/courses?university=${encodeURIComponent(selectedUniversity.id)}`
        );
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      }
    };

    fetchCourses();
  }, [selectedUniversity]);

  // Fetch semesters when course is selected
  useEffect(() => {
    if (!selectedUniversity || !selectedCourse) {
      setSemesters([]);
      return;
    }

    const fetchSemesters = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/api/exam/semesters?university=${encodeURIComponent(
            selectedUniversity.id
          )}&course=${encodeURIComponent(selectedCourse.id)}`
        );
        const data = await response.json();
        setSemesters(data);
      } catch (error) {
        console.error("Failed to fetch semesters:", error);
      }
    };

    fetchSemesters();
  }, [selectedUniversity, selectedCourse]);

  // Fetch subjects when semester is selected
  useEffect(() => {
    if (!selectedUniversity || !selectedCourse || !selectedSemester) {
      setSubjects([]);
      return;
    }

    const fetchSubjects = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/api/exam/subjects?university=${encodeURIComponent(
            selectedUniversity.id
          )}&course=${encodeURIComponent(selectedCourse.id)}&semester=${encodeURIComponent(
            selectedSemester.id
          )}`
        );
        const data = await response.json();
        setSubjects(data);
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
      }
    };

    fetchSubjects();
  }, [selectedUniversity, selectedCourse, selectedSemester]);

  const handleUniversitySelect = (university: University) => {
    setSelectedUniversity(university);
    setSelectedCourse(undefined);
    setSelectedSemester(undefined);
    setSelectedSubjects([]);
    setCourses([]);
    setSemesters([]);
    setSubjects([]);
  };

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    setSelectedSemester(undefined);
    setSelectedSubjects([]);
    setSemesters([]);
    setSubjects([]);
  };

  const handleSemesterSelect = (semester: Semester) => {
    setSelectedSemester(semester);
    setSelectedSubjects([]);
    setSubjects([]);
  };

  const handleSubjectToggle = (subject: Subject) => {
    setSelectedSubjects((prev) => {
      const exists = prev.find((s) => s.id === subject.id);
      if (exists) {
        return prev.filter((s) => s.id !== subject.id);
      }
      return [...prev, subject];
    });
  };

  const handleNext = useCallback(() => {
    if (!selectedUniversity || !selectedCourse || !selectedSemester || selectedSubjects.length === 0) {
      return;
    }

    onUpdate({
      type: "exam",
      university: selectedUniversity,
      course: selectedCourse,
      semester: selectedSemester,
      subjects: selectedSubjects,
    });
    onNext();
  }, [selectedUniversity, selectedCourse, selectedSemester, selectedSubjects, onUpdate, onNext]);

  const canProceed = selectedUniversity && selectedCourse && selectedSemester && selectedSubjects.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">Select Your Exam</h2>
        <p className="text-gray-600 mt-2">
          Choose university, course, semester, and subjects you want to prepare for
        </p>
      </div>

      {/* Step 1: University Search */}
      <Card>
        <CardContent className="pt-6">
          <Label className="text-sm font-medium flex items-center gap-2 mb-3">
            <GraduationCap className="h-4 w-4" />
            Step 1: Search University
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search for your university..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {universities.length > 0 && (
            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
              {universities.map((uni) => (
                <div
                  key={uni.id}
                  className={`p-3 border rounded-md cursor-pointer transition-colors ${
                    selectedUniversity?.id === uni.id
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-primary/50"
                  }`}
                  onClick={() => handleUniversitySelect(uni)}
                >
                  <p className="font-medium">{uni.name}</p>
                  <p className="text-xs text-gray-500">{uni.type}</p>
                </div>
              ))}
            </div>
          )}
          {selectedUniversity && (
            <div className="mt-3">
              <Badge variant="secondary" className="gap-2">
                <CheckSquare className="h-3 w-3" />
                {selectedUniversity.name}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Course Selection */}
      {selectedUniversity && (
        <Card>
          <CardContent className="pt-6">
            <Label className="text-sm font-medium flex items-center gap-2 mb-3">
              <BookOpen className="h-4 w-4" />
              Step 2: Select Course
            </Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className={`p-3 border rounded-md cursor-pointer transition-colors ${
                    selectedCourse?.id === course.id
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-primary/50"
                  }`}
                  onClick={() => handleCourseSelect(course)}
                >
                  <p className="font-medium">{course.name}</p>
                  <p className="text-xs text-gray-500">
                    {course.duration} • {course.totalSemesters} semesters
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Semester Selection */}
      {selectedCourse && (
        <Card>
          <CardContent className="pt-6">
            <Label className="text-sm font-medium flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4" />
              Step 3: Select Semester
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {semesters.map((sem) => (
                <Button
                  key={sem.id}
                  variant={selectedSemester?.id === sem.id ? "default" : "outline"}
                  onClick={() => handleSemesterSelect(sem)}
                  className="w-full"
                >
                  Sem {sem.number}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Subject Selection (Multiple) */}
      {selectedSemester && (
        <Card>
          <CardContent className="pt-6">
            <Label className="text-sm font-medium flex items-center gap-2 mb-3">
              <CheckSquare className="h-4 w-4" />
              Step 4: Select Subjects (Multiple)
            </Label>
            <p className="text-xs text-gray-500 mb-3">
              Select all subjects you want to prepare for this exam
            </p>
            <div className="space-y-2">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="flex items-start gap-3 p-3 border rounded-md hover:bg-gray-50"
                >
                  <Checkbox
                    checked={selectedSubjects.some((s) => s.id === subject.id)}
                    onCheckedChange={() => handleSubjectToggle(subject)}
                    id={subject.id}
                  />
                  <Label htmlFor={subject.id} className="flex-1 cursor-pointer">
                    <p className="font-medium">{subject.name}</p>
                    <p className="text-xs text-gray-500">
                      {subject.code} • {subject.credits} credits • {subject.marks} marks
                    </p>
                  </Label>
                </div>
              ))}
            </div>
            {selectedSubjects.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Selected Subjects ({selectedSubjects.length}):</p>
                <div className="flex flex-wrap gap-2">
                  {selectedSubjects.map((sub) => (
                    <Badge key={sub.id} variant="secondary">
                      {sub.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button onClick={onBack} variant="outline" size="lg">
          ← Back
        </Button>
        <Button onClick={handleNext} disabled={!canProceed} size="lg" className="gap-2">
          Continue to Timeline
          <span>→</span>
        </Button>
      </div>
    </div>
  );
}
