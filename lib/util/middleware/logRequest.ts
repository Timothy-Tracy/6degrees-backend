import { NextFunction } from "express";
import applogger from "../../logger/applogger";

export const logRequest = (logger: any = applogger) => (req: any, res: any, next:NextFunction)=>{
    const str = `${req.method}: ${logger}`
    logger.info(req, `INCOMING ${req.method}`), next()

}

export default logRequest
