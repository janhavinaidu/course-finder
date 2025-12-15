import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ExternalLink, X } from "lucide-react";
import { Course } from "@/lib/api";
import { cn } from "@/lib/utils";

interface CourseComparisonModalProps {
  courses: Course[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRemoveCourse: (courseId: number) => void;
}

export const CourseComparisonModal = ({
  courses,
  open,
  onOpenChange,
  onRemoveCourse,
}: CourseComparisonModalProps) => {
  if (courses.length === 0) return null;

  const comparisonFields = [
    { key: "name", label: "Title" },
    { key: "provider", label: "Provider" },
    { key: "duration", label: "Duration" },
    { key: "level", label: "Level" },
    { key: "price", label: "Price" },
    { key: "rating", label: "Rating" },
    { key: "url", label: "Link" },
  ];

  const getFieldValue = (course: Course, key: string) => {
    switch (key) {
      case "name":
        return course.name;
      case "provider":
        return course.provider;
      case "duration":
        return course.duration || "Not specified";
      case "level":
        return course.level.charAt(0).toUpperCase() + course.level.slice(1);
      case "price":
        return course.price || course.pricing;
      case "rating":
        return course.rating ? course.rating.toFixed(1) + " ⭐" : "Not available";
      case "url":
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(course.url, "_blank")}
            className="h-8"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open
          </Button>
        );
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Compare Courses</DialogTitle>
          <DialogDescription>
            Compare up to 3 courses side-by-side. Click the X button to remove a course from comparison.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Attribute</TableHead>
                {courses.map((course, index) => (
                  <TableHead key={course.id} className="relative">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{course.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onRemoveCourse(course.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparisonFields.map((field) => (
                <TableRow key={field.key}>
                  <TableCell className="font-medium">{field.label}</TableCell>
                  {courses.map((course) => (
                    <TableCell key={course.id}>
                      {getFieldValue(course, field.key)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              <TableRow>
                <TableCell className="font-medium">Description</TableCell>
                {courses.map((course) => (
                  <TableCell key={course.id} className="max-w-xs">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {course.description}
                    </p>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {courses.length < 3 && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
            💡 Select up to 2 more courses to compare (maximum 3 courses)
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

