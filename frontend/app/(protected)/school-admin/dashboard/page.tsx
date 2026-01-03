"use client";
import AssignpdSchool from "@/components/school-admin-dashboard/assignpd-school";
import DataCards from "@/components/school-admin-dashboard/data-cards";
import TeacherPending from "@/components/school-admin-dashboard/teacher-pending";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { mockSchool } from "@/lib/data";
import { SchoolAdminUser, useAuthStore } from "@/store/useAuthStore";
import { IconRosetteDiscountCheckFilled } from "@tabler/icons-react";
import {
  AlertTriangle,
  Building2,
  Calendar,
  Clock,
  MapPin,
  X,
} from "lucide-react";
import { Link } from "next-view-transitions";

const SchoolDashboard = () => {
  const school = mockSchool;
  const user = useAuthStore((state) => state.user) as SchoolAdminUser | null;

  // Mock verification status - you can change this based on your requirements
  const isVerified = true;
  const pendingTeacherApprovals = 9;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="flex flex-col font-[montserrat]">
      {/* school Profile Section - Full Width */}
      <section className="w-full border-b pb-6">
        <div className="">
          <div className="p-6">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <Avatar className="h-20 w-20 border-2 border-primary/20">
                  <AvatarImage src={school.logo} alt={school.name} />
                  <AvatarFallback className="text-xl font-semibold bg-primary/10">
                    {getInitials(school.name)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* school Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-4">
                  <h3 className="font-semibold text-xl truncate">
                    {school.name}
                  </h3>
                  {isVerified ? (
                    <div className="text-green-500">
                      <IconRosetteDiscountCheckFilled className="size-5" />
                    </div>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-yellow-500/60 text-yellow-700 rounded-sm gap-1"
                    >
                      <Clock className="size-3" />
                      Unverified
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate mt-1">
                  Welcome to your school dashboard 👋🏻
                </p>

                {/* Additional school Info */}
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="size-3" />
                    <span>{school.address.split(",")[0]}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Building2 className="size-3" />
                    <span>{school.principalName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    <span>Est. {school.establishedYear}</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8 flex-shrink-0">
                {/* Teachers Count */}
                <div className="text-start">
                  <p className="text-xs text-muted-foreground mb-1">Teachers</p>
                  <p className="text-4xl font-bold">{school.totalTeachers}</p>
                </div>

                {/* Pending Approvals */}
                <div className="text-start">
                  <p className="text-xs text-muted-foreground mb-1">Pending</p>
                  <p className="text-4xl font-bold">
                    {pendingTeacherApprovals}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* {(user?.status === "pending" ||
        user?.status === "rejected" ||
        user?.approvalStatus === "pending" ||
        user?.approvalStatus === "rejected") && (
        <div className="flex items-center justify-center w-full px-6 py-6 mb-8">
          <Alert className="dark:bg-red-500/50 dark:border-red-500/50 bg-red-500 border-red-500 text-white [&>svg]:text-white font-[montserrat]">
            <AlertTriangle />
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 flex-1 justify-center">
                <AlertTitle className="text-white">
                  Your account is{" "}
                  {user?.status === "pending" ||
                  user?.approvalStatus === "pending"
                    ? "pending approval"
                    : "rejected"}
                  !
                </AlertTitle>
                <span className="text-white/80">·</span>
                <AlertDescription className="text-white/90 inline">
                  {user?.status === "pending" ||
                  user?.approvalStatus === "pending"
                    ? "Your account is under review. You will be notified once it's approved."
                    : "Your account has been rejected. Please contact support for more information."}
                </AlertDescription>
              </div>
              <button className="text-white/80 hover:text-white ml-4 flex-shrink-0">
                <X className="size-4" />
              </button>
            </div>
          </Alert>
        </div>
      )} */}

      {/* Pending Approvals Banner */}
      {pendingTeacherApprovals > 0 && (
        <div className="flex items-center justify-center w-full px-6 py-6 mb-8">
          <Alert className="dark:bg-orange-500/50 dark:border-orange-500/50 bg-orange-500 border-orange-500 text-white [&>svg]:text-white font-[montserrat]">
            <AlertTriangle />
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 flex-1 justify-center">
                <AlertTitle className="text-white">
                  {pendingTeacherApprovals} teacher approval
                  {pendingTeacherApprovals > 1 ? "s" : ""} pending!
                </AlertTitle>
                <span className="text-white/80">·</span>
                <AlertDescription className="text-white/90 inline">
                  Review and approve teacher registrations to grant them access.
                </AlertDescription>
                <Link
                  href="/school/dashboard/pending-approvals"
                  className="text-white font-semibold underline underline-offset-4 hover:text-white/90"
                >
                  Review Now
                </Link>
              </div>
              <button className="text-white/80 hover:text-white ml-4 flex-shrink-0">
                <X className="size-4" />
              </button>
            </div>
          </Alert>
        </div>
      )}

      {/* User status notification */}
      {user?.status === "pending" || user?.status === "rejected" || user?.approvalStatus === "pending" || user?.approvalStatus === "rejected" ? (
        <div className="w-full flex justify-center py-6">
          <Card className="w-full max-w-lg mx-4 border rounded-xl shadow font-[montserrat] px-6 py-5 flex flex-col items-center bg-muted text-muted-foreground">
            {user?.status === "pending" || user?.approvalStatus === "pending" ? (
              <Clock className="mb-2 text-muted-foreground" size={32} />
            ) : (
              <X className="mb-2 text-muted-foreground" size={32} />
            )}
            <h2 className="text-lg font-semibold mb-1">
              {user?.status === "pending" || user?.approvalStatus === "pending"
                ? "Your account is pending verification"
                : "Your account has been rejected"}
            </h2>
            <p className="text-sm text-center mb-2">
              {user?.status === "pending" || user?.approvalStatus === "pending"
                ? "You have limited access until your profile is verified by the admin. Please contact your school administrator if you have questions."
                : "Your account has been rejected. Please contact support for more information."}
            </p>
          </Card>
        </div>
      ) : null}

      <div
        className={
          user?.status === "pending" || user?.status === "rejected" || user?.approvalStatus === "pending" || user?.approvalStatus === "rejected"
            ? "blur-lg pointer-events-none"
            : ""
        }
      >
        {/* Analytics Section */}
        <section className="w-full border-b pb-8">
          <div className="px-6">
            <div className="font-[montserrat]">
              <h2 className="text-xl font-semibold mb-4 text-accent-foreground/80">
                Analytics Overview
              </h2>
              <DataCards />
            </div>
          </div>
        </section>

        {/* PD Assignment Section */}
        <section className="w-full border-b py-8">
          <div className="px-6">
            <div className="font-[montserrat]">
              <h2 className="text-xl font-semibold mb-4 text-accent-foreground/80">
                Assign Professional Development
              </h2>
              <AssignpdSchool pdCount={4} />
            </div>
          </div>
        </section>

        {/* Pending Teachers Table Section */}
        <section className="w-full py-8">
          <div className="px-6">
            <div className="font-[montserrat]">
              <h2 className="text-xl font-semibold mb-4 text-accent-foreground/80">
                Pending Teachers
              </h2>
              <TeacherPending
                showFiltersAndSearch={false}
                key="pending-teachers"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SchoolDashboard;
