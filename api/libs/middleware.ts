
import { NextFunction, Request, Response } from 'express';
import { ValidationError } from 'runtypes';
import { Runtype } from 'runtypes/lib/runtype';

export const validate = (schema: Runtype) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        req.body = schema.check(req.body);
        next();
        return true;
    } catch (error) {
        if (error instanceof ValidationError) {
            const fields = Object.keys(error.details as Object);
            return res.status(400).json({
                success: false,
                fields
            });
        }
        throw error;
    }
}; 