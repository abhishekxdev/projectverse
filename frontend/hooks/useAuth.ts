"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignUpData {
  email: string;
  password: string;
  name: string;
  role: "teacher" | "school-admin" | "admin";
}

export const useAuth = () => {
  const router = useRouter();
  const {
    user,
    loading,
    error,
    isAuthenticated,
    signIn: storeSignIn,
    signUp: storeSignUp,
    logout: storeLogout,
    checkAuth,
  } = useAuthStore();

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const signIn = async (credentials: LoginCredentials) => {
    try {
      const response = await storeSignIn(
        credentials.email,
        credentials.password
      );

      const { user: loggedInUser } = response;

      // Log the first name (for teacher users)
      if (loggedInUser.role === "school_teacher" && loggedInUser.profile) {
        console.log("First name from store:", loggedInUser.profile?.firstName);
      } else {
        console.log("User from store:", loggedInUser?.profile?.firstName);
      }

      // Check status first - handle rejected accounts
      if (loggedInUser.status === "rejected") {
        await storeLogout();
        throw new Error(
          "Your account has been rejected. Please contact support."
        );
      }

      // Handle teachers - no pending screen, go directly to profile
      if (loggedInUser.role === "school_teacher") {
        if (!loggedInUser.profileCompleted) {
          router.push("/onboarding/teacher");
        } else {
          // Go to profile page regardless of pending/approved status
          router.push("/teacher/dashboard/profile");
        }
        return response;
      }

      // Handle school-admin admins - check profile completion first
      if (loggedInUser.role === "school_admin") {
        if (!loggedInUser.profileCompleted) {
          // Profile not completed - go to onboarding first
          router.push("/onboarding/school-admin");
        } else if (loggedInUser.status === "pending") {
          // Profile completed but pending approval
          router.push("/school-admin/pending");
        } else if (loggedInUser.status === "approved") {
          // Profile completed and approved - go to dashboard
          router.push("/school-admin/dashboard");
        }
        return response;
      }

      // Handle admin
      if (loggedInUser.role === "platform_admin") {
        router.push("/admin/dashboard");
        return response;
      }

      return response;
    } catch (err: any) {
      throw err;
    }
  };

  const signUp = async (data: SignUpData) => {
    try {
      const response = await storeSignUp(data);

      const { user: newUser } = response;

      // After signup, all new users go to onboarding first
      if (newUser.role === "school_teacher") {
        router.push("/onboarding/teacher");
      } else if (newUser.role === "school" || newUser.role === "school_admin") {
        router.push("/onboarding/school-admin");
      }

      return response;
    } catch (err: any) {
      throw err;
    }
  };

  const logout = async () => {
    await storeLogout();
    router.push("/login");
  };

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    logout,
    isAuthenticated,
  };
};
