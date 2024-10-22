import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';
import { AppError } from '../../../../lib/error/customErrors';
import { models } from '../../../db/neo4j/models/models';
import applogger from '../../../../lib/logger/applogger'
import { generateDateTime } from '../../../../lib/util/generateDateTime';
const logger = applogger.child({'module': 'GoogleStrategy'})
const { v7: uuidv7 } = require('uuid');




export default passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "",
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
                    updatedAt: generateDateTime()
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
