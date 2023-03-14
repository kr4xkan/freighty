<script lang="ts">
    import Icon from "@iconify/svelte";
    import { dialog } from "@tauri-apps/api";
    import { push } from "svelte-spa-router";
    import { z } from "zod";

    import Layout from "../lib/Layout.svelte";
    import { AppStore } from "../stores";
    import type { Checkpoint } from "../types";

    export let params: {
        id: number;
    };

    const trip =
        params.id !== -1 ? $AppStore.company.trips[params.id] : undefined;

    let data = {
        cargo: trip?.cargo ?? "",
        path: trip?.path ?? [{ address: "Start" }, { address: "End" }],
        manager: trip?.manager?.id ?? -1,
        truck: trip?.truck?.id ?? -1
    };

    const appData = $AppStore;

    let isLoading = false;
    let errors: any = {};

    async function onSave() {
        isLoading = true;

        let validatorSchema = z.object({
            cargo: z.string().min(1),
            path: z.custom<Checkpoint[]>(),
            manager: z.number(),
            truck: z.number()
        });
        let result = validatorSchema.safeParse(data);

        errors = {};
        if (!result.success) {
            errors = result.error.flatten().fieldErrors;

            isLoading = false;
            return;
        }

        let dt = {
            ...result.data,
            manager: appData.company.users[result.data.manager],
            truck: appData.company.fleet[result.data.truck],
        };

        if (trip) {
            let updated = trip;
            updated = {
                ...updated,
                ...dt,
            };

            AppStore.update((v) => {
                v.company.trips[params.id] = updated;
                return v;
            });
        } else {
            AppStore.update((v) => {
                v.company.trips.push(dt);
                return v;
            });
        }

        await dialog.message("Trip updated.");

        isLoading = false;

        push("/trips");
    }

    function onCancel() {
        push("/trips");
    }

    function onAddCheckpoint() {
        data.path = [
            ...data.path,
            { address: `Checkpoint ${data.path.length + 1}` },
        ];
    }

    function onDeleteCheckpoint(i: number) {
        data.path = data.path.filter((_, k) => k !== i);
    }
</script>

<Layout>
    <div class="container">
        <form on:submit|preventDefault={onSave}>
            <div class="form-input {errors.cargo && 'error'}">
                <label for="cargo">Cargo</label>
                <input
                    class="form-control"
                    name="cargo"
                    type="text"
                    placeholder="Cargo"
                    bind:value={data.cargo}
                />
                <div class="icon"><Icon icon="mdi:user" /></div>
            </div>
            <div class="form-input">
                <label for="model">Manager</label>
                <select name="driver" bind:value={data.manager}>
                    <option value={-1}>None</option>
                    <option disabled>-- Managers --</option>
                    {#each appData.company.users as v, i}
                        {#if v.role === "manager"}
                            <option value={i}>{v.name} {v.surname}</option>
                        {/if}
                    {/each}
                </select>
                <div class="icon"><Icon icon="mdi:user" /></div>
            </div>
            <div class="form-input">
                <label for="model">Truck</label>
                <select name="driver" bind:value={data.truck}>
                    <option value={-1}>None</option>
                    <option disabled>-- Trucks --</option>
                    {#each appData.company.fleet as v, i}
                    <option value={i}>{v.licensePlate} - {v.model}</option>
                    {/each}
                </select>
                <div class="icon"><Icon icon="mdi:user" /></div>
            </div>
            <div class="form-input-select">
                <label for="model">Checkpoints</label>
                <button on:click|preventDefault={onAddCheckpoint}>Add checkpoint</button
                >
                <ul>
                    {#each data.path as _, i}
                        <li>
                            <input
                                type="text"
                                name={`chp-${i}`}
                                bind:value={data.path[i].address}
                            />
                            <button on:click|preventDefault={() => onDeleteCheckpoint(i)}><Icon icon="mdi:delete" /></button>
                        </li>
                    {/each}
                </ul>
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
        width: 800px;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;
        padding-top: 32px;

        > div {
            > label {
                position: absolute;
                left: 0;
                top: -24px;
                font-weight: 600;
                color: var(--secondary);
            }
        }

        > .form-input-select {
            width: 310px;
            background-color: var(--white-dark);
            padding: 12px;
            box-sizing: border-box;
            position: relative;
            border-radius: 4px;
            margin-bottom: 48px;
            
            > button {
                padding: 8px 16px;
                background-color: var(--tertiary-lighter);
                border: none;
                font-weight: 700;
                cursor: pointer;
                border-radius: 4px;
                transition: 0.1s all;

                &:hover {
                    background-color: var(--tertiary-light);
                    color: var(--white);
                }
            }

            > ul {
                list-style: none;
                margin: 0;
                margin-top: 8px;
                padding: 0 8px;

                > li {
                    width: 100%;
                    display: flex;

                    > input {
                        flex: 1;
                    }
                }
            }
        }

        > .form-input {
            margin-bottom: 48px;
            border: none;
            background-color: var(--white-dark);
            width: 300px;
            height: 48px;
            display: flex;
            align-items: center;
            flex-direction: row-reverse;
            padding: 0 8px;
            transition: all 0.2s;
            border-radius: 4px;
            position: relative;

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
