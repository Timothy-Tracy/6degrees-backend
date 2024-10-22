import './../../domain/strategies/AuthStrategy';
import './../../domain/strategies/GoogleStrategy';
import { Request, Response } from 'express';
import passport from 'passport';
import { Router } from 'express';
import applogger from '../../../../lib/logger/applogger';
export const router = Router();
export const apiRoot = '/api/v2/auth'
import { ParsedQs } from 'qs';
import dotenv from 'dotenv';
dotenv.config();
// Define the return URL structure
interface ReturnToData {
    returnTo: string | undefined;
}

declare module 'express-session' {
    interface Session {
        returnTo?: ReturnToData;
    }
}

declare module 'passport' {
    interface AuthInfo {
        returnTo?: ReturnToData;
    }
}
interface ExtendedAuthInfo extends passport.AuthInfo {
    returnTo?: ReturnToData;
}
// Updated helper function with proper type handling
function getReturnToString(value: string | string[] | ParsedQs | ParsedQs[] | undefined): string | undefined {
    if (!value) return undefined;
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) {
        const firstValue = value[0];
        return typeof firstValue === 'string' ? firstValue : undefined;
    }
    return undefined;
}


router.get('/google', 
    (req, res, next) => {
        req.session.returnTo = {
            returnTo: getReturnToString(req.query.returnTo)
        };
        
        if(req.isAuthenticated()) {
            const redirectUrl = req.session.returnTo?.returnTo || process.env.FRONTEND_URL || '';
            res.redirect(redirectUrl);
        }
        next();
    }, 
    passport.authenticate("google", { scope: ["profile", "email"]})
);

router.get('/google/callback', 
    passport.authenticate("google"), 
    (req: Request & { authInfo: ExtendedAuthInfo }, res: Response) => {
        const redirectUrl = req.authInfo?.returnTo?.returnTo || process.env.FRONTEND_URL || '';
        res.redirect(redirectUrl);
    }
);

router.post('/passport', passport.authenticate("local"), (req: Request, res: Response) => {
    res.status(200).json({ token: req.user });
}
);


// router.post('/register', 
   
//     catchAsync(AuthService.register), 
//     (req: any, res: any) => {
//         res.status(200).json(res.locals);
// }
// );


router.get('/status', (req, res) => {

    const logger = applogger.child({'endpoint':'auth/status'})
    logger.debug(req)
    logger.debug({
        session: req.session,
        sessionId: req.session.id,
        isAuthenticated: req.isAuthenticated()
    
    });
       
    
    res.status(req.isAuthenticated() ? 200 : 401).json({
      message: req.isAuthenticated() ? "Authenticated" : "Not Authenticated",
      data: {
        status: req.isAuthenticated(),
        sessionExists: !!req.session,
        userExists: !!req.user
      }
    });
  });


router.get('/logout', (req: any, res: any) => {
    req.logout((err:any) => {
        if (err) res.status(500).json({ message: "Logout failed" });
        
    }
    );
    res.status(200).clearCookie('session_id').send();

});


// router.get('/hello', (req: any, res: any) => {
//     if (req.session?.viewCount == undefined) {
//         req.session.viewCount = 0;
//     }
//     else {
//         req.session.viewCount++;
//     }
//     res.send(`Hello! You have visited this page ${req.session.viewCount} times`);
// }
// );

// router.get('/profile', (req: Request, res: Response) => {
//     if (req.isAuthenticated()) {
//         res.json({ user: req.user });
//     } else {
//         res.status(401).json({ message: 'Not authenticated' });
//     }
// });
// router.get('/debug-session/', async (req, res) => {
//     const x = await redisService.store.client.get(`sess:${req.sessionID.user}`);
//     console.log(x )
//     res.json({
//         test: x,
//       sessionID: req.sessionID,
//       sessionData: req.session
//     });
//   });

export default {router, apiRoot}