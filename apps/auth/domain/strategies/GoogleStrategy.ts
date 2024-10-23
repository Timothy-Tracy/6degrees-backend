import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';
import { AppError } from '../../../../lib/error/customErrors';
import { models } from '../../../db/neo4j/models/models';
import applogger from '../../../../lib/logger/applogger'
import { generateDateTime } from '../../../../lib/util/generateDateTime';
const logger = applogger.child({'module': 'GoogleStrategy'})
const { v7: uuidv7 } = require('uuid');
// Define the return URL structure
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

interface GoogleClientProps{
    clientID: string,
    clientSecret: string,
    callbackURL: string
}
let googledata: GoogleClientProps = {
    clientID: '',
    clientSecret: '',
    callbackURL: ''
};
if(process.env.NODE_ENV == 'production'){
    if(process.env.PROD_GOOGLE_CLIENT_ID && process.env.PROD_GOOGLE_CLIENT_SECRET && process.env.PROD_GOOGLE_CALLBACK_URL){
        googledata = {
            clientID:process.env.PROD_GOOGLE_CLIENT_ID,
            clientSecret: process.env.PROD_GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.PROD_GOOGLE_CALLBACK_URL,
        }
    } else {
        throw new AppError('google env var error', 500)
    }
    
    

} else if(process.env.NODE_ENV == 'development'){
    if(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CALLBACK_URL){
        googledata = {
            clientID:process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        }
    } else {
        throw new AppError('google env var error', 500)
    }
}
export default passport.use(new GoogleStrategy({
    clientID: googledata.clientID || "",
    clientSecret: googledata.clientSecret || "",
    callbackURL: googledata.callbackURL || "",
    passReqToCallback:true   
    }, 
    async (request:any, accessToken:any, refreshToken:any, profile:any, done:any) => {
        //console.log(request)
        const log = logger.child({'function': 'passport.useGoogleStrategy'})
        log.trace('passport.useGoogleStrategy')
        try {
            if (!profile.emails) {throw new Error("No email found");}
            logger.debug('finding user')
            let user = await models.USER.findOne({where:{email: profile.emails[0]?.value}})
            if (!user) {
                logger.info('creating user')
                user = await models.USER.createOne({
                    uuid: uuidv7(),
                    email: profile.emails[0].value,
                    username: profile.displayName.toLowerCase().replace(' ', '').concat(`${parseInt(((Math.random()*10)+1).toString())}${parseInt(((Math.random()*10)+1).toString())}${parseInt(((Math.random()*10)+1).toString())}${parseInt(((Math.random()*10)+1).toString())}`),
                    createdAt: generateDateTime(),
                    updatedAt: generateDateTime(),
                    role:'USER'
                })
                await user.createSharenode()
            } else {
                logger.debug(`user username=${user.username} found`)
            }
            return done(null, {uuid:user.uuid}, {returnTo: request.session.returnTo||process.env.FRONTEND_URL || ''});
        } catch (error) {
            return done(error);
        }
    }
));
