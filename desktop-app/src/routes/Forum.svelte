<script lang="ts">
    import Icon from "@iconify/svelte";
    import { link, push } from "svelte-spa-router";

    import { AppStore, AuthStore } from "../stores";
    import Layout from "../lib/Layout.svelte";

    let appData = $AppStore;
    let authData = $AuthStore;

    let titleBind = "";
    $: title = titleBind.trim();
    let contentBind = "";
    $: content = contentBind.trim();

    function onPost() {
        let newId = appData.company.forumPosts.length;
        AppStore.update((v) => {
            if (authData.user !== undefined) {
                v.company.forumPosts.push({
                    title,
                    content,
                    author: authData.user,
                    comments: [],
                });
            }
            return v;
        });
        titleBind = "";
        contentBind = "";
        push("/forum/" + newId);
    }
</script>

<Layout>
    <h1>Forum</h1>
    <h3>Create a new post</h3>
    <form on:submit|preventDefault={onPost}>
        <input
            type="text"
            name="Title"
            placeholder="Title..."
            bind:value={titleBind}
        />
        <input
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
        {#each appData.company.forumPosts as post, i}
            <li>
                <a href={"/forum/" + i} use:link>
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
