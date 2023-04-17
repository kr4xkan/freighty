<script lang="ts">
    import Icon from "@iconify/svelte";
    import { link, replace } from "svelte-spa-router";
    import { z } from "zod";
    import { DateInput } from "date-picker-svelte";

    import type { User } from "../types";
    import { addUser, AppStore, loggedIn } from "../stores";
    import { register } from "../lib/api/user";

    let isLoading = false;
    let errors: any = {};

    let bindDate = new Date();
    let data = {
        login: "",
        password: "",
        name: "",
        surname: "",
        contact: "",
        dateOfBirth: Date.now(),
    };

    $: () => {
        data.dateOfBirth = bindDate.getTime();
    };

    async function onRegister() {
        isLoading = true;

        const res = await register(data);

        if (res.success) {
            loggedIn({ isAuthenticated: true, user: res.user });

            replace("/users");
        } else {
            errors = {};
            res.fields?.forEach((e) => {
                errors[e] = " ";
            });
        }

        isLoading = false;
    }
</script>

<div class="container">
    <form on:submit|preventDefault={onRegister}>
        <div class="form-input {errors.name && 'error'}">
            <input
                class="form-control"
                name="name"
                type="text"
                placeholder="First name"
                bind:value={data.name}
            />
            <div class="icon"><Icon icon="mdi:user" /></div>
        </div>
        <div class="form-input {errors.surname && 'error'}">
            <input
                class="form-control"
                name="surname"
                type="text"
                placeholder="Last name"
                bind:value={data.surname}
            />
            <div class="icon"><Icon icon="mdi:user" /></div>
        </div>
        <div class="form-input {errors.contact && 'error'}">
            <input
                class="form-control"
                name="contact"
                type="text"
                placeholder="Contact info"
                bind:value={data.contact}
            />
            <div class="icon"><Icon icon="mdi:at" /></div>
        </div>
        <div class="form-input {errors.dateOfBirth && 'error'}">
            <DateInput
                min={new Date("1900")}
                format="dd/MM/yyyy"
                bind:value={bindDate}
            />
            <div class="icon"><Icon icon="mdi:calendar-range" /></div>
        </div>
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
        <input type="submit" value="Register" disabled={isLoading} />
    </form>
    <a href="/" use:link>Or login</a>
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

                > :global(.date-time-field) {
                    width: 100%;
                    height: 100%;
                    padding: 12px 0;

                    > :global(input) {
                        width: 100%;
                        height: 100%;
                        background: none;
                        border: none;
                    }
                }

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
