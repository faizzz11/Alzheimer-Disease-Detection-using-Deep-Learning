/**
 * Shared roadmap structure used by AI Quiz post-quiz flow and Dashboard agent chat.
 * Mirrors logic previously inline in `ai-quiz/page.tsx` `handleGenerateRoadmap`.
 */

export interface RoadmapResourceItem {
  name: string;
  type: string;
}

export interface RoadmapStage {
  name: string;
  description: string;
  skills: string[];
  duration: string;
  resources: RoadmapResourceItem[];
}

export interface RoadmapData {
  title: string;
  experience: string;
  timeEstimate: string;
  overview: string;
  stages: RoadmapStage[];
  resources: RoadmapResourceItem[];
  proTips: string[];
}

export interface SuggestedTopic {
  title: string;
  description: string;
  icon: string;
  difficulty: string;
  duration: string;
}

export function buildSuggestedTopics(quizTopic: string): SuggestedTopic[] {
  return [
    {
      title: "Fundamentals",
      description: "Master the basics of " + quizTopic,
      icon: "🎯",
      difficulty: "Beginner",
      duration: "2-3 weeks",
    },
    {
      title: "Core Concepts",
      description: "Understand core principles of " + quizTopic,
      icon: "📚",
      difficulty: "Beginner",
      duration: "2-3 weeks",
    },
    {
      title: "Advanced Concepts",
      description: "Deep dive into advanced " + quizTopic + " concepts",
      icon: "🚀",
      difficulty: "Intermediate",
      duration: "3-4 weeks",
    },
    {
      title: "Practical Applications",
      description: "Real-world applications of " + quizTopic,
      icon: "💡",
      difficulty: "Intermediate",
      duration: "3-4 weeks",
    },
    {
      title: "Advanced Applications",
      description: "Complex applications and use cases",
      icon: "⚡",
      difficulty: "Advanced",
      duration: "4-5 weeks",
    },
    {
      title: "Specialization",
      description: "Focus on specific areas of " + quizTopic,
      icon: "🎓",
      difficulty: "Advanced",
      duration: "4-5 weeks",
    },
    {
      title: "Expert Level",
      description: "Master advanced techniques and methodologies",
      icon: "🌟",
      difficulty: "Expert",
      duration: "5-6 weeks",
    },
    {
      title: "Research & Innovation",
      description: "Explore cutting-edge developments",
      icon: "🔬",
      difficulty: "Expert",
      duration: "5-6 weeks",
    },
  ];
}

export type RoadmapLevelChoice = "beginner" | "intermediate" | "advanced";
