"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { teacherDirectory } from "@/lib/data";
import profile from "@/public/gurucool/avatar.png";
import { TeacherUser, useAuthStore } from "@/store/useAuthStore";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Pencil,
  SchoolIcon,
  User,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// Using Kabir Singh (pending status) from dashboard
const teacherData = teacherDirectory[5];

const TeacherProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = useAuthStore((state) => state.user) as TeacherUser | null;

  // Form data
  const [formData, setFormData] = useState({
    firstName: user?.data?.profile?.firstName ?? "",
    lastName: user?.data?.profile?.lastName ?? "",
    email: user?.data?.profile?.schoolEmail ?? "",
    address: user?.data?.profile?.address ?? "",
    profilePhoto: user?.data?.profile?.avatar ?? "",
    gender: user?.data?.profile?.gender ?? "",
    country: user?.data?.profile?.countryId ?? "",
    experience: user?.data?.profile?.teachingExperience ?? "",
    subjects: user?.data?.profile?.subjects ?? [], // ✅
    proficiencyLevel: user?.data?.profile?.proficiencyLevel ?? "",
    gradeLevels: user?.data?.profile?.gradeLevels ?? [], // ✅
    currentSchool: user?.data?.profile?.currentSchool ?? "",
    schoolId: user?.data?.profile?.schoolId ?? "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (user && user.data && user.data.profile) {
      setFormData({
        firstName: user.data.profile.firstName ?? "",
        lastName: user.data.profile.lastName ?? "",
        email: user.data.profile.schoolEmail ?? "",
        address: user.data.profile.address ?? "",
        profilePhoto: user.data.profile.avatar ?? "",
        gender: user.data.profile.gender ?? "",
        country: user.data.profile.countryId ?? "",
        experience: user.data.profile.teachingExperience ?? "",
        subjects: user.data.profile.subjects ?? [],
        proficiencyLevel: user.data.profile.proficiencyLevel ?? "",
        gradeLevels: user.data.profile.gradeLevels ?? [],
        currentSchool: user.data.profile.currentSchool ?? "",
        schoolId: user.data.profile.schoolId ?? "",
      });
    }
  }, [user]);
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      // Create object URL for preview
      const imageUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, profilePhoto: imageUrl }));
      toast.success("Profile photo updated!");
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleSave = () => {
    toast.success("Profile updated successfully!");
    setIsEditing(false);
    setEditingField(null);
  };

  const handleCancel = () => {
    setFormData({
      firstName: teacherData.firstName,
      lastName: teacherData.lastName,
      email: teacherData.email,
      address: teacherData.address,
      profilePhoto: teacherData.profilePhoto,
      gender: teacherData.gender,
      country: teacherData.country,
      experience: teacherData.teachingExperience,
      subjects: teacherData.subjects,
      proficiencyLevel: teacherData.proficiencyLevel,
      gradeLevels: teacherData.gradeLevels,
      currentSchool: teacherData.currentSchool,
      schoolId: teacherData.schoolId,
    });
    setIsEditing(false);
    setEditingField(null);
  };

  const isApproved = teacherData.approvalStatus === "approved";
  const isPending = teacherData.approvalStatus === "pending";

  const InfoRow = ({
    label,
    value,
    field,
    description,
    editable = true,
    multiline = false,
    renderValue,
  }: {
    label: string;
    value?: string | React.ReactNode;
    field?: string;
    description?: string;
    editable?: boolean;
    multiline?: boolean;
    renderValue?: () => React.ReactNode;
  }) => (
    <div className="flex items-center justify-between py-4 group">
      <div className="flex-shrink-0 w-64">
        <Label className="text-sm text-muted-foreground">{label}</Label>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className="flex-1 flex items-center justify-end gap-4">
        {isEditing && editingField === field && editable && field ? (
          multiline ? (
            <Textarea
              value={formData[field as keyof typeof formData] as string}
              onChange={(e) => handleInputChange(field, e.target.value)}
              rows={3}
              className="max-w-md"
            />
          ) : field === "gender" ? (
            <Select
              value={formData.gender}
              onValueChange={(value) => handleInputChange("gender", value)}
            >
              <SelectTrigger className="max-w-xs">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Input
              value={formData[field as keyof typeof formData] as string}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className="max-w-xs"
            />
          )
        ) : renderValue ? (
          renderValue()
        ) : (
          <p className="text-base text-right">{value}</p>
        )}
        {editable && field && !isEditing && (
          <button
            onClick={() => {
              setIsEditing(true);
              setEditingField(field);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Pencil className="size-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 font-[montserrat] max-w-6xl mx-auto w-full pb-16">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoUpload}
        className="hidden"
      />

      {/* Tabs */}
      <Tabs defaultValue="basic" className="w-full">
        <div className="flex items-center justify-between mb-6">
          <TabsList>
            <TabsTrigger value="basic">
              <User className="size-4 mr-2" />
              Basic Information
            </TabsTrigger>
            <TabsTrigger value="professional">
              <Briefcase className="size-4 mr-2" />
              Professional Information
            </TabsTrigger>
            <TabsTrigger value="school-admin">
              <SchoolIcon className="size-4 mr-2" />
              school-admin Information
            </TabsTrigger>
          </TabsList>
          {isEditing && (
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleCancel} size="sm">
                Discard
              </Button>
              <Button onClick={handleSave} size="sm">
                Change
              </Button>
            </div>
          )}
        </div>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-0">
          {/* Profile Photo */}
          <div className="flex items-center justify-between py-6 group">
            <div className="flex-shrink-0 w-64">
              <Label className="text-sm text-muted-foreground">
                Profile Photo
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Min 400×400px, PNG or JPEG formats.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative size-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                <Image
                  src={profile}
                  alt="Profile"
                  width={64}
                  height={64}
                  className="object-cover"
                />
                {/* Status indicator */}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePhotoClick}
                type="button"
              >
                Change
              </Button>
            </div>
          </div>

          <Separator />

          {/* Full Name with Badge */}
          <div className="flex items-center justify-between py-4 group">
            <div className="flex-shrink-0 w-64">
              <Label className="text-sm text-muted-foreground">Full Name</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your name will be visible to your contacts.
              </p>
            </div>
            <div className="flex-1 flex items-center justify-end gap-4">
              {isEditing && editingField === "fullName" ? (
                <div className="flex gap-2 items-center">
                  <Input
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    placeholder="First name"
                    className="w-40"
                  />
                  <Input
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    placeholder="Last name"
                    className="w-40"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-base">
                    {formData.firstName} {formData.lastName}
                  </p>
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
              )}
              {!isEditing && (
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setEditingField("fullName");
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Pencil className="size-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
          </div>

          <Separator />

          {/* Gender */}
          <InfoRow
            label="Gender"
            value={formData.gender}
            field="gender"
            editable={true}
          />

          <Separator />

          {/* Country */}
          <InfoRow
            label="Country"
            value={formData.country}
            field="country"
            editable={true}
          />

          <Separator />

          {/* Email */}
          <InfoRow
            label="Email Address"
            description="Business email address recommended."
            value={formData.email}
            field="email"
            renderValue={() => (
              <div className="flex items-center gap-2">
                <p className="text-base">{formData.email}</p>
                {teacherData.emailVerified && (
                  <CheckCircle2 className="size-4 text-green-500" />
                )}
              </div>
            )}
          />

          {/* Address */}
          <InfoRow
            label="Address"
            description="Legal residential address for billing details."
            value={formData.address}
            field="address"
            editable={true}
            multiline={true}
          />
        </TabsContent>

        {/* Professional Information Tab */}
        <TabsContent value="professional" className="space-y-0">
          {/* Teaching Experience */}
          <div className="py-4">
            <InfoRow
              label="Teaching Experience"
              value={formData.experience}
              field="experience"
              editable={true}
            />
          </div>

          <Separator />

          {/* Subjects */}
          <div className="flex items-center justify-between py-4">
            <div className="flex-shrink-0 w-64">
              <Label className="text-sm text-muted-foreground">Subjects</Label>
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              {formData.subjects.map((subject) => (
                <span
                  key={subject}
                  className="px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-md"
                >
                  {subject}
                </span>
              ))}
            </div>
          </div>

          <Separator />

          {/* Proficiency Level */}
          <InfoRow
            label="Proficiency Level"
            value={formData.proficiencyLevel}
            field="proficiencyLevel"
            editable={true}
          />

          <Separator />

          {/* Grade Levels */}
          <div className="flex items-center justify-between py-4">
            <div className="flex-shrink-0 w-64">
              <Label className="text-sm text-muted-foreground">
                Grade Levels
              </Label>
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              {formData.gradeLevels.map((grade) => (
                <span
                  key={grade}
                  className="px-3 py-1 text-sm font-medium bg-muted rounded-md"
                >
                  Grade {grade}
                </span>
              ))}
            </div>
          </div>

          <Separator />

          {/* Latest PD */}
          <InfoRow
            label="Latest PD"
            value={teacherData.latestPd}
            editable={false}
          />

          <Separator />

          {/* Last Active */}
          <InfoRow
            label="Last Active"
            value={teacherData.lastActive}
            editable={false}
          />
        </TabsContent>

        {/* school-admin Information Tab */}
        <TabsContent value="school-admin" className="space-y-0">
          {/* Current school-admin */}
          <div className="py-4">
            <InfoRow
              label="Current School"
              value={formData.schoolId}
              field="currentSchool"
              editable={true}
            />
          </div>
          <Separator />

          {/* Join Date */}
          <InfoRow
            label="Join Date"
            value={new Date(teacherData.joinDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            editable={false}
          />

          <Separator />

          {/* Statistics */}
          <div className="flex items-center justify-between py-4">
            <div className="flex-shrink-0 w-64">
              <Label className="text-sm text-muted-foreground">
                Statistics
              </Label>
            </div>
            <div className="flex gap-8">
              <div className="text-right">
                <Label className="text-xs text-muted-foreground block mb-1">
                  PD Completed
                </Label>
                <p className="text-2xl font-semibold">
                  {teacherData.totalPdCompleted}
                </p>
              </div>
              <div className="text-right">
                <Label className="text-xs text-muted-foreground block mb-1">
                  Badges Earned
                </Label>
                <p className="text-2xl font-semibold">
                  {teacherData.totalBadgesEarned}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherProfilePage;
