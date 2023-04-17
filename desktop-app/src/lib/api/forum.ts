import { fetch } from "@tauri-apps/api/http";
import type { ForumPost } from "../../types";
import { AppStore } from "../../stores";

type AllPostResponse = {
    posts: ForumPost[];
}

export const loadForum = async (): Promise<void> => {
    const res = await fetch<AllPostResponse>("http://localhost:3000/forum/");

    AppStore.update((v) => {
        v.company.forumPosts = res.data.posts;
        return v;
    });
};
type PostResponse = {
    post: ForumPost;
}

export const loadPost = async (id: number): Promise<ForumPost> => {
    const res = await fetch<PostResponse>("http://localhost:3000/forum/"+id);

    return res.data.post;
};

type AddPostRequest = {
    title: string;
    content: string;
    authorId: number;
}

type AddPostResponse = {
    success: boolean;
    fields?: string[];
    post: ForumPost;
}

export const addPost = async (req: AddPostRequest): Promise<AddPostResponse> => {
    const res = await fetch<AddPostResponse>("http://localhost:3000/forum/", {
        method: "POST",
        body: {
            type: "Json",
            payload: req
        }
    });

    return res.data;
};

type AddCommentRequest = {
    content: string;
    authorId: number;
}

type AddCommentResponse = {
    success: boolean;
    fields?: string[];
    id: number;
}

export const addComment = async (id: number, req: AddCommentRequest): Promise<AddCommentResponse> => {
    const res = await fetch<AddCommentResponse>(`http://localhost:3000/forum/${id}/reply`, {
        method: "POST",
        body: {
            type: "Json",
            payload: req
        }
    });

    return res.data;
};

export const removePost = async (id: number) => {
    await fetch("http://localhost:3000/forum/"+id, {
        method: "DELETE"
    });
}

export const removeComment = async (id: number) => {
    await fetch("http://localhost:3000/forum/comment/"+id, {
        method: "DELETE"
    });
}