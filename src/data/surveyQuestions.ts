export interface SurveyQuestions {
  satisfaction: string;
  ease: string;
  wouldRecommend: string;
  hadDifficulty: string;
  difficulty: string;
  triedOtherApps: string;
  comparison: string;
  occupation: string;
}

export const questions: SurveyQuestions = {
  satisfaction: "How satisfied are you with drawDB?",
  ease: "How easy was it to get started with drawDB?",
  wouldRecommend: "How likely are you to recommend drawDB?",
  hadDifficulty: "Did you encounter any difficulties when navigating drawDB?",
  difficulty: "What were the difficulties you faced?",
  triedOtherApps: "Have you tried apps like drawDB?",
  comparison: "How did you find drawDB as compared to other apps?",
  occupation: "What is your occupation?",
};
