"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { updateSchoolProfile } from "@/lib/api/school";
import { countries } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconExclamationCircle } from "@tabler/icons-react";
import Cookies from "js-cookie";
import { ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

// Mock school-admin data - replace with actual API data
const schools = [
  { value: "school-admin-1", label: "Springfield Elementary school-admin" },
  { value: "school-admin-2", label: "Riverdale High school-admin" },
  { value: "school-admin-3", label: "Greenwood Academy" },
  { value: "school-admin-4", label: "Oakridge International school-admin" },
  { value: "school-admin-5", label: "Maple Leaf Public school-admin" },
  { value: "school-admin-6", label: "Sunrise Secondary school-admin" },
  { value: "school-admin-7", label: "Heritage College" },
] as const;

const adminRoles = [
  "Principal",
  "Vice Principal",
  "Head of Department",
  "HR / PD Coordinator",
  "Other Admin",
] as const;

const schoolAdminOnboardingSchema = z.object({
  schoolName: z
    .string()
    .min(2, "school-admin name must be at least 2 characters")
    .max(100, "school-admin name must be less than 100 characters"),
  officialSchoolEmail: z
    .string()
    .email("Please enter a valid email address")
    .regex(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Please enter a valid school-admin email"
    ),
  adminRole: z.string().min(1, "Please select your role"),
  countryId: z.string().min(1, "Please select your country"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[\d\s\-\+\(\)]+$/, "Please enter a valid phone number"),
  schoolAddress: z
    .string()
    .min(10, "school-admin address must be at least 10 characters")
    .max(200, "school-admin address must be less than 200 characters"),
  logo: z.string().optional(),
});

type SchoolAdminOnboardingData = z.infer<typeof schoolAdminOnboardingSchema>;

const ErrorIcon = ({ message }: { message?: string }) => {
  if (!message) return null;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-auto">
            <IconExclamationCircle className="w-5 h-5 text-red-500" />
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="bg-accent text-white font-[inter]"
        >
          {message}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export function SchoolOnboardingForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [countryOpen, setCountryOpen] = useState(false);
  const router = useRouter();
  const { setUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<SchoolAdminOnboardingData>({
    resolver: zodResolver(schoolAdminOnboardingSchema),
    defaultValues: {
      schoolName: "",
      officialSchoolEmail: "",
      adminRole: "",
      countryId: "",
      phone: "",
      schoolAddress: "",
      logo: "",
    },
  });

  const countryId = watch("countryId");

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        setValue("logo", result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNextStep = async () => {
    const fieldsToValidate: Array<keyof SchoolAdminOnboardingData> = [
      "schoolName",
      "officialSchoolEmail",
      "adminRole",
      "countryId",
      "phone",
      "schoolAddress",
    ];
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep(2);
    }
  };

  const onSubmit = async (data: SchoolAdminOnboardingData) => {
    setIsLoading(true);
    try {
      const userStr = Cookies.get("user");
      const userToken = Cookies.get("token");
      if (userStr) {
        const user = JSON.parse(userStr);

        // Prepare the profile object with all required fields
        const profile = {
          schoolName: data.schoolName,
          contactName: data.schoolName, // or another contact name if needed
          officialSchoolEmail: data.officialSchoolEmail, // <-- required
          phone: data.phone, // <-- required
          schoolAddress: data.schoolAddress, // <-- required
          countryId: data.countryId,
          schoolAdminRole: data.adminRole,
          contactEmail: data.officialSchoolEmail, // if needed
          contactPhone: data.phone, // if needed
          address: data.schoolAddress, // if needed
          logo: data.logo,
        };

        // Log the exact payload and token
        const payload = {
          role: "school",
          profile,
        };
        console.log("API Request Payload:", payload);
        console.log("Authorization Token:", userToken);
        console.log("School admin onboarding payload:", profile);

        // Call the API
        await updateSchoolProfile(profile);

        // Fetch the latest user data from backend
        await useAuthStore.getState().refreshUser();

        toast.success("Profile completed successfully!", {
          icon: "🎉",
          description: "Welcome to GuruCool AI",
        });

        router.push("/school-admin/dashboard");
      }
    } catch (error) {
      toast.error("Failed to save profile", {
        description: "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full font-[montserrat]">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Complete Your School Profile</h1>
          <p className="text-muted-foreground mt-2">
            Tell us about yourself to get started
          </p>
        </div>

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className={step === 1 ? "text-primary" : ""}>
                School Information
              </BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className={step === 2 ? "text-primary" : ""}>
                Logo Upload
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            {step === 1 && (
              <>
                <Field>
                  <div className="relative flex flex-row">
                    <FieldLabel htmlFor="schoolName">School Name</FieldLabel>
                    {errors.schoolName && (
                      <ErrorIcon message={errors.schoolName?.message} />
                    )}
                  </div>
                  <Input
                    id="schoolName"
                    placeholder="Springfield Elementary school-admin"
                    {...register("schoolName")}
                  />
                </Field>

                <Field>
                  <div className="relative flex flex-row">
                    <FieldLabel htmlFor="officialSchoolEmail">
                      Official School Email
                    </FieldLabel>
                    {errors.officialSchoolEmail && (
                      <ErrorIcon
                        message={errors.officialSchoolEmail?.message}
                      />
                    )}
                  </div>
                  <Input
                    id="officialSchoolEmail"
                    type="email"
                    placeholder="admin@school-admin.edu"
                    {...register("officialSchoolEmail")}
                  />
                </Field>

                <Field>
                  <div className="relative flex flex-row">
                    <FieldLabel htmlFor="role">Your Role</FieldLabel>
                    {errors.adminRole && (
                      <ErrorIcon message={errors.adminRole?.message} />
                    )}
                  </div>
                  <Select
                    onValueChange={(value) => setValue("adminRole", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent className="font-[montserrat]">
                      {adminRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <div className="relative flex flex-row">
                    <FieldLabel htmlFor="countryId">
                      Select Your Country
                    </FieldLabel>
                    {errors.countryId && (
                      <ErrorIcon message={errors.countryId?.message} />
                    )}
                  </div>
                  <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={countryOpen}
                        className={cn(
                          "w-full justify-between font-normal",
                          !countryId && "text-muted-foreground"
                        )}
                      >
                        {countryId
                          ? countries.find((c) => c.id === countryId)?.label ||
                            "Select your country..."
                          : "Select your country..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-(--radix-popover-trigger-width) p-2">
                      <Command className="font-[montserrat]">
                        <CommandInput
                          placeholder="Search country..."
                          className="h-9 pb-2"
                        />
                        <CommandList>
                          <CommandEmpty>No country found.</CommandEmpty>
                          <CommandGroup>
                            {countries.map((country) => (
                              <CommandItem
                                key={country.id}
                                value={country.label}
                                onSelect={() => {
                                  setValue("countryId", country.id);
                                  setCountryOpen(false);
                                }}
                                className="cursor-pointer"
                              >
                                <p>{country.flag} </p>
                                {country.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </Field>

                <Field>
                  <div className="relative flex flex-row">
                    <FieldLabel htmlFor="phone">Phone</FieldLabel>
                    {errors.phone && (
                      <ErrorIcon message={errors.phone?.message} />
                    )}
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    {...register("phone")}
                  />
                </Field>

                <Field>
                  <div className="relative flex flex-row">
                    <FieldLabel htmlFor="schoolAddress">
                      School Address
                    </FieldLabel>
                    {errors.schoolAddress && (
                      <ErrorIcon message={errors.schoolAddress?.message} />
                    )}
                  </div>
                  <Input
                    id="schoolAddress"
                    placeholder="123 Main St, Springfield, IL 62701"
                    {...register("schoolAddress")}
                  />
                </Field>

                <Button
                  type="button"
                  className="w-full"
                  onClick={handleNextStep}
                >
                  Next: Upload Logo
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <Field>
                  <FieldLabel htmlFor="logo">
                    school-admin Logo (optional)
                  </FieldLabel>
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                </Field>

                {logoPreview && (
                  <div className="border rounded-lg p-4">
                    <h3 className="text-sm font-medium mb-3">Logo Preview</h3>
                    <div className="flex items-center gap-4">
                      <img
                        src={logoPreview}
                        alt="school-admin logo preview"
                        className="h-24 w-24 object-contain rounded border bg-muted"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Your school-admin logo will appear like this across
                          the platform
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            setLogoPreview(null);
                            setValue("logo", "");
                          }}
                        >
                          Remove Logo
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Spinner className="mr-2" />
                        Saving...
                      </>
                    ) : (
                      "Complete Profile"
                    )}
                  </Button>
                </div>
              </>
            )}
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}
