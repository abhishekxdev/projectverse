"use client";

import { useCompetencyStore } from "@/store/useCompetencyStore";
import { useMemo } from "react";

export const ASSESSMENT_FLOW = [
  "MCQ",
  "SHORT_ANSWER",
  "AUDIO",
  "VIDEO",
] as const;

export type SectionType = typeof ASSESSMENT_FLOW[number];

type NavigatorResult = {
  nextQuestionId: string | null;
  nextSection: SectionType | null;
  isComplete: boolean;
};

export const useAssessmentNavigator = (
  currentQuestionId: string
): NavigatorResult => {
  const questions = useCompetencyStore((state) => state.questions);

  return useMemo(() => {
    // 1️⃣ Find current section
    const currentSection = ASSESSMENT_FLOW.find((section) =>
      questions[section]?.some((q) => q.id === currentQuestionId)
    );

    // 🚨 Defensive fallback (should not happen)
    if (!currentSection) {
      return {
        nextQuestionId: null,
        nextSection: null,
        isComplete: false,
      };
    }

    const sectionQuestions = questions[currentSection];
    const currentIndex = sectionQuestions.findIndex(
      (q) => q.id === currentQuestionId
    );

    // 2️⃣ Next question in SAME section
    if (currentIndex < sectionQuestions.length - 1) {
      return {
        nextQuestionId: sectionQuestions[currentIndex + 1].id,
        nextSection: currentSection,
        isComplete: false,
      };
    }

    // 3️⃣ Move to NEXT section
    const nextSectionIndex = ASSESSMENT_FLOW.indexOf(currentSection) + 1;

    if (nextSectionIndex < ASSESSMENT_FLOW.length) {
      const nextSection = ASSESSMENT_FLOW[nextSectionIndex];
      const firstQuestion = questions[nextSection]?.[0];

      return {
        nextQuestionId: firstQuestion?.id ?? null,
        nextSection: firstQuestion ? nextSection : null,
        isComplete: false,
      };
    }

    // 4️⃣ End of assessment
    return {
      nextQuestionId: null,
      nextSection: null,
      isComplete: true,
    };
  }, [questions, currentQuestionId]);
};
