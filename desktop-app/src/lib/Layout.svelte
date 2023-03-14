<script lang="ts">
    import { AuthStore, type AuthData } from "../stores";
    import { link, replace } from "svelte-spa-router";
    import active from "svelte-spa-router/active";

    let authData: AuthData;
    AuthStore.subscribe((v) => (authData = v));

    function logout() {
        AuthStore.update(() => {
            return {
                isAuthenticated: false
            }
        });

        replace("/");
    }
</script>

<div class="navbar">
    <ul>
        <li><a href="/users" use:link use:active>Users</a></li>
        <li><a href="/fleet" use:link use:active>Fleet</a></li>
        <li><a href="/trips" use:link use:active>Trips</a></li>
        <li><a href="/forum" use:link use:active>Forum</a></li>
        <li><button on:click|preventDefault={logout}>Logout</button></li>
        <li>{authData.user?.name} {authData.user?.surname}</li>
    </ul>
</div>
<div class="container">
    <slot />
</div>

<style lang="scss">
    .navbar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 48px;
        background-color: var(--black);
        color: var(--white);

        > ul {
            display: flex;
            width: 100%;
            height: 100%;
            list-style: none;
            padding: 0;
            margin: 0;

            > li {
                flex: 1;
                padding: 0;
                margin: 0;
                cursor: pointer;
                display: flex;
                justify-content: center;
                align-items: center;
                
                &:hover {
                    background-color: var(--black-light);
                }
                
                > a {
                    height: 100%;
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    color: inherit;
                    text-decoration: none;
                    transition: 0.1s all;

                    &:global(.active) {
                        background-color: var(--primary-darker);
                        font-weight: 700;
                    }
                }

                > button {
                    height: 100%;
                    width: 100%;
                    border: none;
                    background-color: var(--secondary-darker);
                    color: inherit;
                    font-size: 16px;
                    font-weight: 700;
                    
                    &:hover {
                        background-color: var(--secondary-dark);
                    }
                }

                &:last-child {
                    background-color: var(--tertiary);
                    font-weight: 700;
                }
            }
        }
    }

    .container {
        margin-top: 64px;
    }
</style>