"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getCompetencyAttempt, getCompetencyQuestions, Question, saveCompetencyProgress, submitCompetencyAssessment } from "@/lib/api/competency";
import { useAssessmentNavigator } from "@/store/useAssessmentNavigator";
import { useCompetencyStore } from "@/store/useCompetencyStore";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Film,
  HardDrive,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  Trash2,
  Upload,
  Video,
  Volume2,
  VolumeX
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

// Zod schema for video file validation
const videoFileSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 50 * 1024 * 1024, {
      message: "File size must be less than 50MB",
    })
    .refine(
      (file) =>
        [
          "video/mp4",
          "video/webm",
          "video/ogg",
          "video/quicktime",
          "video/x-msvideo",
        ].includes(file.type),
      {
        message: "File must be a video file (MP4, WebM, OGG, MOV, AVI)",
      }
    ),
});






const UploadVideoPage = () => {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.id as string;



  // Store
  const {
    questions,
    answers,
    attempt,
    setQuestions,
    addAnswer,
  } = useCompetencyStore();

  const videoQuestions = questions.VIDEO || [];
  
  
  // Local State for Navigation
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const currentQuestion = videoQuestions[currentQuestionIndex];
  const totalQuestions = videoQuestions.length;

  // Navigator
  const nav = useAssessmentNavigator(currentQuestion?.id ?? "");

  // Derived State
  const savedAnswer = answers.find((a) => a.questionId === currentQuestion?.id)?.answer;
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;
  const answeredCount = answers.filter((a) =>
    videoQuestions.some((q) => q.id === a.questionId)
  ).length;

  const [showResults, setShowResults] = useState(false);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const logAttemptData = async () => {
      try {
        const data = await getCompetencyAttempt();
        console.log("Competency Attempt Data:", data);
      } catch (error) {
        console.error("Failed to log competency attempt:", error);
      }
    };
    logAttemptData();
  }, []);

  // Load data if missing
  useEffect(() => {
    const loadData = async () => {
      const hasAnyQuestions =
        questions.MCQ.length > 0 ||
        questions.SHORT_ANSWER.length > 0 ||
        questions.AUDIO.length > 0 ||
        questions.VIDEO.length > 0;

      if (!hasAnyQuestions) {
        try {
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
  }, [questions, setQuestions]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
    };
  }, [videoUrl]);

  if (!currentQuestion) {
      return (
        <div className="flex h-full items-center justify-center p-6">
            <div className="text-center">Loading assessment...</div>
        </div>
      );
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate with zod
    const result = videoFileSchema.safeParse({ file });

    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    // Clear previous video
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }

    setVideoFile(file);
    setVideoUrl(URL.createObjectURL(file));
    setIsUploaded(false);
    setUploadProgress(0);
    setCurrentTime(0);
    setDuration(0);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    setError(null);

    // Validate with zod
    const result = videoFileSchema.safeParse({ file });

    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    // Clear previous video
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }

    setVideoFile(file);
    setVideoUrl(URL.createObjectURL(file));
    setIsUploaded(false);
    setUploadProgress(0);
    setCurrentTime(0);
    setDuration(0);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const deleteVideo = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoFile(null);
    setVideoUrl(null);
    setIsPlaying(false);
    setIsUploaded(false);
    setUploadProgress(0);
    setError(null);
    setCurrentTime(0);
    setDuration(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const togglePlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !videoRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pos = (event.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * duration;
  };

  const handleConfirmSubmit = async () => {
    try {
      setIsSubmitting(true);
      console.log("Submitting answers:", answers);
      await submitCompetencyAssessment(answers);
      toast.success("Assessment submitted successfully!");
      setShowConfirmation(false);
      router.push("/teacher/dashboard");
    } catch (error) {
      console.error("Failed to submit assessment:", error);
      toast.error("Failed to submit assessment");
      setIsSubmitting(false);
    }
  };

  const getAllQuestions = () => {
    return [
      ...(questions.MCQ || []),
      ...(questions.SHORT_ANSWER || []),
      ...(questions.AUDIO || []),
      ...(questions.VIDEO || [])
    ].sort((a, b) => a.order - b.order);
  };

  const getAnswerForQuestion = (questionId: string) => {
    return answers.find(a => a.questionId === questionId)?.answer;
  };

  const handleNext = async () => {
    if (!currentQuestion) return;

    let currentAnswers = [...answers];

    // Upload video if not already uploaded
    if (videoFile && attempt?.id && !savedAnswer && !isUploaded) {
      setIsUploading(true);
      setUploadProgress(0);

      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 5;
        });
      }, 150);

      try {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          clearInterval(interval);
          setUploadProgress(100);
          setIsUploaded(true);

          const answerPayload = {
              questionId: currentQuestion.id,
              answer: `Uploaded: ${videoFile.name}`
          };

          addAnswer(answerPayload);
          
          // Update local currentAnswers
          const existingIndex = currentAnswers.findIndex(a => a.questionId === answerPayload.questionId);
          if (existingIndex >= 0) {
              currentAnswers[existingIndex] = answerPayload;
          } else {
              currentAnswers.push(answerPayload);
          }

          await saveCompetencyProgress(attempt.id, [answerPayload]);
          toast.success("Video uploaded successfully!");
      } catch (error) {
          console.error("Upload failed:", error);
          toast.error("Failed to upload video");
          setIsUploading(false);
          return;
      } finally {
          setIsUploading(false);
      }
    }

    if (nav) {
      if (nav.nextSection === "VIDEO") {
        setCurrentQuestionIndex((prev) => prev + 1);
        setVideoFile(null);
        setVideoUrl(null);
        setIsUploaded(false);
      } else if (nav.nextSection) {
        const sectionSlug = nav.nextSection.toLowerCase().replace("_", "-");
        router.push(`/teacher/dashboard/learning/${assessmentId}/${sectionSlug}`);
      } else if (nav.isComplete) {
        setShowConfirmation(true);
      }
    } else {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            setVideoFile(null);
            setVideoUrl(null);
            setIsUploaded(false);
        } else {
             setShowConfirmation(true);
        }
    }
  };
  
  const handlePrevious = () => {
      router.back();
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col p-3 sm:p-6 font-[montserrat]">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={handlePrevious}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-semibold truncate">
              Competency Assessment
            </h1>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Badge variant="outline" className="text-xs">
                Video Response
              </Badge>
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                {totalQuestions} Questions
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col gap-4 overflow-hidden">
        {/* Scenario Question Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Badge variant="secondary">Video Task</Badge>
              Teaching Demonstration
            </CardTitle>
            <CardDescription>
              Record or upload a video demonstrating your teaching skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted/50 p-4 text-sm sm:text-base leading-relaxed">
              {currentQuestion.prompt}
            </div>
          </CardContent>
        </Card>

        {/* Video Upload Card */}
        <Card className="flex flex-1 flex-col overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">
              Upload Your Video Response
            </CardTitle>
            <CardDescription>
              Upload a video demonstrating your teaching approach. Maximum file
              size: 50MB
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col overflow-auto p-6 gap-6">
            {savedAnswer ? (
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                      <Video className="size-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Answer Uploaded</p>
                      <p className="text-xs text-muted-foreground">{savedAnswer}</p>
                    </div>
                    <CheckCircle2 className="size-5 text-green-500" />
                  </div>
                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground text-center">
                      To change your answer, please contact support or reset the assessment.
                    </p>
                  </div>
                </div>
            ) : !videoFile ? (
              <Empty
                className={`flex-1 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? "border-primary bg-primary/5 scale-[1.02]"
                    : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <div
                      className={`p-4 rounded-full transition-colors ${
                        isDragging ? "bg-primary/10" : "bg-muted"
                      }`}
                    >
                      <Video
                        className={`size-8 ${
                          isDragging ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                    </div>
                  </EmptyMedia>
                  <EmptyTitle className="text-lg">
                    {isDragging ? "Drop your video here" : "Upload your video"}
                  </EmptyTitle>
                  <EmptyDescription className="max-w-sm">
                    Drag and drop your video file here, or click to browse from
                    your device
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <div className="flex flex-col items-center gap-4">
                    <Button
                      variant="default"
                      size="lg"
                      type="button"
                      className="gap-2"
                    >
                      <Upload className="size-4" />
                      Choose Video File
                    </Button>
                    <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted">
                        <Film className="size-3" />
                        MP4, WebM, MOV
                      </span>
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted">
                        <HardDrive className="size-3" />
                        Max 50MB
                      </span>
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted">
                        <Clock className="size-3" />
                        2-5 min recommended
                      </span>
                    </div>
                  </div>
                </EmptyContent>
              </Empty>
            ) : (
              <div className="flex flex-1 flex-col gap-4">
                {/* Video Player Container */}
                <div className="w-full max-w-2xl mx-auto">
                  {/* Video Preview */}
                  <div className="relative rounded-xl overflow-hidden bg-black shadow-lg group">
                    {videoUrl && (
                      <video
                        ref={videoRef}
                        src={videoUrl}
                        className="w-full aspect-video object-contain"
                        onClick={togglePlayback}
                      />
                    )}

                    {/* Play/Pause Overlay */}
                    <button
                      onClick={togglePlayback}
                      className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <div className="size-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform transition-transform hover:scale-110">
                        {isPlaying ? (
                          <Pause className="size-7 text-gray-800" />
                        ) : (
                          <Play className="size-7 text-gray-800 ml-1" />
                        )}
                      </div>
                    </button>

                    {/* Video Controls */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {/* Progress Bar */}
                      <div
                        ref={progressRef}
                        className="h-1.5 bg-white/30 rounded-full mb-3 cursor-pointer overflow-hidden"
                        onClick={handleProgressClick}
                      >
                        <div
                          className="h-full bg-white rounded-full transition-all duration-100"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>

                      {/* Controls Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-8 text-white hover:bg-white/20"
                            onClick={togglePlayback}
                          >
                            {isPlaying ? (
                              <Pause className="size-4" />
                            ) : (
                              <Play className="size-4" />
                            )}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-8 text-white hover:bg-white/20"
                            onClick={handleRestart}
                          >
                            <RotateCcw className="size-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-8 text-white hover:bg-white/20"
                            onClick={toggleMute}
                          >
                            {isMuted ? (
                              <VolumeX className="size-4" />
                            ) : (
                              <Volume2 className="size-4" />
                            )}
                          </Button>
                          <span className="text-xs text-white/80 ml-2">
                            {formatTime(currentTime)} / {formatTime(duration)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* File Info Card */}
                  <div className="flex items-center justify-between mt-3 p-3 rounded-lg border bg-card">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Video className="size-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {videoFile.name}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <HardDrive className="size-3" />
                            {formatFileSize(videoFile.size)}
                          </span>
                          {duration > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock className="size-3" />
                              {formatTime(duration)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={deleteVideo}
                      disabled={isUploading}
                    >
                      <Trash2 className="size-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>

                {/* Upload Section */}
                <div className="w-full max-w-2xl mx-auto space-y-4">
                  {/* Upload Progress */}
                  {isUploading && (
                    <div className="space-y-2 p-4 rounded-lg border bg-muted/30">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Uploading video...</span>
                        <span className="text-muted-foreground">
                          {uploadProgress}%
                        </span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  )}
                  
                  <div className="w-full flex flex-wrap justify-center gap-4 text-xs text-muted-foreground pt-4">
                      <span>💡 Tip: Ensure good lighting and clear audio</span>
                      <span>📱 Record horizontally for best results</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive text-center">{error}</p>
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
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
                disabled={(!videoFile && !savedAnswer) || isUploading || isSubmitting || (!savedAnswer && !isUploaded && !videoFile)}
                className="w-full sm:w-auto"
              >
                {isSubmitting
                  ? "Submitting..."
                  : isUploading
                  ? "Uploading..."
                  : currentQuestionIndex === totalQuestions - 1
                  ? "Submit Assessment"
                  : "Next"}
                {currentQuestionIndex !== totalQuestions - 1 && !isUploading && !isSubmitting && (
                  <ArrowRight className="size-4 ml-2" />
                )}
              </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-2xl font-[montserrat]">
          <DialogHeader className="text-center bg-muted p-4"> 
            <DialogTitle>Confirm Submission</DialogTitle>
            <DialogDescription>
              Please review your answers before submitting. You won't be able to change them after submission.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] mt-4 p-4">
            <div className="space-y-6 pr-4">
              {getAllQuestions().map((q, index) => {
                const answer = getAnswerForQuestion(q.id);
                return (
                  <div key={q.id} className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="font-semibold min-w-[24px]">{index + 1}.</span>
                      <div className="space-y-1 flex-1">
                        <p className="text-sm font-medium">{q.prompt}</p>
                        <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                          {answer ? (
                            <span className="break-all">{answer}</span>
                          ) : (
                            <span className="text-destructive italic">Not answered</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          <DialogFooter className="mt-6 p-4 bg-muted">
            <Button
              variant="outline"
              onClick={() => setShowConfirmation(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Submitting...
                </>
              ) : (
                "Submit Response"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Results Dialog */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="sm:max-w-md font-[montserrat] p-8">
          <DialogHeader className="text-center sm:text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="size-8 text-green-600" />
            </div>
            <DialogTitle className="text-2xl">
              Section Completed! 🎉
            </DialogTitle>
            <DialogDescription>
              You have completed the Video Response section.
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

export default UploadVideoPage;
