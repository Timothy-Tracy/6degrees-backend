import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';
import { AppError } from '../../../../lib/error/customErrors';
import { models } from '../../../db/neo4j/models/models';
import applogger from '../../../../lib/logger/applogger'
const logger = applogger.child({'module': 'GoogleStrategy'})
const { v7: uuidv7 } = require('uuid');



if(!process.env.GOOGLE_CLIENT_ID){
    throw new AppError('GOOGLE_CLIENT_ID does not exist in environment variables', 500)
}
if(!process.env.GOOGLE_CLIENT_SECRET){
    throw new AppError('GOOGLE_CLIENT_SECRET does not exist in environment variables', 500)
}
if(!process.env.GOOGLE_CALLBACK_URL){
    throw new AppError('GOOGLE_CALLBACK_URL does not exist in environment variables', 500)
}
export default passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "",
    passReqToCallback:true   
    }, 
    async (request, accessToken:any, refreshToken:any, profile:any, done:any) => {
        console.log(request)
        const log = logger.child({'function': 'passport.useGoogleStrategy'})
        log.trace('')
        try {
            if (!profile.emails) {throw new Error("No email found");}
            let user = await models.USER.findOne({where:{email: profile.emails[0]?.value}})
            if (!user) {
                logger.info('creating user')
                user = await models.USER.createOne({
                    uuid: uuidv7(),
                    email: profile.emails[0].value,
                    username: profile.displayName.toLowerCase().replace(' ', '').concat(`${parseInt(((Math.random()*10)+1).toString())}${parseInt(((Math.random()*10)+1).toString())}${parseInt(((Math.random()*10)+1).toString())}${parseInt(((Math.random()*10)+1).toString())}`),
                })
                await user.createSharenode()
            }
            return done(null, user, {returnTo: request.session.returnTo});
        } catch (error) {
            return done(error);
        }
    }
));
