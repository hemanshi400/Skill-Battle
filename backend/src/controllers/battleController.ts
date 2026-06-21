import { Request, Response } from 'express';
import { prisma } from '../db';

export const getBattles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;

    const query: any = {};
    if (status) {
      query.status = status as string;
    }

    const battles = await prisma.battle.findMany({
      where: query,
      orderBy: { startTime: 'desc' },
      include: {
        _count: {
          select: { registrations: true, submissions: true }
        }
      }
    });

    res.json(battles);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getBattleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const battle = await prisma.battle.findUnique({
      where: { id: id as string },
      include: {
        registrations: {
          include: {
            user: {
              select: { id: true, username: true, fullName: true, avatarUrl: true }
            }
          }
        },
        submissions: {
          include: {
            user: {
              select: { id: true, username: true, fullName: true, avatarUrl: true, xp: true }
            },
            _count: {
              select: { votes: true }
            }
          }
        }
      }
    });

    if (!battle) {
      res.status(404).json({ error: 'Battle not found' });
      return;
    }

    res.json(battle);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getActiveBattle = async (req: Request, res: Response): Promise<void> => {
  try {
    const activeBattle = await prisma.battle.findFirst({
      where: { status: 'active' },
      include: {
        registrations: {
          include: {
            user: {
              select: { id: true, username: true, fullName: true, avatarUrl: true }
            }
          }
        },
        submissions: {
          include: {
            user: {
              select: { id: true, username: true, fullName: true, avatarUrl: true }
            }
          }
        }
      }
    });

    res.json(activeBattle || null);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const registerForBattle = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { battleId } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: Missing User ID' });
      return;
    }

    if (!battleId) {
      res.status(400).json({ error: 'Battle ID is required' });
      return;
    }

    const battle = await prisma.battle.findUnique({ where: { id: battleId } });
    if (!battle) {
      res.status(404).json({ error: 'Battle not found' });
      return;
    }

    if (battle.status !== 'upcoming' && battle.status !== 'preparation') {
      res.status(400).json({ error: 'Registration is only open for upcoming or preparation challenges' });
      return;
    }

    // Check if already registered
    const existingReg = await prisma.registration.findUnique({
      where: {
        userId_battleId: { userId, battleId }
      }
    });

    if (existingReg) {
      res.status(400).json({ error: 'Already registered for this battle' });
      return;
    }

    const reg = await prisma.registration.create({
      data: {
        userId,
        battleId
      }
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId,
        type: 'register',
        content: `Registered for weekend battle: "${battle.title}"`
      }
    });

    res.status(201).json(reg);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
