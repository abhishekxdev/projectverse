import api from "@/axios";
import Cookies from "js-cookie";

export async function getAllSchools() {
  const res = await api.get("/schools");
  res.data.data.forEach((school: any) => {
    console.log(
      "Fetched school:",
      school.id,
      school.name,
      school.verificationStatus
    );
  });
  return res.data.data.map((school: any) => ({
    id: school.id,
    name: school.name,
    status: school.verificationStatus,
  }));
}

export async function updateSchoolProfile(profile: any) {
  const usertoken = Cookies.get("token") || "";

  console.log("Updating school profile with token:", usertoken);
  const res = await api.put(
    "/auth/profile",
    {
      role: "school",
      profile,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${usertoken}`,
      },
    }
  );
  console.log("Update school profile response:", res.data);
  return res.data;
}
