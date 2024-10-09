import './AuthStrategy';
import './GoogleStrategy';
import { Express, Request, Response } from 'express';
import passport from 'passport';
import { Router } from 'express';
const router = Router();


router.post('/passport', passport.authenticate("local"), (req: Request, res: Response) => {
    res.status(200).json({ token: req.user });
}
);
router.get('/google', passport.authenticate("google", { scope: ["profile", "email"] }));
router.get('/google/callback', passport.authenticate("google"), (req: Request, res: Response) => {
    res.status(200).json({ token: req.user });
}
);

export default router;