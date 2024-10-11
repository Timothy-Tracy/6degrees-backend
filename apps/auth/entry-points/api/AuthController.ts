import './../../domain/strategies/AuthStrategy';
import './../../domain/strategies/GoogleStrategy';
import { Express, Request, Response } from 'express';
import passport from 'passport';
import { Router } from 'express';

import AuthService from '../../domain/AuthService';
import { catchAsync } from '../../../../lib/error/customErrors';
import redisService from '../../../db/redis/RedisService';
import applogger from '../../../../lib/logger/applogger';
export const router = Router();
export const apiRoot = '/api/v2/auth'
import dotenv from 'dotenv';
dotenv.config();



router.get('/google', 
    (req,res,next)=>{
        req.session.returnTo= {returnTo: req.query.returnTo||undefined};
        if(req.isAuthenticated()){
            res.redirect(req.session.returnTo.returnTo || process.env.FRONTEND_URL)
        }
        next()
    }, 
    passport.authenticate("google", { scope: ["profile", "email"]})
);

router.get('/google/callback', 
    passport.authenticate("google"), 
    (req: Request, res: Response) => {
        res.redirect(req.authInfo.returnTo.returnTo || process.env.FRONTEND_URL);
    }
);


router.post('/passport', passport.authenticate("local"), (req: Request, res: Response) => {
    res.status(200).json({ token: req.user });
}
);

router.post('/login', 
   
    catchAsync(AuthService.login), 
    (req: any, res: any) => {
    res.status(200).json({ token: res.locals.auth });
}
);

// router.post('/register', 
   
//     catchAsync(AuthService.register), 
//     (req: any, res: any) => {
//         res.status(200).json(res.locals);
// }
// );


router.get('/status', (req: any, res: any) => {
    console.log(req.session);
    console.log(req.user)
    req.isAuthenticated() ? res.status(200).json({ message: "Authenticated",data:{status:true} }) : res.status(401).json({ message: "Not Authenticated",data:{status:false} });
}
);


router.get('/logout', (req: any, res: any) => {
    req.logout((err:any) => {
        if (err) res.status(500).json({ message: "Logout failed" });
        
    }
    );
    res.status(200).clearCookie('session_id').send();

});


router.get('/hello', (req: any, res: any) => {
    if (req.session?.viewCount == undefined) {
        req.session.viewCount = 0;
    }
    else {
        req.session.viewCount++;
    }
    res.send(`Hello! You have visited this page ${req.session.viewCount} times`);
}
);

router.get('/profile', (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
        res.json({ user: req.user });
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
});
router.get('/debug-session/', async (req, res) => {
    const x = await redisService.store.client.get(`sess:${req.sessionID.user}`);
    console.log(x )
    res.json({
        test: x,
      sessionID: req.sessionID,
      sessionData: req.session
    });
  });

export default {router, apiRoot}