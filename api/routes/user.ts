import { Request, Response, Router } from "express";
import { Number, Record, Static, String } from "runtypes";
import { validate } from "../libs/middleware";
import db from "../db";

const router = Router();

const RegisterReq = Record({
    login: String.withConstraint(s => s.length > 1),
    password: String.withConstraint(s => s.length > 1),
    name: String.withConstraint(s => s.length > 1),
    surname: String.withConstraint(s => s.length > 1),
    contact: String.withConstraint(s => s.length > 1),
    dateOfBirth: Number
});
type RegisterReq = Static<typeof RegisterReq>;

router.post("/register", validate(RegisterReq), async (req: Request<any, any, RegisterReq>, res) => {
    const search = await db.user.findFirst({ where: { login: req.body.login }});
    if (search) {
        return res.status(400).json({
            success: false,
            fields: ["login"]
        });
    }

    const user = await db.user.create({
        data: {
            ...req.body,
            role: "manager",
            companyId: 1,
            dateOfBirth: new Date(req.body.dateOfBirth)
        }
    });
    res.json({ success: true, user });
});

router.put("/update/:id", validate(RegisterReq), async (req: Request<any, any, RegisterReq>, res) => {
    const id = parseInt(req.params.id);
    const search = await db.user.findUnique({ where: { id } });
    if (search) {
        await db.user.update({
            where: { id },
            data: {
                ...req.body,
                dateOfBirth: new Date(req.body.dateOfBirth)
            }
        });
    }
    res.json({ success: true });
});

const LoginReq = Record({
    login: String.withConstraint(s => s.length > 1),
    password: String.withConstraint(s => s.length > 1)
});
type LoginReq = Static<typeof LoginReq>;

router.post("/login", validate(LoginReq), async (req: Request<any, any, LoginReq>, res: Response) => {
    const search = await db.user.findFirst({ where: { login: req.body.login }});
    if (!search) {
        return res.status(400).json({
            success: false,
            fields: ["login"]
        });
    }

    if (search.password !== req.body.password) {
        return res.status(400).json({
            success: false,
            fields: ["password"]
        });
    }
    
    res.json({ success: true, user: search });
});

router.get("/", async (_req, res) => {
    const users = await db.user.findMany({ orderBy: { id: "asc" }});
    res.json({ users });
});

export default router;