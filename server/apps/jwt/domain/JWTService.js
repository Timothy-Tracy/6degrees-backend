const jwt = require("jsonwebtoken");
const {AppError} = require('../../../lib/error/customErrors.js')

const SECRET = process.env.JWT_SECRET_KEY;

function sign(user){
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
            new Error("JWTService: Error! Something went wrong.");
        throw error;
    }
    return token;
}

async function checkForToken(req){
    let token;
    let tokenstatus = false;
    if(req.headers.authorization){
        tokenstatus = true;
    
    token =req.headers.authorization.split(' ')[1];
        //Authorization: 'Bearer TOKEN'
    }
        if (!tokenstatus) {
            throw new AppError('JWT Token Not Provided', 200)
        }
        return token;
}

async function decodeToken(token){
    let decodedToken;
        try{
            decodedToken = jwt.verify(token, SECRET);
        } catch (err){
            throw new AppError('JWT Token Not Verified');
        }
    return decodedToken;
            
       
}


module.exports = {sign, checkForToken, decodeToken}