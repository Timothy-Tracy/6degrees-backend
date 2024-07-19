const jwt = require("jsonwebtoken");
const {AppError, AuthorizationError} = require('../../../lib/error/customErrors.js')
const mylogger = require('../../../lib/logger/logger.js');
const logger = mylogger.child({ 'module': 'JWTService' });
const SECRET = process.env.JWT_SECRET_KEY;

async function sign(user){
    const log = logger.child({'function': 'sign'});
    log.trace('');
    let token;
    try {
        //Creating jwt token
        token = jwt.sign(
            {
                USER_UUID: user.USER_UUID,
                USER_ROLE: user.USER_ROLE
            },
            SECRET,
            { expiresIn: "1h" }
        );
    } catch (err) {
        console.log(err);
        const error =
            new AuthorizationError({'message':"JWTService: Error! Something went wrong.",'statusCode':401, 'error':err});
        throw error;
    }
    return token;
}

async function checkForToken(req){
    const log = logger.child({'function': 'checkForToken'});
    log.trace('Checking for token.');
    let token;
    let tokenstatus = false;
    if(req.headers.authorization){
        tokenstatus = true;
    
    token =req.headers.authorization.split(' ')[1];
        //Authorization: 'Bearer TOKEN'
    } else if (req.cookies.token){
        token = req.cookies.token
    }
        // if (!tokenstatus) {
        //     throw new AppError('JWT Token Not Provided', 200)
        // }
        return token;
}

async function decodeToken(token){
    const log = logger.child({'function': 'decodeToken'});
    log.trace('Decoding token.');
    let decodedToken;
        try{
            decodedToken = jwt.verify(token, SECRET);
        } catch (err){
            throw new AuthorizationError({'message':'JWT Token Not Verified','statusCode':401, 'error':err});
        }
    return decodedToken;
            
       
}


module.exports = {sign, checkForToken, decodeToken}