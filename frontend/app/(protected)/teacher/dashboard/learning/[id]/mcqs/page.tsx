"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  getCompetencyQuestions,
  Question,
  saveCompetencyProgress,
} from "@/lib/api/competency";
import { useAssessmentNavigator } from "@/store/useAssessmentNavigator";
import { useCompetencyStore } from "@/store/useCompetencyStore";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const MCQsPage = () => {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.id as string;

  // Store
  const setQuestions = useCompetencyStore((s) => s.setQuestions);
  const setAttempt = useCompetencyStore((s) => s.setAttempt);
  const mcqs = useCompetencyStore((s) => s.questions.MCQ);
  const answers = useCompetencyStore((s) => s.answers);
  const addAnswer = useCompetencyStore((s) => s.addAnswer);
  const attempt = useCompetencyStore((s) => s.attempt);

  // Local state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Derived
  const currentQuestion = mcqs[currentQuestionIndex];
  const totalQuestions = mcqs.length;
  const progress =
    totalQuestions > 0
      ? ((currentQuestionIndex + 1) / totalQuestions) * 100
      : 0;

  // Navigation Hook - Must be called unconditionally
  // We pass the current question ID (or empty string if not loaded yet)
  const nav = useAssessmentNavigator(currentQuestion?.id ?? "");

  // Fetch data on load if missing
  useEffect(() => {
    const loadData = async () => {
      if (mcqs.length === 0) {
        try {
          console.log("MCQsPage: fetching questions...");
          const data = await getCompetencyQuestions();
          
          // Group questions manually since store expects groups
          const groups: any = {
            MCQ: [],
            SHORT_ANSWER: [],
            AUDIO: [],
            VIDEO: [],
          };
          
          data.questions.forEach((q: Question) => {
            const t = q.type.toUpperCase();
            if (t === "MCQ" || t.includes("MULTIPLE")) groups.MCQ.push(q);
            else if (t === "SHORT_ANSWER") groups.SHORT_ANSWER.push(q);
            else if (t === "AUDIO" || t === "UPLOAD_AUDIO") groups.AUDIO.push(q);
            else if (t === "VIDEO") groups.VIDEO.push(q);
          });
          
          setQuestions(groups);
        } catch (error) {
          console.error("Failed to load questions", error);
        }
      }
    };
    loadData();
  }, [mcqs.length, setQuestions]);

  const currentAnswer =
    answers.find((a) => a.questionId === currentQuestion?.id)?.answer || "";

  const handleAnswer = (value: string) => {
    if (!currentQuestion) return;
    addAnswer({ questionId: currentQuestion.id, answer: value });
  };

  const handleNext = async () => {
    if (!currentQuestion) return;

    // Save progress
    if (attempt?.id && currentAnswer) {
      setIsSaving(true);
      try {
        await saveCompetencyProgress(attempt.id, answers);
      } catch (err) {
        console.error("Failed to save progress", err);
      } finally {
        setIsSaving(false);
      }
    }

    // Navigation logic
    if (nav) {
      if (nav.nextSection === "MCQ") {
        // Stay in MCQ section, move to next question
        setCurrentQuestionIndex((prev) => prev + 1);
      } else if (nav.nextSection) {
        // Move to next section
        // Assuming route format /teacher/dashboard/learning/[id]/[section-slug]
        const sectionSlug = nav.nextSection.toLowerCase().replace("_", "-");
        router.push(`/teacher/dashboard/learning/${assessmentId}/${sectionSlug}`);
      } else if (nav.isComplete) {
        // End of assessment (though usually this only happens at the very end of all sections)
        setShowResults(true);
      }
    } else {
      // Fallback if nav is null (e.g. error or end of list without nav info)
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        setShowResults(true);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // Loading state
  if (mcqs.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p>Loading assessment...</p>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const answeredCount = answers.filter((a) =>
    mcqs.some((q) => q.id === a.questionId)
  ).length;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col p-3 sm:p-6 font-[montserrat]">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => router.back()}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-semibold truncate">
              Competency Assessment
            </h1>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Badge variant="outline" className="text-xs">
                MCQ Assessment
              </Badge>
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                {totalQuestions} Questions
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="flex flex-1 flex-col">
        <CardHeader>
          <p className="text-lg sm:text-xl font-medium">
            {currentQuestion.prompt}
          </p>
        </CardHeader>
        <CardContent className="flex-1">
          <RadioGroup
            value={currentAnswer}
            onValueChange={handleAnswer}
            className="space-y-3"
          >
            {currentQuestion.options?.map((option, idx) => {
              const optionId = option;
              const isSelected = currentAnswer === optionId;

              return (
                <div
                  key={idx}
                  className={`flex items-center space-x-3 rounded-lg border p-3 sm:p-4 transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <RadioGroupItem
                    value={optionId}
                    id={`${currentQuestion.id}-${idx}`}
                  />
                  <Label
                    htmlFor={`${currentQuestion.id}-${idx}`}
                    className="flex-1 cursor-pointer text-sm sm:text-base"
                  >
                    {option}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between border-t pt-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="size-4 mr-2" />
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={!currentAnswer || isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving
              ? "Saving..."
              : currentQuestionIndex === totalQuestions - 1
              ? "Next Section"
              : "Next"}
            {currentQuestionIndex !== totalQuestions - 1 && !isSaving && (
              <ArrowRight className="size-4 ml-2" />
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Results Dialog */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="sm:max-w-md font-[montserrat]">
          <DialogHeader className="text-center sm:text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="size-8 text-green-600" />
            </div>
            <DialogTitle className="text-2xl">
              Section Completed! 🎉
            </DialogTitle>
            <DialogDescription>
              You have completed the MCQ section.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-sm text-muted-foreground">Answered</p>
              <p className="text-4xl font-bold">
                {answeredCount}/{totalQuestions}
              </p>
            </div>
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button
              className="w-full sm:w-auto"
              onClick={() =>
                // Fallback route if nav didn't catch it
                router.push(
                  `/teacher/dashboard/learning/${assessmentId}/short-answer`
                )
              }
            >
              Next Step: Short Answer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MCQsPage;
