<script lang="ts">
    import Icon from "@iconify/svelte";
    import { link, replace } from "svelte-spa-router";
    import { z } from "zod";

    import { AppStore, loggedIn } from "../stores";

    let appData = $AppStore;

    let errors: any = {};

    let isLoading = false;

    let data = {
        login: "",
        password: "",
    };

    function onLogin() {
        isLoading = true;

        let validatorSchema = z.object({
            login: z.string().min(1),
            password: z.string().min(1)
        });
        let result = validatorSchema.safeParse(data);

        errors = {};
        if (!result.success) {
            errors = result.error.flatten().fieldErrors;
            
            isLoading = false;
            return;
        }
        let process = result.data;

        let i = appData.company.users.findIndex((u) => u.login === process.login);
        if (i === -1) {
            errors.login = true;
            isLoading = false;
            return;
        }
        if (appData.company.users[i].password !== process.password) {
            errors.password = true;
            isLoading = false;
            return;
        }

        loggedIn({ isAuthenticated: true, user: appData.company.users[i] });

        replace("/users");

        isLoading = false;
    }
</script>

<div class="container">
    <form on:submit|preventDefault={onLogin}>
        <div class="form-input {errors.login && 'error'}">
            <input
                class="form-control"
                name="login"
                type="text"
                placeholder="Login"
                bind:value={data.login}
            />
            <div class="icon"><Icon icon="mdi:user" /></div>
        </div>
        <div class="form-input {errors.password && 'error'}">
            <input
                name="password"
                class="form-control"
                type="password"
                placeholder="Password"
                bind:value={data.password}
            />
            <div class="icon"><Icon icon="mdi:password" /></div>
        </div>
        <input type="submit" value="Login" disabled={isLoading} />
    </form>
    <a href="/register" use:link>Or register</a>
</div>

<style lang="scss">
    .container {
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;

        > form {
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;

            > div,
            > input {
                border-radius: 4px;
            }

            > .form-input {
                margin-bottom: 24px;
                border: none;
                background-color: #eee;
                width: 300px;
                display: flex;
                align-items: center;
                flex-direction: row-reverse;
                padding: 0 8px;
                transition: all 0.2s;
                border-radius: 8px;

                &:focus-within,
                &:hover {
                    background-color: #f8f8f8;
                }
                > .icon {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 0 8px;
                    transition: all 0.1s ease-in-out;
                }

                > .form-control {
                    background: none;
                    margin: none;
                    border: none;
                    padding: 12px 8px;
                    flex: 1;

                    &:focus {
                        outline: none;

                        + .icon {
                            color: #448ae5;
                        }
                    }

                    &::placeholder {
                        font-style: italic;
                        vertical-align: middle;
                    }
                }

                &.error {
                    outline: 3px solid #f55;
                    > .form-control:focus + .icon {
                        color: #f55;
                    }
                }
            }

            > input[type="submit"] {
                background-color: #448ae5;
                color: white;
                border: none;
                padding: 12px 24px;
                font-weight: 600;
                transition: all 0.1s ease-in;
                cursor: pointer;

                &:hover {
                    background-color: #78a9ea;
                }

                &:disabled {
                    background-color: #a5c2e7;
                    cursor: progress;
                }
            }
        }
    }
</style>
