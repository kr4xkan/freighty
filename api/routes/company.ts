import { Router } from "express";
import db from "../db";

const router = Router();

router.get("/", async (_req, res) => {
    const company = await db.company.findUnique({
        where: {
            id: 1
        },
        include: {
            fleet: {
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
            },
            users: {
                orderBy: {
                    id: "asc"
                }
            },
            trips: {
                include: {
                    manager: true,
                    path: true,
                    truck: true
                },
                orderBy: {
                    id: "asc"
                }
            },
            forumPosts: {
                include: {
                    author: true,
                    comments: true
                },
                orderBy: {
                    id: "desc"
                }
            }
        }
    });
    res.json({ company });
});

export default router;