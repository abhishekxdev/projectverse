"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
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
  FileAudio,
  Mic,
  Pause,
  Play,
  Trash2,
  Upload,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

// Zod schema for audio file validation
const audioFileSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: "File size must be less than 10MB",
    })
    .refine(
      (file) =>
        [
          "audio/mpeg",
          "audio/mp3",
          "audio/wav",
          "audio/ogg",
          "audio/webm",
          "audio/m4a",
          "audio/x-m4a",
        ].includes(file.type),
      {
        message: "File must be an audio file (MP3, WAV, OGG, WebM, M4A)",
      }
    ),
});

const AudioPage = () => {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.id as string;

  // Store
  const setQuestions = useCompetencyStore((s) => s.setQuestions);
  const questionsMap = useCompetencyStore((s) => s.questions);
  const audioQuestions = useCompetencyStore((s) => s.questions.AUDIO);
  const answers = useCompetencyStore((s) => s.answers);
  const addAnswer = useCompetencyStore((s) => s.addAnswer);
  const attempt = useCompetencyStore((s) => s.attempt);

  // Local state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Audio specific state
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Derived
  const currentQuestion = audioQuestions[currentQuestionIndex];
  const totalQuestions = audioQuestions.length;
  const progress =
    totalQuestions > 0
      ? ((currentQuestionIndex + 1) / totalQuestions) * 100
      : 0;

  // Navigation Hook
  const nav = useAssessmentNavigator(currentQuestion?.id ?? "");

  // Fetch data on load if missing
  useEffect(() => {
    const loadData = async () => {
      const hasAnyQuestions =
        questionsMap.MCQ.length > 0 ||
        questionsMap.SHORT_ANSWER.length > 0 ||
        questionsMap.AUDIO.length > 0 ||
        questionsMap.VIDEO.length > 0;

      if (!hasAnyQuestions) {
        try {
          console.log("AudioPage: fetching questions...");
          const data = await getCompetencyQuestions();

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

  // Sync saved answer to local state when question changes
  useEffect(() => {
    const savedAnswer = answers.find(
      (a) => a.questionId === currentQuestion?.id
    )?.answer;

    if (savedAnswer) {
      // In a real app, this might be a URL from the server.
      // For now, if we have a text answer that looks like a filename, we just show it's uploaded.
      // We can't restore the File object or Blob URL from just a string unless it's a remote URL.
      setAudioFile(null); // Can't restore File
      setAudioUrl(null); // Can't restore URL easily without real backend storage returning it
      // We will rely on `savedAnswer` existence to show "File Uploaded" state
    } else {
      setAudioFile(null);
      setAudioUrl(null);
    }
    setError(null);
    setIsPlaying(false);
    setUploadProgress(0);
  }, [currentQuestion, answers]);

  const savedAnswer = answers.find(
    (a) => a.questionId === currentQuestion?.id
  )?.answer;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    const result = audioFileSchema.safeParse({ file });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioFile(file);
    setAudioUrl(URL.createObjectURL(file));
    setUploadProgress(0);
  };

  const deleteAudio = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioFile(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setUploadProgress(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleNext = async () => {
    if (!currentQuestion) return;

    // Handle Upload if there is a new file
    if (audioFile && attempt?.id) {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      try {
        // Mock API call delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        clearInterval(interval);
        setUploadProgress(100);

        const answerPayload = {
          questionId: currentQuestion.id,
          answer: `Uploaded: ${audioFile.name}`,
        };

        addAnswer(answerPayload);
        
        // Construct updated answers locally as store update won't be reflected in 'answers' yet
        const updatedAnswers = [
          ...answers.filter((a) => a.questionId !== currentQuestion.id),
          answerPayload,
        ];
        
        await saveCompetencyProgress(attempt.id, updatedAnswers);

        toast.success("Audio uploaded successfully!");
      } catch (error) {
        console.error("Upload failed:", error);
        toast.error("Failed to upload audio");
        setIsUploading(false);
        return; // Stop navigation if upload fails
      } finally {
        setIsUploading(false);
      }
    } else if (!savedAnswer && !audioFile) {
      // Block if no answer at all
      toast.error("Please upload an audio response.");
      return;
    }

    // Navigation logic
    if (nav) {
      if (nav.nextSection === "AUDIO") {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else if (nav.nextSection) {
        const sectionSlug = nav.nextSection.toLowerCase().replace("_", "-");
        router.push(
          `/teacher/dashboard/learning/${assessmentId}/${sectionSlug}`
        );
      } else if (nav.isComplete) {
        setShowResults(true);
      }
    } else {
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
  if (audioQuestions.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p>Loading assessment...</p>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const answeredCount = answers.filter((a) =>
    audioQuestions.some((q) => q.id === a.questionId)
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
                Audio Response
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
            <Mic className="size-5 text-primary" />
            <span className="font-semibold text-primary">Audio Task</span>
          </div>
          <p className="text-lg sm:text-xl font-medium">
            {currentQuestion.prompt}
          </p>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col p-6 gap-6">
          {savedAnswer ? (
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                  <FileAudio className="size-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Answer Uploaded</p>
                  <p className="text-xs text-muted-foreground">{savedAnswer}</p>
                </div>
                <CheckCircle2 className="size-5 text-green-500" />
              </div>
              <div className="mt-4">
                <p className="text-xs text-muted-foreground text-center">
                  To change your answer, please contact support or reset the
                  assessment.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col gap-4">
              <div
                className={`relative flex flex-1 flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
                  error
                    ? "border-destructive/50 bg-destructive/5"
                    : "border-muted-foreground/25 hover:bg-muted/50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileSelect}
                  className="absolute inset-0 cursor-pointer opacity-0"
                  disabled={isUploading}
                />
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                    <Upload className="size-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      MP3, WAV, M4A (max 10MB)
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}

              {audioFile && (
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <FileAudio className="size-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {audioFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={togglePlayback}
                        className="size-8"
                      >
                        {isPlaying ? (
                          <Pause className="size-4" />
                        ) : (
                          <Play className="size-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={deleteAudio}
                        className="size-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                  {audioUrl && (
                    <audio
                      ref={audioRef}
                      src={audioUrl}
                      onEnded={() => setIsPlaying(false)}
                      className="hidden"
                    />
                  )}
                  {isUploading && (
                    <div className="mt-4 space-y-1">
                      <Progress value={uploadProgress} className="h-1" />
                      <p className="text-xs text-muted-foreground text-center">
                        Uploading... {uploadProgress}%
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
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
            disabled={(!audioFile && !savedAnswer) || isUploading}
            className="w-full sm:w-auto"
          >
            {isUploading
              ? "Uploading..."
              : currentQuestionIndex === totalQuestions - 1
              ? "Next Section"
              : "Next"}
            {currentQuestionIndex !== totalQuestions - 1 && !isUploading && (
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
              You have completed the Audio Response section.
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

export default AudioPage;
    