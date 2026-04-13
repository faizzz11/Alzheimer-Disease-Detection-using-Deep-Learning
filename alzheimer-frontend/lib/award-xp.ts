import { getCollections } from "@/lib/mongodb-collections";

export const XP_VALUES = {
  quizGenerated: 15,
  quizCompleted: 5,
  podcastGenerated: 20,
  roadmapGenerated: 10,
  visualizerUsed: 12,
  aiMentorMessage: 8,
  interviewPrepCall: 25,
  animationGenerated: 12,
} as const;

export type XpEvent = keyof typeof XP_VALUES;

export async function awardXp(email: string, event: XpEvent, multiplier = 1) {
  const { users } = await getCollections();
  const amount = XP_VALUES[event] * multiplier;
  await users.updateOne({ email }, { $inc: { xp: amount } });
  return amount;
}
