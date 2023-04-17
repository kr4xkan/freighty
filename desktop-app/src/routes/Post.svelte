<script lang="ts">
    import { addComment, loadPost, removeComment } from "../lib/api/forum";
    import { onMount } from "svelte";
    import Layout from "../lib/Layout.svelte";
    import { AppStore, AuthStore } from "../stores";
    import type { ForumPost } from "../types";
    import Icon from "@iconify/svelte";
    import { dialog } from "@tauri-apps/api";

    export let params: {
        id: number;
    };

    onMount(async () => {
        post = await loadPost(params.id);
    });

    const authData = $AuthStore;

    let post: ForumPost | undefined;
    let replyBind = "";
    $: reply = replyBind.trim();

    async function onPost() {
        if (!post || !authData.user) return;

        const res = await addComment(post.id, {
            content: reply,
            authorId: authData.user?.id ?? -1
        });

        if (!res.success) return;

        post.comments.push({
            id: res.id,
            author: authData.user,
            content: reply
        });
        post = post;
        
        replyBind = "";
    }

    async function onDelete(id: number) {
        if (!post) return;
        const comment = post.comments.find(v => v.id === id);
        if (!comment) return;
        let yes = await dialog.confirm(`Are you sure you want to delete a comment from '${comment.author.login}' ?`);
        if (!yes) return;

        await removeComment(id);

        post.comments = post.comments.filter(v => v.id !== id);
        post = post;
    }
</script>

<Layout>
    {#if !post}
        <p>Loading post...</p>
    {/if}
    {#if post}
        <h1>{post.title}</h1>
        <p class="initialContent">{post.content}</p>
        <p class="author">Author: {post.author.name} {post.author.surname}</p>

        <h3>Comments</h3>
        <form on:submit|preventDefault={onPost}>
            <input
                type="text"
                name="comment"
                placeholder="Reply..."
                bind:value={replyBind}
            />
            <input type="submit" value="Post" disabled={reply.length === 0} />
        </form>
        <div class="comments">
            {#each post.comments as c}
                <div class="comment">
                    <p class="content">{c.content}</p>
                    <p class="author">{c.author.name} {c.author.surname}</p>
                    <button on:click|preventDefault={() => onDelete(c.id)}><Icon icon="mdi:delete" /></button>
                </div>
            {/each}
        </div>
    {/if}
</Layout>

<style lang="scss">
    .comment {
        padding: 8px;
        border: 2px solid var(--white-lighter);
        margin-bottom: 8px;

        > p {
            margin: 0;
        }

        > .author {
            color: var(--primary);
        }
    }
</style>
