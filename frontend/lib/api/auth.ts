import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

// Simulated API responses
export const authApi = {
  // Sign in with mock data
  signIn: async (email: string, password: string) => {
    // Log the payload for debugging
    console.log("Login payload:", { email, password });

    // Make the real API call
    const response = await axios.post(
      `${API_URL}/auth/login`,
      { email, password },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Login failed");
    }

    // Return the backend's data structure
    return response.data.data;
  },

  // Sign up (mock)
  signUp: async (data: { email: string; password: string; role: string }) => {
    // Only send email, password, and role
    const { email, password, role } = data;
    console.log("Signup payload:", { email, password, role }); // <-- Add this line
    const response = await axios.post(
      `${API_URL}/auth/signup`,
      { email, password, role },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    if (!response.data.success) {
      throw new Error(response.data.message || "Signup failed");
    }
    return response.data.data;
  },

  // Get current user
  getCurrentUser: async () => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const userStr = localStorage.getItem("user");
    if (!userStr) {
      throw new Error("No user found");
    }

    const user = JSON.parse(userStr);

    // Ensure status field exists (for backward compatibility)
    if (!user.status) {
      user.status = "approved";
    }

    return user;
  },

  // Logout
  logout: async () => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return { success: true };
  },

  // Refresh token (mock)
  refreshToken: async () => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No token found");
    }

    return { token };
  },

  // Update profile
  updateProfile: async (data: any, token: string) => {
    const response = await axios.post(
      `${API_URL}/auth/profile`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.data.success) {
      throw new Error(response.data.message || "Profile update failed");
    }
    return response.data.data;
  },
};
