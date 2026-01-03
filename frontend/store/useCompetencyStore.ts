import { Attempt, AttemptAnswer, Question } from "@/lib/api/competency";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type QuestionGroups = {
  MCQ: Question[];
  SHORT_ANSWER: Question[];
  AUDIO: Question[];
  VIDEO: Question[];
};

interface CompetencyState {
  attempt: Attempt | null;
  questions: QuestionGroups;
  answers: AttemptAnswer[];
  isLoading: boolean;

  setAttempt: (attempt: Attempt | null) => void;
  setQuestions: (questions: QuestionGroups) => void;
  setAnswers: (answers: AttemptAnswer[]) => void;
  addAnswer: (answer: AttemptAnswer) => void;
  setIsLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useCompetencyStore = create<CompetencyState>()(
  persist(
    (set) => ({
      attempt: null,
      questions: {
        MCQ: [],
        SHORT_ANSWER: [],
        AUDIO: [],
        VIDEO: [],
      },
      answers: [],
      isLoading: false,

      setAttempt: (attempt) => set({ attempt }),

      setQuestions: (questions) => set({ questions }),

      setAnswers: (answers) => set({ answers }),

      addAnswer: (newAnswer) =>
        set((state) => {
          const idx = state.answers.findIndex(
            (a) => a.questionId === newAnswer.questionId
          );
          const updated = [...state.answers];

          if (idx >= 0) updated[idx] = newAnswer;
          else updated.push(newAnswer);

          return { answers: updated };
        }),

      setIsLoading: (isLoading) => set({ isLoading }),

      reset: () =>
        set({
          attempt: null,
          questions: {
            MCQ: [],
            SHORT_ANSWER: [],
            AUDIO: [],
            VIDEO: [],
          },
          answers: [],
          isLoading: false,
        }),
    }),
    {
      name: "competency-storage",
    }
  )
);
