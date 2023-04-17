import { Request, Response, Router } from "express";
import db from "../db";
import { Number, Record, Static, String } from "runtypes";
import { validate } from "../libs/middleware";
import { Post, User } from "@prisma/client";

const router = Router();

router.get("/", async (_req, res) => {
    const posts = await db.post.findMany({
        include: {
            author: true,
            comments: true
        },
        orderBy: {
            id: "desc"
        }
    });
    res.json({ posts });
});

router.get("/:id", async (req, res) => {
    const post = await db.post.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
            author: true,
            comments: {
                include: {
                    author: true,
                }
            }
        }
    });
    res.json({ post });
});

const AddPostReq = Record({
    title: String.withConstraint(s => s.length > 1),
    content: String.withConstraint(s => s.length > 1),
    authorId: Number,
});
type AddPostReq = Static<typeof AddPostReq>;

router.post("/", validate(AddPostReq), async (req: Request<any, any, AddPostReq>, res: Response) => {
    let author: User;

    const search = await db.user.findUnique({ where: { id: req.body.authorId }});
    if (!search) {
        return res.status(400).json({
            success: false,
            fields: ["authorId"]
        });
    }
    author = search;

    const post = await db.post.create({
        data: {
            ...req.body,
            authorId: author.id,
            companyId: 1
        },
        include: {
            comments: true,
            author: true
        }
    });
    
    res.json({ success: true, post });
});

const AddCommentReq = Record({
    content: String.withConstraint(s => s.length > 1),
    authorId: Number,
});
type AddCommentReq = Static<typeof AddCommentReq>;

router.post("/:id/reply", validate(AddCommentReq), async (req: Request<any, any, AddCommentReq>, res) => {
    let author: User;
    let post: Post;

    const search = await db.user.findUnique({ where: { id: req.body.authorId }});
    if (!search) {
        return res.status(400).json({
            success: false,
            fields: ["authorId"]
        });
    }
    author = search;

    const searchPost = await db.post.findUnique({ where: { id: parseInt(req.params.id) }});
    if (!searchPost) {
        return res.status(400).json({
            success: false,
            fields: ["postId"]
        });
    }
    post = searchPost;

    const comment = await db.comment.create({
        data: {
            ...req.body,
            authorId: author.id,
            postId: post.id
        },
    });

    res.json({ success: true, id: comment.id });
});

router.delete("/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const search = await db.post.findUnique({ where: { id } });
    if (search) {
        await db.post.delete({ where: { id }});
    }
    res.json({ success: true });
});

router.delete("/comment/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const search = await db.comment.findUnique({ where: { id } });
    if (search) {
        await db.comment.delete({ where: { id }});
    }
    res.json({ success: true });
});

export default router;