import { Router } from 'express';
import * as authController from '../controllers/authController';
import * as battleController from '../controllers/battleController';
import * as submissionController from '../controllers/submissionController';
import * as userController from '../controllers/userController';
import * as adminController from '../controllers/adminController';

const router = Router();

// --- Auth Routes ---
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/onboard', authController.onboard);
router.get('/auth/me', authController.getMe);

// --- Battle Routes ---
router.get('/battles', battleController.getBattles);
router.get('/battles/active', battleController.getActiveBattle); // Must be before /battles/:id
router.post('/battles/register', battleController.registerForBattle);
router.get('/battles/:id', battleController.getBattleById);

// --- Submissions & Voting Routes ---
router.post('/submissions', submissionController.submitProject);
router.get('/submissions/battle/:battleId', submissionController.getSubmissionsForBattle);
router.post('/votes', submissionController.voteForSubmission);

// --- User & Leaderboard Routes ---
router.get('/users/leaderboard', userController.getLeaderboard);
router.get('/users/profile/:username', userController.getUserProfile);

// --- Admin Simulation Routes ---
router.post('/admin/create-battle', adminController.createBattle);
router.post('/admin/update-status', adminController.updateBattleStatus);

export default router;
