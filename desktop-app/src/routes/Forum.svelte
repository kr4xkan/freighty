<script lang="ts">
    import Icon from "@iconify/svelte";
    import { onMount } from "svelte";
    import { link, push } from "svelte-spa-router";

    import { AppStore, AuthStore } from "../stores";
    import Layout from "../lib/Layout.svelte";
    import { addPost, loadForum, removePost } from "../lib/api/forum";
    import { dialog } from "@tauri-apps/api";

    let authData = $AuthStore;

    let titleBind = "";
    $: title = titleBind.trim();
    let contentBind = "";
    $: content = contentBind.trim();

    let errors: any = {};

    onMount(async () => {
        await loadForum();
    });

    async function onPost() {
        const res = await addPost({
            title,
            content,
            authorId: authData.user?.id ?? -1
        });
        if (!res.success) {
            errors = {};
            res.fields?.forEach((e) => {
                errors[e] = " ";
            });

            return;
        }
        push("/forum/"+res.post.id);
        titleBind = "";
        contentBind = "";
    }

    async function onDelete(id: number) {
        const post = $AppStore.company.forumPosts.find((v) => v.id === id);
        if (!post) return;
        let yes = await dialog.confirm(`Are you sure you want to delete '${post.title}' ?`);
        if (!yes) return;

        await removePost(id);

        AppStore.update((v) => {
            v.company.forumPosts = v.company.forumPosts.filter((v) => v.id !== id);
            return v;
        });
    }
</script>

<Layout>
    <h1>Forum</h1>
    <h3>Create a new post</h3>
    <form on:submit|preventDefault={onPost}>
        <input
            class="{errors.title && "error"}"
            type="text"
            name="title"
            placeholder="Title..."
            bind:value={titleBind}
        />
        <input
            class="{errors.content && "error"}"
            type="text"
            name="content"
            placeholder="Content..."
            bind:value={contentBind}
        />
        <input
            type="submit"
            value="Post"
            disabled={title.length === 0 || content.length === 0}
        />
    </form>
    <h3>Latests posts</h3>
    <ul>
        {#each $AppStore.company.forumPosts as post}
            <li>
                <a href={"/forum/" + post.id} use:link>
                    <p class="title">{post.title}</p>
                    <p class="preview">{post.content}</p>
                    {#if post.comments.length}
                        <p class="comment">
                            {post.comments.length}<Icon
                                icon="mdi:comment-text-outline"
                            />
                        </p>
                    {/if}
                    <p class="author">
                        {post.author.name}
                        {post.author.surname}
                    </p>
                </a>
                <button on:click|preventDefault={() => onDelete(post.id)}><Icon icon="mdi:delete"/></button>
            </li>
        {/each}
    </ul>
</Layout>

<style lang="scss">
    a {
        text-decoration: none;
        color: var(--black);
    }

    ul {
        list-style: none;
        padding: 0;
        width: 60%;

        > li {
            background-color: var(--white-dark);
            padding: 16px;
            margin: 0 16px;
            margin-bottom: 24px;
            position: relative;

            > button {
                position: absolute;
                top: 8px;
                right: 8px;
            }

            > a {
                height: 100%;
                width: 100%;

                > p {
                    margin: 0;

                    &.title {
                        font-weight: 600;
                    }

                    &.preview {
                        font-style: italic;
                        color: var(--grey);
                    }

                    &.comment {
                        font-size: 16px;
                        display: flex;
                        align-items: center;
                        gap: 4px;
                        font-weight: 500;
                        margin-top: 8px;
                        margin-bottom: -8px;
                        color: var(--secondary);
                    }

                    &.author {
                        position: absolute;
                        bottom: 8px;
                        right: 8px;
                    }
                }
            }

            &:hover {
                opacity: 0.8;
            }
        }
    }
</style>
