import { Request, Response, NextFunction } from "express"
import { AppError } from "../../error/customErrors"

export const requireQueryParameter = (arr: Array<string>) => (req: Request, res: Response, next:NextFunction)=>{
    const message = `Error. This request requires the query parameters ${arr.join(' or ')}`
    let bool = false
    arr.forEach((key)=> {
        if (req.query[key]){
            bool = true
        }
    })
    if(!bool){
        throw new AppError(message, 403)
    }
    next()
}