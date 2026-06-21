import { Request, Response } from 'express';
import { prisma } from '../db';

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;

    const user: any = await prisma.user.findUnique({
      where: { username: username as string },
      include: {
        badges: {
          include: {
            badge: true
          }
        },
        registrations: {
          include: {
            battle: true
          }
        },
        submissions: {
          include: {
            battle: true,
            _count: {
              select: { votes: true }
            }
          }
        },
        activityLogs: {
          orderBy: { createdAt: 'desc' },
          take: 15
        }
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Process skills JSON
    let skillsList: string[] = [];
    try {
      skillsList = JSON.parse(user.skills);
    } catch {
      skillsList = [];
    }

    const response = {
      ...user,
      skills: skillsList,
      submissions: user.submissions.map((sub: any) => ({
        id: sub.id,
        githubUrl: sub.githubUrl,
        liveUrl: sub.liveUrl,
        description: sub.description,
        submittedAt: sub.submittedAt,
        battleTitle: sub.battle.title,
        battleId: sub.battleId,
        voteCount: sub._count.votes
      }))
    };

    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { timeframe } = req.query; // 'weekly' | 'monthly' | 'global'

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        xp: true,
        currentStreak: true,
        maxStreak: true,
        skills: true,
        _count: {
          select: { submissions: true }
        }
      },
      orderBy: { xp: 'desc' }
    });

    // Format skills JSON and add some mocked timeframe multipliers for authentic UI testing
    const formattedUsers = users.map((user, idx) => {
      let parsedSkills: string[] = [];
      try {
        parsedSkills = JSON.parse(user.skills);
      } catch {
        parsedSkills = [];
      }

      // For Weekly/Monthly leaderboards, we mock XP changes slightly to show dynamic changes
      let score = user.xp;
      if (timeframe === 'weekly') {
        // Scramble ranking scores a bit based on user id hashes
        score = Math.floor(user.xp * 0.15) + (idx % 3 === 0 ? 300 : idx % 2 === 0 ? 150 : 50);
      } else if (timeframe === 'monthly') {
        score = Math.floor(user.xp * 0.6) + (idx % 4 === 0 ? 600 : idx % 3 === 0 ? 400 : 100);
      }

      return {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        xp: timeframe === 'global' ? user.xp : score,
        streak: user.currentStreak,
        submissionsCount: user._count.submissions,
        skills: parsedSkills
      };
    });

    // Resort if we modified the score for weekly/monthly
    if (timeframe === 'weekly' || timeframe === 'monthly') {
      formattedUsers.sort((a, b) => b.xp - a.xp);
    }

    // Add visual rankings
    const rankedUsers = formattedUsers.map((u, i) => ({
      ...u,
      rank: i + 1
    }));

    res.json(rankedUsers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
