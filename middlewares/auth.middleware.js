import jwt from "jsonwebtoken"
const { verify } = jwt;

export default function (req, res, next){
    const token = req.header('Authorization').trim()
    if(!token) return res.status(401).send("Access Denied! You need to login first")
    try{
        const TokenArray = token.split(" ");
        let user = verify(TokenArray[1],(process.env.JWT).trim())
        req.user = user
        next()
    }
    catch(ex){  
        res.status(400).send("Invalid Token")
    }
}