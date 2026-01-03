"use client";

import OngoingAssessments from "@/components/teacher-dashbaord/ongoing-assement";
import PerformanceCards from "@/components/teacher-dashbaord/performance-cards";
import SuggestedPD from "@/components/teacher-dashbaord/suggested-pd";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getCompetencyAttempt,
  startCompetencyAttempt,
} from "@/lib/api/competency";
import { TeacherUser, useAuthStore } from "@/store/useAuthStore";
import { useCompetencyStore } from "@/store/useCompetencyStore";
import { IconClipboard } from "@tabler/icons-react";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clipboard,
  Clock,
  GraduationCap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const TeacherDashboard = () => {
  const { setAttempt, setQuestions, setAnswers, setIsLoading } =
    useCompetencyStore();
  const [attemptStatus, setAttemptStatus] = useState<
    "IN_PROGRESS" | "EVALUATED" | null
  >(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [attemptLoading, setAttemptLoading] = useState(true);

  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        setAttemptLoading(true);
        const res = await getCompetencyAttempt();
        setAttemptStatus(res.data?.status ?? null);
        console.log("getCompetencyAttempt data:", res.data.status);
      } catch (err) {
        console.error("getCompetencyAttempt error:", err);
        setAttemptStatus(null);
      } finally {
        setAttemptLoading(false);
      }
    };

    fetchAttempt();
  }, []);

  const getCTAConfig = () => {
    if (attemptLoading) {
      return {
        title: "Loading...",
        description: "Please wait while we fetch your assessment status.",
        buttonText: "Loading...",
        onClick: () => {},
        disabled: true,
      };
    }

    switch (attemptStatus) {
      case "IN_PROGRESS":
        return {
          title: "In Progress",
          description:
            "You have an ongoing competency assessment. Continue where you left off.",
          buttonText: "Continue Assessment →",
          onClick: () => {
            setModalOpen(true);
          },
          disabled: false,
        };

      case "EVALUATED":
        return {
          title: "🎉 Congratulations, your result is here",
          description:
            "Your competency assessment has been evaluated. View your detailed results and insights.",
          buttonText: "Show Result →",
          onClick: () => {
            router.push("/teacher/dashboard/results");
          },
          disabled: false,
        };

      default:
        return {
          title: "Complete your first competency test",
          description:
            "Take your first assessment to unlock personalized learning paths, performance insights, and tailored professional development.",
          buttonText: "Start Competency Test →",
          onClick: () => setModalOpen(true),
          disabled: false,
        };
    }
  };

  const cta = getCTAConfig();

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };
  const teacher = useAuthStore((state) => state.user) as TeacherUser | null;

  const handleStartAttempt = async () => {
    try {
      setIsLoading(true);

      const res = await startCompetencyAttempt();

      console.log("Raw API response:", res);

      if (!res.success) throw new Error("Failed to start assessment");

      const data = res.data;

      setAttempt(data);
      setQuestions(data.questions); // ✅ EXACT structure
      setAnswers(data.answers ?? []);

      console.log("stored data", data);

      console.log("Stored questions:", data.questions);

      const firstMcqId = data.questions.MCQ[0].id;
      router.push(`/teacher/dashboard/learning/${firstMcqId}/mcqs`);
    } catch (err) {
      console.error("Start assessment failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const router = useRouter();

  if (!teacher || !teacher.data) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        Loading...
      </div>
    );
  }

  const isApproved = teacher.data.approvalStatus === "approved";
  const isPending = teacher.data.approvalStatus === "pending";

  return (
    <div className="flex flex-col">
      {/* User Profile Section - Full Width */}
      <section className="w-full border-b pb-6">
        <div className="font-[inter]">
          <div className="p-6">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <Avatar className="h-20 w-20 border-2 border-primary/20">
                  <AvatarImage
                    src="/gurucool/avatar.png"
                    alt={`${teacher.data.profile.firstName} ${teacher.data.profile.lastName}`}
                  />
                  <AvatarFallback className="text-xl font-semibold bg-primary/10">
                    {getInitials(
                      teacher.data?.profile?.firstName ?? "",
                      teacher.data?.profile?.lastName ?? ""
                    )}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-4">
                  <h3 className="font-semibold text-xl truncate">
                    {teacher.data?.profile?.firstName}{" "}
                    {teacher.data?.profile?.lastName}
                  </h3>
                  {isApproved && (
                    <Badge
                      variant="default"
                      className="bg-green-500 hover:bg-green-600 text-white gap-1"
                    >
                      <CheckCircle2 className="size-3" />
                      Verified
                    </Badge>
                  )}
                  {isPending && (
                    <Badge
                      variant="secondary"
                      className="bg-yellow-500/10 text-yellow-700 rounded-sm gap-1"
                    >
                      <Clock className="size-3" />
                      Unverified
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate mt-1">
                  Welcome back to thegurucool 👋🏻
                </p>

                {/* Additional User Info */}
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <GraduationCap className="size-3" />
                    <span>{teacher.data?.profile?.schoolId}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="size-3" />
                    <span>
                      {teacher.data?.profile?.subjects
                        ?.slice(0, 2)
                        .join(", ") || ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    <span>
                      Joined{" "}
                      {new Date(teacher?.data?.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8 flex-shrink-0">
                {/* Badges Count */}
                <div className="text-start">
                  <p className="text-xs text-muted-foreground mb-1">Badges</p>
                  <p className="text-4xl font-bold">
                    {teacher.data.profile.certificates
                      ? teacher.data.profile.certificates.split(",").length
                      : 0}
                  </p>
                </div>

                {/* Certificates Count */}
                <div className="text-start">
                  <p className="text-xs text-muted-foreground mb-1">
                    Certificates
                  </p>
                  <p className="text-4xl font-bold">
                    {teacher.data.profile.certificates
                      ? teacher.data.profile.certificates.split(",").length
                      : 0}
                  </p>
                </div>

                {/* Assessments Completed */}
                <div className="text-start">
                  <p className="text-xs text-muted-foreground mb-1">
                    Completed
                  </p>
                  <p className="text-4xl font-bold">
                    {teacher.data.completedAssessments || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Competency Test Banner */}
      <div className="w-full px-6 my-10">
        <Alert className="relative overflow-hidden rounded-2xl border border-orange-500/40 bg-linear-to-r from-orange-500 to-orange-700 text-white font-[montserrat] min-h-[220px] flex items-center">
          {/* Trophy Background Icon (right side) */}
          <div className="hidden md:block absolute right-0 bottom-0 pointer-events-none z-0">
            <IconClipboard className="size-84 opacity-20 rotate-[10deg]" />
          </div>

          {/* Background Accent */}
          <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 blur-3xl pointer-events-none z-0" />

          <div className="relative flex flex-1 items-center justify-between gap-6 p-8 z-10">
            {/* Left Content */}
            <div className="flex flex-col justify-center max-w-2xl">
              <AlertTitle className="text-3xl font-semibold leading-tight mb-1">
                {cta.title}
              </AlertTitle>
              <AlertDescription className="mt-2 text-base text-white/90">
                {cta.description}
              </AlertDescription>
              <div className="mt-5">
                <Button onClick={cta.onClick} disabled={cta.disabled}>
                  {cta.buttonText}
                </Button>
              </div>

              {/* Badges/Tags below the button */}
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge className="font-semibold px-3 py-1 rounded-md text-xs shadow">
                  Skill Assessment
                </Badge>
                <Badge className=" font-semibold px-3 py-1 rounded-md text-xs shadow">
                  Personalized Learning
                </Badge>
                <Badge className=" font-semibold px-3 py-1 rounded-md text-xs shadow">
                  Professional Growth
                </Badge>
              </div>
            </div>
          </div>
        </Alert>
      </div>

      {/* Instruction Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogOverlay className="bg-black/60 backdrop-blur-sm" />
        <DialogContent className="font-[inter] max-w-3xl! p-0 overflow-hidden">
          <DialogHeader className="bg-secondary px-8 pt-8 pb-4 flex flex-col items-center border-b">
            <div className="mb-4 flex items-center justify-center w-14 h-14 rounded-full bg-primary/10">
              <IconClipboard className="text-primary" size={36} />
            </div>
            <DialogTitle className="text-2xl font-bold text-center mb-2">
              Teacher Competency Benchmark
            </DialogTitle>
            <DialogDescription className="text-center text-base text-muted-foreground">
              Benchmark your teaching skills and unlock a personalized
              professional development journey.
            </DialogDescription>
          </DialogHeader>
          <div className="px-8 py-8 space-y-8 bg-background">
            <section>
              <h3 className="font-semibold mb-2 flex items-center gap-2 text-primary">
                <GraduationCap size={18} />
                Purpose
              </h3>
              <p className="text-sm text-muted-foreground">
                This assessment helps us understand your strengths and growth
                areas as an educator. Your results will shape your learning path
                and recommendations.
              </p>
            </section>
            <section>
              <h3 className="font-semibold mb-2 flex items-center gap-2 text-primary">
                <BookOpen size={18} />
                Domains Assessed
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-muted-foreground list-disc list-inside ml-4">
                <li>Pedagogy & Instructional Design</li>
                <li>Subject Knowledge</li>
                <li>Classroom Management</li>
                <li>Assessment & Feedback</li>
                <li>Technology Integration</li>
                <li>Professional Ethics</li>
              </ul>
            </section>
            <section>
              <h3 className="font-semibold mb-2 flex items-center gap-2 text-primary">
                <Clipboard size={18} />
                Question Types
              </h3>
              <ul className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <li className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                  Multiple Choice (MCQs)
                </li>
                <li className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                  Short Answer
                </li>
                <li className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                  Video Response
                </li>
                <li className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                  Audio Response
                </li>
              </ul>
            </section>
            <section>
              <h3 className="font-semibold mb-2 flex items-center gap-2 text-primary">
                <Clock size={18} />
                Duration
              </h3>
              <p className="text-sm text-muted-foreground">
                45 minutes &middot; Complete in one sitting for best results.
              </p>
            </section>
          </div>
          <DialogFooter className="bg-secondary px-8 py-6 border-t flex flex-row gap-3 justify-end">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Take Later
            </Button>
            <Button
              onClick={() => {
                handleStartAttempt();
                setModalOpen(false);
              }}
            >
              Begin Assessment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ongoing Assessments Section */}
      {/* Ongoing Assessments Section */}
      <section className="w-full border-b pb-8">
        <div className="px-6">
          <div className="font-[montserrat]">
            <h2 className="text-xl font-semibold mb-4 text-accent-foreground/80">
              Ongoing Assessments & Results
            </h2>
          </div>
          <OngoingAssessments />
        </div>
      </section>

      {/* Unverified Card and Blur ONLY for lower sections */}
      <div className="relative">
        {isPending && (
          <>
            {/* Blur overlay */}
            <div className="absolute inset-0 z-20 backdrop-blur-2xl bg-black/10 pointer-events-none rounded-xl font-[montserrat]" />
            {/* Unverified Card - perfectly centered */}
            <div className="absolute inset-0 z-30 flex items-center justify-center">
              <Card className="border rounded-xl shadow-lg px-8 py-6 flex flex-col items-center max-w-lg w-full mx-4 font-[inter]">
                <Clock className="text-yellow-500 mb-2" size={32} />
                <h2 className="text-lg font-semibold text-yellow-800 mb-1">
                  Your account is pending verification
                </h2>
                <p className="text-sm text-yellow-700 text-center mb-2">
                  You have limited access until your profile is verified by the
                  admin. Please contact your school administrator if you have
                  questions.
                </p>
              </Card>
            </div>
          </>
        )}

        <div
          className={
            isPending ? "pointer-events-none select-none opacity-60" : ""
          }
        >
          {/* Performance Section */}
          <section className="w-full border-b pb-8">
            <div className="px-6 pt-8">
              <div className="font-[montserrat]">
                <h2 className="text-xl font-semibold mb-4 text-accent-foreground/80">
                  Performance
                </h2>
                <PerformanceCards />
              </div>
            </div>
          </section>

          {/* Suggested PD's Section */}
          <section className="w-full pb-8">
            <div className="px-6 pt-8">
              <div className="font-[montserrat]">
                <h2 className="text-xl font-semibold mb-4 text-accent-foreground/80">
                  Suggested PD's
                </h2>
                <SuggestedPD />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
