<script lang="ts">
    import Icon from "@iconify/svelte";
    import { dialog } from "@tauri-apps/api";
    import { push } from "svelte-spa-router";
    import { z } from "zod";
    
    import Layout from "../lib/Layout.svelte";
    import { AppStore } from "../stores";

    export let params: {
        id: number;
    };

    const appData = $AppStore;

    const truck = params.id !== -1 ? $AppStore.company.fleet[params.id] : undefined;

    let data = {
        licensePlate: truck?.licensePlate ?? "",
        model: truck?.model ?? "",
        currentDriver: truck?.currentDriver?.id ?? -1
    };

    let isLoading = false;
    let errors: any = {};

    async function onSave() {
        isLoading = true;

        let validatorSchema = z.object({
            licensePlate: z.string().min(1),
            model: z.string().min(1),
            currentDriver: z.number()
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
            currentDriver: appData.company.users[result.data.currentDriver]
        };

        if (truck) {
            let updated = truck;
            updated = {
                ...updated,
                ...dt
            };
    
            AppStore.update((v) => {
                v.company.fleet[params.id] = updated;
                return v;
            });
        } else {
            AppStore.update((v) => {
                v.company.fleet.push({
                    id: appData.company.fleet.length,
                    ...dt
                });
                return v;
            });
        }

        await dialog.message("Truck updated.");

        isLoading = false;

        push("/fleet");
    }

    function onCancel() {
        push("/fleet");
    }
</script>

<Layout>
    <div class="container">
        <form on:submit|preventDefault={onSave}>
            <div class="form-input {errors.licensePlate && "error"}">
                <label for="licensePlate">License plate</label>
                <input
                    class="form-control"
                    name="licensePlate"
                    type="text"
                    placeholder="License plate"
                    bind:value={data.licensePlate}
                />
                <div class="icon"><Icon icon="mdi:user" /></div>
            </div>
            <div class="form-input {errors.model && "error"}">
                <label for="model">Truck model</label>
                <input
                    class="form-control"
                    name="model"
                    type="text"
                    placeholder="Truck model"
                    bind:value={data.model}
                />
                <div class="icon"><Icon icon="mdi:user" /></div>
            </div>
            <div class="form-input">
                <label for="model">Current driver</label>
                <select name="driver" bind:value={data.currentDriver}>
                    <option value={-1}>None</option>
                    <option disabled>-- Workers --</option>
                    {#each appData.company.users as v, i}
                        {#if v.role === "worker"}
                            <option value={i}>{v.name} {v.surname}</option>
                        {/if}
                    {/each}
                </select>
                <div class="icon"><Icon icon="mdi:user" /></div>
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

        > input, > button {
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
