import { Request, Response } from 'express';
import { prisma } from '../db';

export const createBattle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, tagline, description, rules, requirements, guidelines, startTime, endTime } = req.body;

    if (!title || !tagline || !description || !rules || !requirements || !guidelines || !startTime || !endTime) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    // Determine default status based on times
    let status = 'upcoming';
    if (now >= start && now <= end) {
      status = 'active';
    } else if (now > end) {
      status = 'voting'; // goes to voting by default if past end time
    }

    const battle = await prisma.battle.create({
      data: {
        title,
        tagline,
        description,
        rules,
        requirements,
        guidelines,
        registrationStart: new Date(start.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days before
        registrationEnd: new Date(start.getTime() - 10 * 60 * 1000), // 10 mins before
        startTime: start,
        endTime: end,
        status
      }
    });

    res.status(201).json(battle);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateBattleStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { battleId, status } = req.body; // 'upcoming' | 'preparation' | 'active' | 'voting' | 'completed'

    if (!battleId || !status) {
      res.status(400).json({ error: 'Battle ID and status are required' });
      return;
    }

    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
      include: {
        submissions: {
          include: {
            votes: true,
            user: true
          }
        }
      }
    });

    if (!battle) {
      res.status(404).json({ error: 'Battle not found' });
      return;
    }

    // Handle transition actions
    if (status === 'completed' && battle.status !== 'completed') {
      // 1. Tally votes and determine standings
      const sortedSubmissions = [...battle.submissions].sort((a, b) => b.votes.length - a.votes.length);

      if (sortedSubmissions.length > 0) {
        // Winner gets 1st place
        const winnerSub = sortedSubmissions[0];
        const winner = winnerSub.user;

        // Reward Winner: 500 XP
        await prisma.user.update({
          where: { id: winner.id },
          data: { xp: { increment: 500 } }
        });

        // Award Champion badge
        const championBadge = await prisma.badge.findUnique({ where: { name: 'Champion' } });
        if (championBadge) {
          const badgeEarned = await prisma.userBadge.findUnique({
            where: { userId_badgeId: { userId: winner.id, badgeId: championBadge.id } }
          });
          if (!badgeEarned) {
            await prisma.userBadge.create({ data: { userId: winner.id, badgeId: championBadge.id } });
            await prisma.activityLog.create({
              data: {
                userId: winner.id,
                type: 'badge_earned',
                content: `Earned the "${championBadge.name}" badge for winning "${battle.title}"!`
              }
            });
          }
        }

        await prisma.activityLog.create({
          data: {
            userId: winner.id,
            type: 'rank_up',
            content: `Won 1st place in "${battle.title}" (+500 XP)!`
          }
        });

        // Top 10 Finishers: 300 XP
        const top10Badge = await prisma.badge.findUnique({ where: { name: 'Top 10 Finisher' } });
        const limit = Math.min(sortedSubmissions.length, 10);
        for (let i = 0; i < limit; i++) {
          const sub = sortedSubmissions[i];
          // Skip winner for champion logs, but award top 10 points
          await prisma.user.update({
            where: { id: sub.userId },
            data: {
              xp: { increment: 300 },
              currentStreak: { increment: 1 } // Increment participant streaks
            }
          });

          // Award Top 10 Finisher Badge
          if (top10Badge) {
            const badgeEarned = await prisma.userBadge.findUnique({
              where: { userId_badgeId: { userId: sub.userId, badgeId: top10Badge.id } }
            });
            if (!badgeEarned) {
              await prisma.userBadge.create({ data: { userId: sub.userId, badgeId: top10Badge.id } });
            }
          }

          if (i > 0) { // i === 0 is the winner
            await prisma.activityLog.create({
              data: {
                userId: sub.userId,
                type: 'rank_up',
                content: `Finished in the Top 10 (#${i + 1}) in "${battle.title}" (+300 XP)!`
              }
            });
          }
        }

        // Everyone else gets standard participation streak boost
        const top10UserIds = sortedSubmissions.slice(0, limit).map(s => s.userId);
        const registeredUsers = await prisma.registration.findMany({ where: { battleId } });
        for (const reg of registeredUsers) {
          if (!top10UserIds.includes(reg.userId)) {
            await prisma.user.update({
              where: { id: reg.userId },
              data: { currentStreak: { increment: 1 } }
            });
          }
        }
      }
    }

    const updatedBattle = await prisma.battle.update({
      where: { id: battleId },
      data: { status }
    });

    res.json({
      message: `Battle status updated successfully to ${status}`,
      battle: updatedBattle
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
