import { IconChevronRight, IconCircle, IconSchool } from "@tabler/icons-react";
import { useTransitionRouter } from "next-view-transitions";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "../ui/dialog";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

type AssessmentStatus = "not-started" | "in-progress" | "completed";

type SectionStatus = {
  name: string;
  completed: boolean;
};

interface TeacherAssessmentFlagProps {
  assessmentStatus?: AssessmentStatus;
  sections?: SectionStatus[]; // e.g., [{ name: "MCQ", completed: true }, { name: "Video Response", completed: false }]
}

const TeacherAssessmentFlag = ({
  assessmentStatus = "not-started",
  sections = [],
}: TeacherAssessmentFlagProps) => {
  const [open, setOpen] = useState(false);
  const router = useTransitionRouter();

  const isInProgress = assessmentStatus === "in-progress";
  const isCompleted = assessmentStatus === "completed";

  // Calculate remaining sections
  const remainingSections = sections.filter((s) => !s.completed);
  const completedCount = sections.filter((s) => s.completed).length;
  const totalCount = sections.length;

  // Don't show banner if completed
  if (isCompleted) return null;

  return (
    <div>
      <Card className="bg-linear-to-b from-primary to-primary/80 text-card-foreground border border-rounded-2xl overflow-hidden relative h-[180px]">
        {/* Background Icon */}
        <div className="absolute inset-0 flex items-center justify-end pointer-events-none opacity-30 pr-8 z-0">
          <IconSchool size={300} />
        </div>

        {/* Foreground Content */}
        <div className="relative z-10">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3 flex-wrap">
              <CardTitle className="text-3xl font-semibold dark:text-white text-white">
                {isInProgress
                  ? "Assessment in Progress"
                  : "Begin with Your Skill Check"}
              </CardTitle>
              {isInProgress && (
                <Badge
                  variant="secondary"
                  className="bg-white/20 text-white border-white/30"
                >
                  {completedCount}/{totalCount} Sections Complete
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex flex-col gap-2">
              <CardDescription className="text-base text-white md:text-lg">
                {isInProgress
                  ? "Continue where you left off and complete your competency assessment."
                  : "Complete the competency test to verify your expertise."}
              </CardDescription>
              {/* Note Section */}
              <div className="mt-2 text-xs text-white/70">
                {isInProgress && remainingSections.length > 0 ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span>Remaining:</span>
                    {remainingSections.map((section, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="bg-white/10 text-white border-white/30 text-xs"
                      >
                        <IconCircle size={10} className="mr-1" />
                        {section.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span>
                    {isInProgress
                      ? "Your progress has been saved. Resume to complete the remaining sections."
                      : "Note: This is your first test. Your entered qualifications will be checked based on your performance."}
                  </span>
                )}
              </div>
            </div>
            {/* Move Button to the right */}
            <CardFooter className="flex flex-col md:flex-row md:items-center md:justify-end p-0">
              <Button
                onClick={() =>
                  isInProgress
                    ? router.push("/teacher/dashboard/assessments/1/mcqs")
                    : setOpen(true)
                }
              >
                {isInProgress
                  ? "Continue Assessment"
                  : "Start Your Competency Test"}
                <IconChevronRight size={20} />
              </Button>
            </CardFooter>
          </CardContent>
        </div>
      </Card>

      {!isInProgress && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogOverlay className="fixed inset-0 bg-black/40 dark:bg-black/40 backdrop-blur-sm z-50" />
          <DialogContent
            onOpenAutoFocus={(e) => e.preventDefault()}
            onPointerDownOutside={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
            forceMount
            className="font-[montserrat] bg-white dark:bg-card"
          >
            <DialogHeader className="border-b p-4 bg-card/50 dark:bg-card/50 shadow-lg ">
              <DialogTitle>Teacher Competency Benchmark</DialogTitle>
              <DialogDescription>
                This assessment helps us understand your teaching strengths and
                areas for growth. Your results will guide personalized
                recommendations and opportunities.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm text-neutral-700 dark:text-neutral-200 p-4">
              <div>
                <strong>Domains Covered:</strong> Up to 7 key teaching domains
                will be assessed, including subject expertise, pedagogy,
                communication, classroom management, technology use, assessment
                strategies, and student engagement.
              </div>
              <div>
                <strong>Question Types:</strong>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Multiple Choice Questions (MCQ)</li>
                  <li>Short Answer</li>
                  <li>Voice/Video Response</li>
                </ul>
              </div>
              <div>
                <strong>Purpose:</strong> To benchmark your current competency
                level and tailor your professional journey on our platform.
              </div>
            </div>
            <DialogFooter className="p-4 border-t shadow-lg bg-card/50 dark:bg-card/50 flex gap-2">
              <Button
                className="bg-primary text-white dark:bg-primary dark:text-white"
                onClick={() => {
                  router.push("/teacher/dashboard/assessments/1/mcqs");
                }}
              >
                Begin Assessment
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  router.push("/teacher/dashboard");
                }}
              >
                Take Later
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TeacherAssessmentFlag;
