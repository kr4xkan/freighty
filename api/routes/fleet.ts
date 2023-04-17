import { Request, Router } from "express";
import db from "../db";
import { Number, Record, Static, String } from "runtypes";
import { validate } from "../libs/middleware";
import { User } from "@prisma/client";

const router = Router();

router.get("/", async (_req, res) => {
    const fleet = await db.truck.findMany({
        include: {
            currentDriver: true,
            trips: {
                include: {
                    manager: true,
                    path: true,
                    truck: true
                }
            }
        },
        orderBy: {
            id: "asc"
        }
    });
    res.json({ fleet });
});

const AddUpdateReq = Record({
    licensePlate: String.withConstraint(s => s.length > 1),
    model: String.withConstraint(s => s.length > 1),
    currentDriverId: Number,
});
type AddUpdateReq = Static<typeof AddUpdateReq>;

router.post("/", validate(AddUpdateReq), async (req: Request<any, any, AddUpdateReq>, res) => {
    let currentDriver: User | undefined;

    if (req.body.currentDriverId !== -1) {
        const search = await db.user.findUnique({ where: { id: req.body.currentDriverId }});
        if (!search) {
            return res.status(400).json({
                success: false,
                fields: ["currentDriverId"]
            });
        }
        currentDriver = search;
    }

    await db.truck.create({
        data: {
            ...req.body,
            currentDriverId: currentDriver?.id ?? null,
            companyId: 1
        }
    });
    
    res.json({ success: true });
});

router.put("/:id", validate(AddUpdateReq), async (req: Request<any, any, AddUpdateReq>, res) => {
    const id = parseInt(req.params.id);
    const search = await db.truck.findUnique({ where: { id } });
    if (search) {
        let currentDriver: User | undefined;

        if (req.body.currentDriverId !== -1) {
            const searchUser = await db.user.findUnique({ where: { id: req.body.currentDriverId }});
            if (!searchUser) {
                return res.status(400).json({
                    success: false,
                    fields: ["currentDriverId"]
                });
            }
            currentDriver = searchUser;
        }

        await db.truck.update({
            where: { id },
            data: {
                ...req.body,
                currentDriverId: currentDriver?.id ?? null
            }
        });
    }
    res.json({ success: true });
});

router.delete("/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const search = await db.truck.findUnique({ where: { id } });
    if (search) {
        await db.truck.delete({ where: { id }});
    }
    res.json({ success: true });
});

export default router;