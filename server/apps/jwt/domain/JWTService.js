const jwt = require("jsonwebtoken");

const JWT_SECRET_KEY = "78E630E665D0B27FE133175F0E4EAB9D847999938B959CB0310C0A590120C69C"

function sign(UUUID, email){
    let token;
    try {
        //Creating jwt token
        token = jwt.sign(
            {
                userId: existingUser.id,
                email: existingUser.email
            },
            JWT_SECRET_KEY,
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

function checkForToken(req, res){
    const token =
            req.headers
                .authorization.split(' ')[1];
        //Authorization: 'Bearer TOKEN'
        if (!token) {
            res.status(200)
                .json(
                    {
                        success: false,
                        message: "Error!Token was not provided."
                    }
                );
        }
}

function decodeToken(req,res){
    let decodedToken;
        try{
            decodedToken = jwt.verify(token, JWT_SECRET_KEY);
        } catch (err){
            throw err;
        }
            
        res.status(200).json(
            {
                success: true,
                data: {
                    userId: decodedToken.userId,
                    email: decodedToken.email
                }
            }
        );
        return decodedToken;
}