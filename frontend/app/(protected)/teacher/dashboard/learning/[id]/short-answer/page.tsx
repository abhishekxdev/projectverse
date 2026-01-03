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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
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
  Clock,
  FileText,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";

// Zod schema for answer validation
const answerSchema = z.object({
  answer: z
    .string()
    .refine(
      (val) => {
        const words = val.trim().split(/\s+/);
        return val.trim().length > 0 && words.length >= 10;
      },
      {
        message: "Your answer must be at least 10 words",
      }
    )
    .refine((val) => val.length <= 2000, {
      message: "Your answer must not exceed 2000 characters",
    }),
});

const ShortAnswerPage = () => {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.id as string;

  // Store
  const setQuestions = useCompetencyStore((s) => s.setQuestions);
  const questionsMap = useCompetencyStore((s) => s.questions);
  const shortAnswers = useCompetencyStore((s) => s.questions.SHORT_ANSWER);
  const answers = useCompetencyStore((s) => s.answers);
  const addAnswer = useCompetencyStore((s) => s.addAnswer);
  const attempt = useCompetencyStore((s) => s.attempt);

  // Local state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derived
  const currentQuestion = shortAnswers[currentQuestionIndex];
  const totalQuestions = shortAnswers.length;
  const progress =
    totalQuestions > 0
      ? ((currentQuestionIndex + 1) / totalQuestions) * 100
      : 0;

  // Navigation Hook - Must be called unconditionally
  const nav = useAssessmentNavigator(currentQuestion?.id ?? "");

  // Fetch data on load if missing
  useEffect(() => {
    const loadData = async () => {
      // Check if we have any questions loaded (not just SHORT_ANSWER)
      const hasAnyQuestions =
        questionsMap.MCQ.length > 0 ||
        questionsMap.SHORT_ANSWER.length > 0 ||
        questionsMap.AUDIO.length > 0 ||
        questionsMap.VIDEO.length > 0;

      if (!hasAnyQuestions) {
        try {
          console.log("ShortAnswerPage: fetching questions...");
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
            else if (t === "AUDIO" || t === "UPLOAD_AUDIO")
              groups.AUDIO.push(q);
            else if (t === "VIDEO") groups.VIDEO.push(q);
          });

          setQuestions(groups);
        } catch (error) {
          console.error("Failed to load questions", error);
        }
      }
    };
    loadData();
  }, [questionsMap, setQuestions]);

  const currentAnswer =
    answers.find((a) => a.questionId === currentQuestion?.id)?.answer || "";
  
  const wordCount = currentAnswer.trim()
    ? currentAnswer.trim().split(/\s+/).length
    : 0;

  const validateAnswer = (value: string) => {
    const result = answerSchema.safeParse({ answer: value });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return false;
    }
    setError(null);
    return true;
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!currentQuestion) return;
    const value = e.target.value;
    addAnswer({ questionId: currentQuestion.id, answer: value });
    
    // Clear error while typing if valid (optional, or just clear error)
    if (error) {
       setError(null);
    }
  };

  const handleNext = async () => {
    if (!currentQuestion) return;

    // Validate
    if (!validateAnswer(currentAnswer)) {
      return;
    }

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
      if (nav.nextSection === "SHORT_ANSWER") {
        // Stay in SHORT_ANSWER section, move to next question
        setCurrentQuestionIndex((prev) => prev + 1);
      } else if (nav.nextSection) {
        // Move to next section
        const sectionSlug = nav.nextSection.toLowerCase().replace("_", "-");
        router.push(
          `/teacher/dashboard/learning/${assessmentId}/${sectionSlug}`
        );
      } else if (nav.isComplete) {
        setShowResults(true);
      }
    } else {
      // Fallback
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
  if (shortAnswers.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p>Loading assessment...</p>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const answeredCount = answers.filter((a) =>
    shortAnswers.some((q) => q.id === a.questionId)
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
                Short Answer
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
          <div className="flex items-center gap-2 mb-2">
            <FileText className="size-5 text-primary" />
            <span className="font-semibold text-primary">
              Short Answer Question
            </span>
          </div>
          <p className="text-lg sm:text-xl font-medium">
            {currentQuestion.prompt}
          </p>
        </CardHeader>
        <CardContent className="flex-1 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="answer">Your Answer</Label>
            <Textarea
              id="answer"
              placeholder="Type your answer here... (minimum 10 words)"
              className={`min-h-[400px] resize-none text-lg p-6 leading-relaxed ${
                error ? "border-destructive focus-visible:ring-destructive" : ""
              }`}
              value={currentAnswer}
              onChange={handleAnswerChange}
            />
            <div className="flex justify-between text-sm mt-2">
              <span className="text-destructive font-medium">{error}</span>
              <div className="flex gap-4 text-muted-foreground">
                <span className={wordCount < 10 ? "text-orange-500" : "text-green-600"}>
                  {wordCount} / 10 words
                </span>
                <span>{currentAnswer.length} chars</span>
              </div>
            </div>
          </div>
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
              You have completed the Short Answer section.
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
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShortAnswerPage;
  