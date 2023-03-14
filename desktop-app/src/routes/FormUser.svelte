<script lang="ts">
    import Icon from "@iconify/svelte";
    import { dialog } from "@tauri-apps/api";
    import { push } from "svelte-spa-router";
    import { DateInput } from "date-picker-svelte";
    import { z } from "zod";

    import Layout from "../lib/Layout.svelte";
    import { AppStore } from "../stores";

    export let params: {
        id: number;
    };

    const user = $AppStore.company.users[params.id];

    $: data = {
        login: user.login,
        password: user.password,
        name: user.name,
        surname: user.surname,
        contact: user.contact,
        dateOfBirth: user.dateOfBirth,
    };

    let isLoading = false;
    let errors: any = {};

    async function onSave() {
        isLoading = true;

        let validatorSchema = z.object({
            login: z.string().min(1),
            password: z.string().min(1),
            name: z.string().min(1),
            surname: z.string().min(1),
            contact: z.string().email().min(1),
            dateOfBirth: z.date(),
        });
        let result = validatorSchema.safeParse(data);

        errors = {};
        if (!result.success) {
            errors = result.error.flatten().fieldErrors;

            isLoading = false;
            return;
        }

        let updated = user;
        updated = {
            ...updated,
            ...result.data,
        };

        AppStore.update((v) => {
            v.company.users[params.id] = updated;
            return v;
        });

        await dialog.message("User updated.");

        isLoading = false;

        push("/users");
    }

    function onCancel() {
        push("/users");
    }
</script>

<Layout>
    <div class="container">
        <form on:submit|preventDefault={onSave}>
            <div class="form-input {errors.name && 'error'}">
                <label for="name">First name</label>
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
                <label for="surname">Last name</label>
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
                <label for="contact">Contact info</label>
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
                <label for="dateOfBirth">Date of birth</label>
                <DateInput format="dd/MM/yyyy" bind:value={data.dateOfBirth} />
                <div class="icon"><Icon icon="mdi:calendar-range" /></div>
            </div>
            <div class="form-input {errors.login && 'error'}">
                <label for="login">Login</label>
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
                <label for="password">Password</label>
                <input
                    name="password"
                    class="form-control"
                    type="password"
                    placeholder="Password"
                    bind:value={data.password}
                />
                <div class="icon"><Icon icon="mdi:password" /></div>
            </div>
            <button on:click|preventDefault={onCancel}>Cancel</button>
            <input type="submit" value="Save" disabled={isLoading} />
        </form>
    </div>
</Layout>

<style lang="scss">
    .container {
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }

    form {
        height: 360px;
        width: 800px;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;
        padding-top: 32px;

        > .form-input {
            margin-bottom: 24px;
            border: none;
            background-color: var(--primary-light);
            width: 300px;
            height: 48px;
            display: flex;
            align-items: center;
            flex-direction: row-reverse;
            padding: 0 8px;
            transition: all 0.2s;
            border-radius: 4px;
            position: relative;

            > label {
                position: absolute;
                left: 0;
                top: -24px;
                font-weight: 600;
                color: var(--secondary);
            }

            > :global(.date-time-field) {
                width: 100%;
                height: 100%;

                > :global(input) {
                    width: 100%;
                    height: 100%;
                    background: none;
                    border: none;
                }
            }

            &:focus-within,
            &:hover {
                background-color: var(--primary-lighter);
            }
            > .icon {
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 0 8px;
                transition: all 0.1s ease-in-out;
                color: var(--secondary-darker);
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
                        color: var(--secondary);
                    }
                }

                &::placeholder {
                    font-style: italic;
                    vertical-align: middle;
                    color: var(--primary-darker);
                }
            }

            &.error {
                border: 3px solid #f55;
                > .form-control:focus + .icon {
                    color: #f55;
                }
            }
        }

        > input,
        > button {
            height: 48px;
            width: 200px;
            background-color: var(--tertiary);
            color: white;
            border: none;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.05s ease-in;
            cursor: pointer;
            border-radius: 4px;

            &:hover {
                background-color: var(--tertiary-light);
            }

            &:disabled {
                background-color: #a5c2e7;
                cursor: progress;
            }
        }

        > button {
            background-color: var(--secondary-light);
            &:hover {
                background-color: var(--secondary-lighter);
            }
        }
    }
</style>
