import { prisma } from "@/lib/prisma";
import { getToday } from "@/lib/utils";

export async function updateStreak(userId: string) {
  const today = getToday();

  const streakData = await prisma.streakData.upsert({
    where: { userId },
    create: { userId, currentStreak: 1, longestStreak: 1, lastActiveDate: today },
    update: {},
  });

  if (streakData.lastActiveDate === today) {
    return streakData;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  let newStreak = 1;
  if (streakData.lastActiveDate === yesterdayStr) {
    newStreak = streakData.currentStreak + 1;
  }

  const updated = await prisma.streakData.update({
    where: { userId },
    data: {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, streakData.longestStreak),
      lastActiveDate: today,
    },
  });

  return updated;
}

export async function getStreakData(userId: string) {
  const data = await prisma.streakData.findUnique({ where: { userId } });
  if (!data) {
    return prisma.streakData.create({
      data: { userId },
    });
  }

  const today = getToday();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  if (data.lastActiveDate !== today && data.lastActiveDate !== yesterdayStr && data.currentStreak > 0) {
    return prisma.streakData.update({
      where: { userId },
      data: { currentStreak: 0 },
    });
  }

  return data;
}
