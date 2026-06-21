import { Request, Response } from 'express';
import { prisma } from '../db';

export const submitProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { battleId, githubUrl, liveUrl, description } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: Missing User ID' });
      return;
    }

    if (!battleId || !githubUrl || !description) {
      res.status(400).json({ error: 'Missing required fields: battleId, githubUrl, description' });
      return;
    }

    // Check if battle is active
    const battle = await prisma.battle.findUnique({ where: { id: battleId } });
    if (!battle) {
      res.status(404).json({ error: 'Battle not found' });
      return;
    }

    if (battle.status !== 'active') {
      res.status(400).json({ error: 'Submissions are only open during active live battles' });
      return;
    }

    // Check if user is registered
    const registration = await prisma.registration.findUnique({
      where: {
        userId_battleId: { userId, battleId }
      }
    });

    if (!registration) {
      res.status(403).json({ error: 'You must be registered for the battle to submit' });
      return;
    }

    // Check if already submitted
    const existingSubmission = await prisma.submission.findUnique({
      where: {
        userId_battleId: { userId, battleId }
      }
    });

    if (existingSubmission) {
      res.status(400).json({ error: 'You have already submitted a project for this battle' });
      return;
    }

    // Create submission
    const submission = await prisma.submission.create({
      data: {
        userId,
        battleId,
        githubUrl,
        liveUrl,
        description
      }
    });

    // Logging activity
    await prisma.activityLog.create({
      data: {
        userId,
        type: 'submit',
        content: `Submitted project for battle: "${battle.title}"`
      }
    });

    // Check for badges
    // 1. "First Submission"
    const totalSubmissions = await prisma.submission.count({ where: { userId } });
    if (totalSubmissions === 1) {
      const firstSubBadge = await prisma.badge.findUnique({ where: { name: 'First Submission' } });
      if (firstSubBadge) {
        // Award badge
        const badgeEarned = await prisma.userBadge.findUnique({
          where: {
            userId_badgeId: { userId, badgeId: firstSubBadge.id }
          }
        });
        if (!badgeEarned) {
          await prisma.userBadge.create({
            data: { userId, badgeId: firstSubBadge.id }
          });
          // Update User XP
          await prisma.user.update({
            where: { id: userId },
            data: { xp: { increment: firstSubBadge.xpReward + 100 } } // 100 for submission, badge reward too
          });
          await prisma.activityLog.create({
            data: {
              userId,
              type: 'badge_earned',
              content: `Earned the "${firstSubBadge.name}" badge!`
            }
          });
        }
      }
    } else {
      // Award 100 XP for standard submission
      await prisma.user.update({
        where: { id: userId },
        data: { xp: { increment: 100 } }
      });
    }

    res.status(201).json(submission);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSubmissionsForBattle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { battleId } = req.params;
    const userId = req.headers['x-user-id'] as string;

    const battle = await prisma.battle.findUnique({ where: { id: battleId as string } });
    if (!battle) {
      res.status(404).json({ error: 'Battle not found' });
      return;
    }

    const rawSubmissions: any[] = await prisma.submission.findMany({
      where: { battleId: battleId as string },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, avatarUrl: true, xp: true }
        },
        votes: true
      }
    });

    // Check if the current user has voted on each submission
    const submissions = rawSubmissions.map((sub: any) => {
      const voteCount = sub.votes.length;
      const hasVoted = userId ? sub.votes.some((v: any) => v.voterId === userId) : false;
      
      // If battle is in 'voting' state, sanitize/anonymize creator information
      // unless the user is looking at their own submission
      const isCreator = userId && sub.userId === userId;
      const isVotingState = battle.status === 'voting';

      return {
        id: sub.id,
        battleId: sub.battleId,
        githubUrl: isVotingState && !isCreator ? '#' : sub.githubUrl, // mask code link during voting if not creator to avoid name bias
        liveUrl: sub.liveUrl,
        description: sub.description,
        submittedAt: sub.submittedAt,
        voteCount,
        hasVoted,
        // Anonymous masking
        user: isVotingState && !isCreator ? {
          id: 'anonymous',
          username: 'Anonymous Builder',
          fullName: 'Anonymous Builder',
          avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${sub.id}`,
          xp: 0
        } : sub.user
      };
    });

    res.json(submissions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const voteForSubmission = async (req: Request, res: Response): Promise<void> => {
  try {
    const voterId = req.headers['x-user-id'] as string;
    const { submissionId } = req.body;

    if (!voterId) {
      res.status(401).json({ error: 'Unauthorized: Missing User ID' });
      return;
    }

    if (!submissionId) {
      res.status(400).json({ error: 'Submission ID is required' });
      return;
    }

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { battle: true }
    });

    if (!submission) {
      res.status(404).json({ error: 'Submission not found' });
      return;
    }

    // 1. Voting is only open during voting status
    if (submission.battle.status !== 'voting') {
      res.status(400).json({ error: 'Voting is only allowed when battle status is "voting"' });
      return;
    }

    // 2. Prevent self-voting
    if (submission.userId === voterId) {
      res.status(400).json({ error: 'You cannot vote for your own submission' });
      return;
    }

    // 3. One vote per submission per user (Toggle-able: if already voted, remove vote; otherwise add)
    const existingVote = await prisma.vote.findUnique({
      where: {
        voterId_submissionId: {
          voterId,
          submissionId
        }
      }
    });

    if (existingVote) {
      // Remove vote
      await prisma.vote.delete({
        where: { id: existingVote.id }
      });
      res.json({ voted: false, message: 'Vote removed successfully' });
    } else {
      // Add vote
      await prisma.vote.create({
        data: {
          voterId,
          submissionId,
          battleId: submission.battleId
        }
      });

      // Create activity log
      await prisma.activityLog.create({
        data: {
          userId: voterId,
          type: 'vote',
          content: `Casted a vote for a project in battle: "${submission.battle.title}"`
        }
      });

      res.status(201).json({ voted: true, message: 'Vote registered successfully' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
