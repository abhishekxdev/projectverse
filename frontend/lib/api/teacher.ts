import api from "@/axios";
import Cookies from "js-cookie";

export const updateTeacherProfile = async (data: any) => {
  const token = Cookies.get("token");
  const response = await api.put("/auth/profile", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};