import { Request, Router } from "express";
import db from "../db";
import { Array, Number, Record, Static, String } from "runtypes";
import { validate } from "../libs/middleware";
import { Truck, User } from "@prisma/client";

const router = Router();

const GetReq = Record({
    role: String.withConstraint(s => s.length > 1),
    id: Number
});
type GetReq = Static<typeof GetReq>;
router.get("/", validate(GetReq), async (req: Request<any, any, GetReq>, res) => {
    let trips;
    if (req.body.role === "worker") {
        trips = await db.trip.findMany({
            include: {
                manager: true,
                truck: true,
                path: true
            },
            where: {
                OR: [
                    { truck: null},
                    { truck: { currentDriverId: req.body.id } }
                ]
            },
            orderBy: {
                id: "asc"
            }
        });
    } else {
        trips = await db.trip.findMany({
            include: {
                manager: true,
                truck: true,
                path: true
            },
            orderBy: {
                id: "asc"
            }
        });
    }
    res.json({ trips });
});

const AddUpdateReq = Record({
    cargo: String.withConstraint(s => s.length > 1),
    path: Array(String.withConstraint(s => s.length > 1)).withConstraint((e) => e.length > 1),
    managerId: Number,
    truckId: Number,
});
type AddUpdateReq = Static<typeof AddUpdateReq>;

router.post("/", validate(AddUpdateReq), async (req: Request<any, any, AddUpdateReq>, res) => {
    let manager: User | undefined;
    let truck: Truck | undefined;

    if (req.body.managerId !== -1) {
        const search = await db.user.findUnique({ where: { id: req.body.managerId } });
        if (!search) {
            return res.status(400).json({
                success: false,
                fields: ["managerId"]
            });
        }
        manager = search;
    }
    if (req.body.truckId !== -1) {
        const search = await db.truck.findUnique({ where: { id: req.body.truckId } });
        if (!search) {
            return res.status(400).json({
                success: false,
                fields: ["truckId"]
            });
        }
        truck = search;
    }

    const data = {
        cargo: req.body.cargo,
        managerId: manager?.id ?? null,
        truckId: truck?.id ?? null,
        companyId: 1,
    }

    const newTrip = await db.trip.create({
        data
    });

    await Promise.all(req.body.path.map(async (e, i) => {
        await db.checkpoint.create({
            data: {
                address: e,
                order: i,
                tripId: newTrip.id
            }
        });
    }));

    res.json({ success: true });
});

router.put("/:id", validate(AddUpdateReq), async (req: Request<any, any, AddUpdateReq>, res) => {
    const id = parseInt(req.params.id);
    const searchTrip = await db.trip.findUnique({ where: { id } });
    if (searchTrip) {
        let manager: User | undefined;
        let truck: Truck | undefined;

        if (req.body.managerId !== -1) {
            const search = await db.user.findUnique({ where: { id: req.body.managerId } });
            if (!search) {
                return res.status(400).json({
                    success: false,
                    fields: ["managerId"]
                });
            }
            manager = search;
        }
        if (req.body.truckId !== -1) {
            const search = await db.truck.findUnique({ where: { id: req.body.truckId } });
            if (!search) {
                return res.status(400).json({
                    success: false,
                    fields: ["truckId"]
                });
            }
            truck = search;
        }

        const data = {
            cargo: req.body.cargo,
            managerId: manager?.id ?? null,
            truckId: truck?.id ?? null
        }

        await db.trip.update({
            where: { id },
            data
        });
        await db.checkpoint.deleteMany({
            where: { tripId: searchTrip.id }
        });

        await Promise.all(req.body.path.map(async (e, i) => {
            await db.checkpoint.create({
                data: {
                    address: e,
                    order: i,
                    tripId: searchTrip.id
                }
            });
        }));
    }
    res.json({ success: true });
});

router.delete("/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const search = await db.trip.findUnique({ where: { id } });
    if (search) {
        await db.trip.delete({ where: { id } });
    }
    res.json({ success: true });
});

export default router;