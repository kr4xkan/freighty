<script lang="ts">
    import Layout from "../lib/Layout.svelte";
    import { AppStore, AuthStore } from "../stores";

    export let params: {
        id: number;
    };

    const authData = $AuthStore;

    $: post = $AppStore.company.forumPosts[params.id];
    let replyBind = "";
    $: reply = replyBind.trim();

    function onPost() {
        AppStore.update((v) => {
            if (authData.user !== undefined) {
                v.company.forumPosts[params.id].comments.push({
                    content: reply,
                    author: authData.user,
                });
            }
            return v;
        });
        replyBind = "";
    }
</script>

<Layout>
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
            </div>
        {/each}
    </div>
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
