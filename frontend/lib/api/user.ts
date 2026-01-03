import api from "@/axios";

export async function fetchCurrentUser(token: string) {
  const res = await api.get("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}