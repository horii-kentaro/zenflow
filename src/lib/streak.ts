import { prisma } from "@/lib/prisma";
import { getTodayDate, formatDate } from "@/lib/utils";

export async function updateStreak(userId: string) {
  const today = getTodayDate();

  const streakData = await prisma.streakData.upsert({
    where: { userId },
    create: { userId, currentStreak: 1, longestStreak: 1, lastActiveDate: today },
    update: {},
  });

  if (streakData.lastActiveDate && formatDate(streakData.lastActiveDate) === formatDate(today)) {
    return streakData;
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let newStreak = 1;
  if (streakData.lastActiveDate && formatDate(streakData.lastActiveDate) === formatDate(yesterday)) {
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

  const today = getTodayDate();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayStr = formatDate(today);
  const yesterdayStr = formatDate(yesterday);
  const lastActiveStr = data.lastActiveDate ? formatDate(data.lastActiveDate) : null;

  if (lastActiveStr !== todayStr && lastActiveStr !== yesterdayStr && data.currentStreak > 0) {
    return prisma.streakData.update({
      where: { userId },
      data: { currentStreak: 0 },
    });
  }

  return data;
}
