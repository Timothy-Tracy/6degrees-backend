import passport from "passport";
import { Strategy } from "passport-local";
import AuthService from "../AuthService";
import applogger from "../../../../lib/logger/applogger";
const logger = applogger.child({'module': 'AuthStrategy'})
import { models } from "../../../db/neo4j/models/models";




passport.serializeUser((user: any, done) => {
    const log = logger.child({'function': 'serializeUser'})
    log.trace('')

    try {
    let log = logger.child({ module: "AuthStrategy", function: "serializeUser" });
    log.trace("serializeUser");
    console.log("serializeUser", user);
    done(null, user.uuid);
    } catch (error) { 
        done(error, null);
    }
});

passport.deserializeUser((uuid : string, done) => {
    const log = logger.child({'function': 'deserializeUser'})
    log.trace('')
       
        let user = models.USER.findOne({where:{uuid: uuid}}).then((user)=>{
            if (!user) {
                throw new Error("User not found");
           }
           return done(null, user);
        }).catch((error) =>{
            console.log("Error deserializing user", error);
            return done(error, null);
        })

        
         
         
    
   }
);



export default passport.use(new Strategy( {"usernameField": "email"}, async (email, password, done) => {
 
        let log = logger.child({ module: "AuthStrategy" });
        log.trace("LocalStrategy");

        let user = models.USER.findOne({where:{email: email}}).then((user)=>{
            if (!user) {
                throw new Error("User not found");
           }

        //    let passwordMatch = await AuthService.comparePassword(password, user.password);
        //    if (!passwordMatch) {
        //        console.log("Invalid password");
        //        throw new Error("Invalid password");
        //    }
           return done(null, user);
        }).catch((error) =>{
            console.log("Error deserializing user", error);
            return done(error);
        })

}));








