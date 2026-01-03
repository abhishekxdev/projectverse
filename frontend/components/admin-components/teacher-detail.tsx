"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TeacherDirectoryEntry } from "@/lib/data";
import { cn } from "@/lib/utils";
import {
  IconAward,
  IconCalendar,
  IconCertificate,
  IconChevronRight,
  IconCircle,
  IconCircleCheckFilled,
  IconCircleDot,
  IconClock,
  IconDownload,
  IconFileText,
  IconTarget,
  IconTrophy,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import React from "react";
import { Button } from "../ui/button";

interface TeacherDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher?: TeacherDirectoryEntry;
}

const tabs = [
  {
    id: "profile",
    title: "Profile",
    icon: IconUser,
  },
  {
    id: "certificates",
    title: "Certificates",
    icon: IconCertificate,
  },
  {
    id: "badges",
    title: "Badges",
    icon: IconAward,
  },
  {
    id: "assessments",
    title: "Assessments",
    icon: IconTarget,
  },
  {
    id: "submissions",
    title: "Submissions",
    icon: IconFileText,
  },
];

const TeacherDetails: React.FC<TeacherDetailsProps> = ({
  open,
  onOpenChange,
  teacher,
}) => {
  const [activeTab, setActiveTab] = React.useState("profile");

  if (!teacher) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="outline" className="gap-2 rounded-md px-3 py-1">
            <IconCircleCheckFilled className="size-3 fill-green-500 dark:fill-green-400" />
            <span>Approved</span>
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="gap-2 rounded-md px-3 py-1">
            <IconClock className="size-3 text-amber-500 dark:text-amber-400" />
            <span>Pending</span>
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="gap-2 rounded-md px-3 py-1">
            <IconX className="size-3 text-red-500 dark:text-red-400" />
            <span>Rejected</span>
          </Badge>
        );
      default:
        return null;
    }
  };

  const getProficiencyBadge = (level: string) => {
    return (
      <Badge variant="outline" className="gap-2 rounded-md px-3 py-1">
        {level === "Advanced" ? (
          <IconCircle className="size-3 fill-green-500 dark:fill-green-400" />
        ) : level === "Intermediate" ? (
          <IconCircleDot className="size-3 fill-blue-500 dark:fill-blue-400" />
        ) : (
          <IconCircle className="size-3 fill-amber-500 dark:fill-amber-400" />
        )}
        <span>{level}</span>
      </Badge>
    );
  };

  const handleDownload = (url: string) => {
    window.open(url, "_blank");
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <ScrollArea className="h-full">
            <div className="p-4 md:p-8">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger
                    value="personal"
                    className="text-xs md:text-sm px-2"
                  >
                    Personal
                  </TabsTrigger>
                  <TabsTrigger
                    value="professional"
                    className="text-xs md:text-sm px-2"
                  >
                    Professional
                  </TabsTrigger>
                  <TabsTrigger
                    value="statistics"
                    className="text-xs md:text-sm px-2"
                  >
                    Statistics
                  </TabsTrigger>
                </TabsList>

                {/* Personal Info Tab */}
                <TabsContent value="personal" className="space-y-3 mt-0">
                  {/* Profile Photo */}
                  <div className="flex flex-col md:flex-row items-start md:justify-between py-2 gap-3 md:gap-0">
                    <div className="flex-1 w-full md:pr-4">
                      <h3 className="text-sm font-semibold mb-0.5">
                        Profile Photo
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Teacher's profile picture
                      </p>
                    </div>
                    <Avatar className="h-16 w-16 border shrink-0">
                      <AvatarImage
                        src={teacher.profilePhoto}
                        alt={`${teacher.firstName} ${teacher.lastName}`}
                      />
                      <AvatarFallback className="text-lg">
                        {teacher.firstName[0]}
                        {teacher.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="border-dashed border" />

                  {/* Full Name */}
                  <div className="flex flex-col md:flex-row items-start md:justify-between py-2 gap-1 md:gap-0">
                    <div className="flex-1 w-full md:pr-4">
                      <h3 className="text-sm font-semibold mb-0.5">
                        Full Name
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Teacher's full legal name
                      </p>
                    </div>
                    <p className="text-sm font-medium text-left md:text-right w-full md:w-auto">
                      {teacher.firstName} {teacher.lastName}
                    </p>
                  </div>

                  <div className="border-dashed border" />

                  {/* Email Address */}
                  <div className="flex flex-col md:flex-row items-start md:justify-between py-2 gap-1 md:gap-0">
                    <div className="flex-1 w-full md:pr-4">
                      <h3 className="text-sm font-semibold mb-0.5">
                        Email Address
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Official email address
                      </p>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <p className="text-sm font-medium break-all">
                        {teacher.email}
                      </p>
                      {teacher.emailVerified && (
                        <Badge variant="outline" className="text-xs shrink-0">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="border-dashed border" />

                  {/* Phone Number */}
                  <div className="flex flex-col md:flex-row items-start md:justify-between py-2 gap-1 md:gap-0">
                    <div className="flex-1 w-full md:pr-4">
                      <h3 className="text-sm font-semibold mb-0.5">
                        Phone Number
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Contact phone number
                      </p>
                    </div>
                    <p className="text-sm font-medium w-full md:w-auto">
                      {teacher.phone}
                    </p>
                  </div>

                  <div className="border-dashed border" />

                  {/* Address */}
                  <div className="flex flex-col md:flex-row items-start md:justify-between py-2 gap-1 md:gap-0">
                    <div className="flex-1 w-full md:pr-4">
                      <h3 className="text-sm font-semibold mb-0.5">Address</h3>
                      <p className="text-xs text-muted-foreground">
                        Residential address
                      </p>
                    </div>
                    <p className="text-sm font-medium text-left md:text-right w-full md:max-w-xs">
                      {teacher.address}
                    </p>
                  </div>

                  <div className="border-dashed border" />

                  {/* Country */}
                  <div className="flex flex-col md:flex-row items-start md:justify-between py-2 gap-1 md:gap-0">
                    <div className="flex-1 w-full md:pr-4">
                      <h3 className="text-sm font-semibold mb-0.5">Country</h3>
                      <p className="text-xs text-muted-foreground">
                        Country of residence
                      </p>
                    </div>
                    <p className="text-sm font-medium w-full md:w-auto">
                      {teacher.country}
                    </p>
                  </div>

                  <div className="border-dashed border" />

                  {/* Gender */}
                  <div className="flex flex-col md:flex-row items-start md:justify-between py-2 gap-1 md:gap-0">
                    <div className="flex-1 w-full md:pr-4">
                      <h3 className="text-sm font-semibold mb-0.5">Gender</h3>
                      <p className="text-xs text-muted-foreground">
                        Gender identity
                      </p>
                    </div>
                    <p className="text-sm font-medium w-full md:w-auto">
                      {teacher.gender}
                    </p>
                  </div>

                  <div className="border-dashed border" />

                  {/* Join Date */}
                  <div className="flex flex-col md:flex-row items-start md:justify-between py-2 gap-1 md:gap-0">
                    <div className="flex-1 w-full md:pr-4">
                      <h3 className="text-sm font-semibold mb-0.5">
                        Join Date
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Date joined the platform
                      </p>
                    </div>
                    <p className="text-sm font-medium w-full md:w-auto">
                      {new Date(teacher.joinDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </TabsContent>

                {/* Professional Tab */}
                <TabsContent value="professional" className="space-y-3 mt-0">
                  {/* Approval Status */}
                  <div className="flex flex-col md:flex-row items-start md:justify-between py-2 gap-1 md:gap-0">
                    <div className="flex-1 w-full md:pr-4">
                      <h3 className="text-sm font-semibold mb-0.5">
                        Approval Status
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Current approval status
                      </p>
                    </div>
                    <div className="w-full md:w-auto">
                      {getStatusBadge(teacher.approvalStatus ?? "")}
                    </div>
                  </div>

                  <div className="border-dashed border" />

                  {/* school-admin Name */}
                  <div className="flex flex-col md:flex-row items-start md:justify-between py-2 gap-1 md:gap-0">
                    <div className="flex-1 w-full md:pr-4">
                      <h3 className="text-sm font-semibold mb-0.5">
                        school-admin Name
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Current affiliated school-admin
                      </p>
                    </div>
                    <p className="text-sm font-medium text-left md:text-right w-full md:max-w-xs">
                      {teacher.currentSchool}
                    </p>
                  </div>

                  <div className="border-dashed border" />

                  {/* Proficiency Level */}
                  <div className="flex flex-col md:flex-row items-start md:justify-between py-2 gap-1 md:gap-0">
                    <div className="flex-1 w-full md:pr-4">
                      <h3 className="text-sm font-semibold mb-0.5">
                        Proficiency Level
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Teaching proficiency level
                      </p>
                    </div>
                    <div className="w-full md:w-auto">
                      {getProficiencyBadge(teacher.proficiencyLevel)}
                    </div>
                  </div>

                  <div className="border-dashed border" />

                  {/* Teaching Experience */}
                  <div className="flex flex-col md:flex-row items-start md:justify-between py-2 gap-1 md:gap-0">
                    <div className="flex-1 w-full md:pr-4">
                      <h3 className="text-sm font-semibold mb-0.5">
                        Teaching Experience
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Total years of experience
                      </p>
                    </div>
                    <p className="text-sm font-medium w-full md:w-auto">
                      {teacher.teachingExperience}
                    </p>
                  </div>

                  <div className="border-dashed border" />

                  {/* Subjects */}
                  <div className="flex flex-col md:flex-row items-start md:justify-between py-2 gap-2 md:gap-0">
                    <div className="flex-1 w-full md:pr-4">
                      <h3 className="text-sm font-semibold mb-0.5">Subjects</h3>
                      <p className="text-xs text-muted-foreground">
                        Teaching subjects
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full md:w-auto md:max-w-xs md:justify-end">
                      {teacher.subjects.map((subject) => (
                        <Badge key={subject} variant="secondary">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="border-dashed border" />

                  {/* Grade Levels */}
                  <div className="flex flex-col md:flex-row items-start md:justify-between py-2 gap-2 md:gap-0">
                    <div className="flex-1 w-full md:pr-4">
                      <h3 className="text-sm font-semibold mb-0.5">
                        Grade Levels
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Teaching grade levels
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full md:w-auto md:max-w-xs md:justify-end">
                      {teacher.gradeLevels.map((grade) => (
                        <Badge key={grade} variant="outline">
                          Grade {grade}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="border-dashed border" />

                  {/* Last Active */}
                  <div className="flex flex-col md:flex-row items-start md:justify-between py-2 gap-1 md:gap-0">
                    <div className="flex-1 w-full md:pr-4">
                      <h3 className="text-sm font-semibold mb-0.5">
                        Last Active
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Most recent activity
                      </p>
                    </div>
                    <p className="text-sm font-medium w-full md:w-auto">
                      {teacher.lastActive}
                    </p>
                  </div>
                </TabsContent>

                {/* Statistics Tab */}
                <TabsContent value="statistics" className="space-y-6 mt-0">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center gap-4 p-5 bg-muted/50 rounded-lg border-dashed border">
                      <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                        <IconTrophy className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">
                          PD Completed
                        </p>
                        <p className="text-2xl font-bold">
                          {teacher.totalPdCompleted}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-5 bg-muted/50 rounded-lg border-dashed border">
                      <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                        <IconAward className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">
                          Badges Earned
                        </p>
                        <p className="text-2xl font-bold">
                          {teacher.totalBadgesEarned}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-5 bg-muted/50 rounded-lg border-dashed border">
                      <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                        <IconCalendar className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">
                          Total PD Hours
                        </p>
                        <p className="text-2xl font-bold">{teacher.pdHours}</p>
                      </div>
                    </div>
                  </div>

                  {/* Latest PD */}
                  {teacher.latestPd && (
                    <>
                      <div className="border-dashed border" />
                      <div className="flex flex-col md:flex-row items-start md:justify-between py-2 gap-1 md:gap-0">
                        <div className="flex-1 w-full md:pr-4">
                          <h3 className="text-sm font-semibold mb-0.5">
                            Latest Professional Development
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Most recent PD activity
                          </p>
                        </div>
                        <p className="text-sm font-medium text-left md:text-right w-full md:max-w-xs">
                          {teacher.latestPd}
                        </p>
                      </div>
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        );

      case "certificates":
        return teacher.certificates.length > 0 ? (
          <ScrollArea className="h-full">
            <div className="p-4 md:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {teacher.certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="flex flex-col items-center justify-center p-6 border-dashed border rounded-lg hover:bg-muted/50 transition-colors text-center gap-4 bg-card"
                  >
                    <div className="p-4 bg-primary/10 rounded-lg">
                      <IconCertificate className="h-10 w-10 text-primary" />
                    </div>
                    <div className="space-y-3 w-full">
                      <p className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]">
                        {cert.name}
                      </p>
                      <Badge
                        variant={
                          cert.type === "earned" ? "default" : "secondary"
                        }
                        className="text-xs"
                      >
                        {cert.type}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {new Date(cert.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        ) : (
          <Empty className="h-full border-0">
            <EmptyHeader className="max-w-md px-4">
              <EmptyMedia variant="icon" className="size-20 mb-4">
                <IconCertificate className="size-10" />
              </EmptyMedia>
              <EmptyTitle className="text-xl md:text-2xl">
                No Certificates Found
              </EmptyTitle>
              <EmptyDescription className="text-sm md:text-base">
                This teacher hasn't uploaded any certificates yet.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        );

      case "badges":
        return teacher.badges.length > 0 ? (
          <ScrollArea className="h-full">
            <div className="p-4 md:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {teacher.badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="flex flex-col items-center justify-center p-6 border-dashed border rounded-lg hover:bg-muted/50 transition-colors text-center gap-4 bg-card"
                  >
                    <div className="h-20 w-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shrink-0">
                      <IconAward className="h-10 w-10 text-white" />
                    </div>
                    <div className="space-y-3 w-full">
                      <p className="font-semibold text-sm line-clamp-1">
                        {badge.name}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                        {badge.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(badge.earnedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        ) : (
          <Empty className="h-full border-0">
            <EmptyHeader className="max-w-md px-4">
              <EmptyMedia variant="icon" className="size-20 mb-4">
                <IconAward className="size-10" />
              </EmptyMedia>
              <EmptyTitle className="text-xl md:text-2xl">
                No Badges Earned
              </EmptyTitle>
              <EmptyDescription className="text-sm md:text-base">
                This teacher hasn't earned any badges yet.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        );

      case "assessments":
        return teacher.assessments.length > 0 ? (
          <ScrollArea className="h-full">
            <div className="p-4 md:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {teacher.assessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="flex flex-col p-6 border-dashed border rounded-lg hover:bg-muted/50 transition-colors gap-4 bg-card"
                  >
                    <div className="flex items-start justify-between">
                      <div className="p-2.5 bg-primary/10 rounded-lg shrink-0">
                        <IconTarget className="h-6 w-6 text-primary" />
                      </div>
                      <Badge
                        variant={
                          assessment.status === "completed"
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs shrink-0"
                      >
                        {assessment.status}
                      </Badge>
                    </div>
                    <div className="space-y-4">
                      <p className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]">
                        {assessment.title}
                      </p>
                      {assessment.score !== undefined && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-primary h-full transition-all"
                                style={{
                                  width: `${assessment.score}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs font-semibold min-w-[3ch]">
                              {assessment.score}%
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-dashed">
                        <p>
                          Last attempt:{" "}
                          {new Date(
                            assessment.lastAttempt
                          ).toLocaleDateString()}
                        </p>
                        <p>Attempts: {assessment.attempts}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        ) : (
          <Empty className="h-full border-0">
            <EmptyHeader className="max-w-md px-4">
              <EmptyMedia variant="icon" className="size-20 mb-4">
                <IconTarget className="size-10" />
              </EmptyMedia>
              <EmptyTitle className="text-xl md:text-2xl">
                No Assessments Completed
              </EmptyTitle>
              <EmptyDescription className="text-sm md:text-base">
                This teacher hasn't completed any assessments yet.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        );

      case "submissions":
        if (teacher.submissionsError) {
          return (
            <div className="flex flex-col items-center justify-center h-full p-8">
              <p className="text-red-500 font-semibold mb-2">
                Unable to load submissions. Please try again.
              </p>
            </div>
          );
        }
        if (!teacher.submissions || teacher.submissions.length === 0) {
          return (
            <Empty className="h-full border-0">
              <EmptyHeader className="max-w-md px-4">
                <EmptyMedia variant="icon" className="size-20 mb-4">
                  <IconFileText className="size-10" />
                </EmptyMedia>
                <EmptyTitle className="text-xl md:text-2xl">
                  No submissions available
                </EmptyTitle>
                <EmptyDescription className="text-sm md:text-base">
                  This teacher hasn't completed any PD assessments yet.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          );
        }
        // Nested tabs for MCQ, Short Answer, Video, Audio
        return (
          <ScrollArea className="h-full">
            <div className="p-4 md:p-8 space-y-8">
              {teacher.submissions.map((assessment) => (
                <div
                  key={assessment.id}
                  className="border rounded-lg p-4 md:p-6 bg-card space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {assessment.title}
                      </h3>
                      <Badge
                        variant={
                          assessment.status === "completed"
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs ml-2"
                      >
                        {assessment.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Completed:{" "}
                      {new Date(assessment.completedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Tabs defaultValue="mcq" className="w-full mt-4">
                    <TabsList className="grid grid-cols-4 mb-6">
                      <TabsTrigger value="mcq" className="text-xs md:text-sm">
                        MCQs
                      </TabsTrigger>
                      <TabsTrigger
                        value="short_answer"
                        className="text-xs md:text-sm"
                      >
                        Short Answers
                      </TabsTrigger>
                      <TabsTrigger value="video" className="text-xs md:text-sm">
                        Video Transcripts
                      </TabsTrigger>
                      <TabsTrigger value="audio" className="text-xs md:text-sm">
                        Audio
                      </TabsTrigger>
                    </TabsList>
                    {/* MCQ Tab */}
                    <TabsContent value="mcq" className="space-y-4">
                      {assessment.questions.filter((q) => q.type === "mcq")
                        .length === 0 ? (
                        <div className="text-muted-foreground text-sm">
                          No MCQ responses available.
                        </div>
                      ) : (
                        assessment.questions
                          .filter((q) => q.type === "mcq")
                          .map((q, idx) => (
                            <div
                              key={q.id}
                              className="border rounded-md p-4 bg-muted/30 space-y-2"
                            >
                              <div className="font-medium mb-1">
                                Q{idx + 1}: {q.question}
                              </div>
                              <div className="text-sm">
                                <span className="font-semibold">
                                  Selected Option:
                                </span>{" "}
                                {q.response || (
                                  <span className="text-muted-foreground">
                                    No response
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                      )}
                    </TabsContent>
                    {/* Short Answer Tab */}
                    <TabsContent value="short_answer" className="space-y-4">
                      {assessment.questions.filter(
                        (q) => q.type === "short_answer"
                      ).length === 0 ? (
                        <div className="text-muted-foreground text-sm">
                          No short answer responses available.
                        </div>
                      ) : (
                        assessment.questions
                          .filter((q) => q.type === "short_answer")
                          .map((q, idx) => (
                            <div
                              key={q.id}
                              className="border rounded-md p-4 bg-muted/30 space-y-2"
                            >
                              <div className="font-medium mb-1">
                                Q{idx + 1}: {q.question}
                              </div>
                              <div className="bg-background rounded p-2 text-sm border">
                                {q.response || (
                                  <span className="text-muted-foreground">
                                    No response provided.
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                      )}
                    </TabsContent>
                    {/* Video Tab */}
                    <TabsContent value="video" className="space-y-4">
                      {assessment.questions.filter((q) => q.type === "video")
                        .length === 0 ? (
                        <div className="text-muted-foreground text-sm">
                          No video transcripts available.
                        </div>
                      ) : (
                        assessment.questions
                          .filter((q) => q.type === "video")
                          .map((q, idx) => (
                            <div
                              key={q.id}
                              className="border rounded-md p-4 bg-muted/30 space-y-2"
                            >
                              <div className="font-medium mb-1">
                                Q{idx + 1}: {q.question}
                              </div>
                              {q.transcript ? (
                                <div className="bg-background rounded p-2 text-sm border mb-2">
                                  {q.transcript}
                                </div>
                              ) : (
                                <div className="text-muted-foreground mb-2">
                                  No transcript available.
                                </div>
                              )}
                              {q.transcriptUrl ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-2"
                                  onClick={() =>
                                    handleDownload(q.transcriptUrl!)
                                  }
                                >
                                  <IconDownload className="size-4" />
                                  Download Transcript
                                </Button>
                              ) : null}
                              {q.transcriptUrl &&
                                q.transcriptUrl.endsWith(".mp4") && (
                                  <video
                                    src={q.transcriptUrl}
                                    controls
                                    className="w-full max-w-md mt-2 rounded"
                                  />
                                )}
                            </div>
                          ))
                      )}
                    </TabsContent>
                    {/* Audio Tab */}
                    <TabsContent value="audio" className="space-y-4">
                      {assessment.questions.filter((q) => q.type === "audio")
                        .length === 0 ? (
                        <div className="text-muted-foreground text-sm">
                          No audio transcripts available.
                        </div>
                      ) : (
                        assessment.questions
                          .filter((q) => q.type === "audio")
                          .map((q, idx) => (
                            <div
                              key={q.id}
                              className="border rounded-md p-4 bg-muted/30 space-y-2"
                            >
                              <div className="font-medium mb-1">
                                Q{idx + 1}: {q.question}
                              </div>
                              {q.transcript ? (
                                <div className="bg-background rounded p-2 text-sm border mb-2">
                                  {q.transcript}
                                </div>
                              ) : (
                                <div className="text-muted-foreground mb-2">
                                  No transcript available.
                                </div>
                              )}
                              {q.transcriptUrl ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-2"
                                  onClick={() =>
                                    handleDownload(q.transcriptUrl!)
                                  }
                                >
                                  <IconDownload className="size-4" />
                                  Download Transcript
                                </Button>
                              ) : null}
                              {q.transcriptUrl &&
                                q.transcriptUrl.endsWith(".mp3") && (
                                  <audio
                                    src={q.transcriptUrl}
                                    controls
                                    className="w-full max-w-md mt-2 rounded"
                                  />
                                )}
                            </div>
                          ))
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              ))}
            </div>
          </ScrollArea>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="" />
      <DialogContent className="max-w-[95vw] md:max-w-[85vw] lg:max-w-[60vw] h-[95vh] md:h-[90vh] p-0 font-[montserrat] gap-0">
        <div className="flex flex-col md:flex-row h-full overflow-hidden">
          {/* Sidebar */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r flex flex-col shrink-0">
            <div className="p-4 md:p-6 border-b">
              <DialogTitle className="text-lg md:text-xl font-semibold">
                Teacher Details
              </DialogTitle>
              <DialogDescription className="text-xs md:text-sm text-muted-foreground mt-1">
                View teacher information
              </DialogDescription>
            </div>

            {/* Tabs Navigation */}
            <div className="p-2 md:p-4">
              <ScrollArea className="w-full">
                <div className="flex flex-row md:flex-col gap-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          "flex items-center gap-2 md:gap-3 px-3 py-2 rounded-md transition-colors relative whitespace-nowrap shrink-0",
                          isActive &&
                            "md:before:absolute md:before:left-0 md:before:w-1.5 md:before:h-6 md:before:bg-primary md:before:rounded-r-md",
                          isActive && "bg-primary/10 md:bg-transparent"
                        )}
                      >
                        <div
                          className={cn(
                            "p-1.5 rounded-md transition-colors",
                            isActive
                              ? "text-primary"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <Icon className="size-4 md:size-5" />
                        </div>
                        <span
                          className={cn(
                            "text-xs md:text-sm font-medium transition-colors text-left",
                            isActive
                              ? "text-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {tab.title}
                        </span>
                        {isActive && (
                          <IconChevronRight className="hidden md:block size-4 text-muted-foreground shrink-0 ml-auto" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-hidden min-w-0">
            {renderTabContent()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeacherDetails;
