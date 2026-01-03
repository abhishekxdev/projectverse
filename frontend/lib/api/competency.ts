import api from "@/axios";
import Cookies from "js-cookie";

export interface Question {
  id: string;
  type: "MCQ" | "SHORT_ANSWER" | "AUDIO" | "VIDEO" | "UPLOAD_AUDIO" | "CHAT";
  domainKey: string;
  prompt: string;
  options?: string[];
  maxScore: number;
  order: number;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  active: boolean;
}

export interface CompetencyData {
  assessment: Assessment;
  questions: Question[];
}

export interface AttemptAnswer {
  questionId: string;
  answer: string;
}

export interface SelectedQuestion {
  questionId: string;
  order: number;
}

export interface Attempt {
  id: string;
  teacherId: string;
  assessmentId: string;
  status: "IN_PROGRESS" | "SUBMITTED" | "EVALUATED";
  answers: AttemptAnswer[];
  selectedQuestions: SelectedQuestion[];
  questions?: Question[]; // Present in create attempt response
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationResult {
  overallScore: number;
  proficiencyLevel: string;
}

export interface SubmitResponse {
  message: string;
  attemptId: string;
  status: string;
  result?: EvaluationResult;
}

export async function getCompetencyQuestions() {
  const usertoken = Cookies.get("token") || "";
  console.log("Fetching competency questions with token");
  const res = await api.get("/competency/questions", {
    headers: { Authorization: `Bearer ${usertoken}` },
  });
  return res.data;
}

export async function getCompetencyAttempt() {
  const usertoken = Cookies.get("token") || "";
  console.log("Fetching competency attempt");
  const res = await api.get("/competency/attempt", {
    headers: { Authorization: `Bearer ${usertoken}` },
  });
  console.log("Competency attempt response:", res.data);
  return res.data;
}

export async function startCompetencyAttempt() {
  const usertoken = Cookies.get("token") || "";
  console.log("Starting competency attempt");
  const res = await api.post(
    "/competency/attempts",
    {},
    {
      headers: { Authorization: `Bearer ${usertoken}` },
    }
  );
  console.log("Start competency attempt response:", res.data);
  return res.data;
}

export async function saveCompetencyProgress(
  attemptId: string,
  answers: AttemptAnswer[]
) {
  const usertoken = Cookies.get("token") || "";
  console.log(`Saving progress for attempt ${attemptId}`);
  const res = await api.patch(
    `/competency/attempts/${attemptId}`,
    { answers },
    {
      headers: { Authorization: `Bearer ${usertoken}` },
    }
  );
  return res.data;
}

export async function submitCompetencyAssessment(answers: AttemptAnswer[]) {
  const usertoken = Cookies.get("token") || "";
  console.log("Submitting assessment");
  const res = await api.post(
    "/competency/submit",
    { answers },
    {
      headers: { Authorization: `Bearer ${usertoken}` },
    }
  );
  return res.data;
}

