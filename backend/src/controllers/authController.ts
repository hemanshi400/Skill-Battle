import { Request, Response } from 'express';
import { prisma } from '../db';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, username, fullName, avatarUrl } = req.body;

    if (!email || !username || !fullName) {
      res.status(400).json({ error: 'Missing required fields: email, username, fullName' });
      return;
    }

    // Check if email or username already exists
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) {
      res.status(400).json({ error: 'Username already taken' });
      return;
    }

    const user = await prisma.user.create({
      data: {
        email,
        username,
        fullName,
        avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
        skills: JSON.stringify([]),
      },
    });

    res.status(201).json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        badges: {
          include: {
            badge: true
          }
        }
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found. Please register.' });
      return;
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const onboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { username, bio, skills, githubUrl, linkedinUrl, portfolioUrl } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: Missing User ID header' });
      return;
    }

    const existingUsername = await prisma.user.findFirst({
      where: {
        username,
        NOT: { id: userId }
      }
    });

    if (existingUsername) {
      res.status(400).json({ error: 'Username already taken' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username,
        bio,
        skills: JSON.stringify(skills || []),
        githubUrl,
        linkedinUrl,
        portfolioUrl,
      },
    });

    res.json(updatedUser);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        badges: {
          include: {
            badge: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
