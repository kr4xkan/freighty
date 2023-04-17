<script lang="ts">
    import Icon from "@iconify/svelte";
    import { dialog } from "@tauri-apps/api";
    import { addTruck, updateTruck } from "../lib/api/fleet";
    import { push } from "svelte-spa-router";
    
    import Layout from "../lib/Layout.svelte";
    import { AppStore } from "../stores";

    export let params: {
        id: string;
    };

    const appData = $AppStore;

    const truck = $AppStore.company.fleet.find((v) => v.id === parseInt(params.id));

    let data = {
        licensePlate: truck?.licensePlate ?? "",
        model: truck?.model ?? "",
        currentDriverId: truck?.currentDriver?.id ?? -1
    };

    let isLoading = false;
    let errors: any = {};

    async function onSave() {
        isLoading = true;

        let res;
        if (!truck) { // CREATE
            res = await addTruck(data);
        } else { // UPDATE
            res = await updateTruck(truck.id, data);    
        }

        if (!res.success) {
            errors = {};
            res.fields?.forEach((e) => {
                errors[e] = " ";
            });

            isLoading = false;
            return;
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
            <div class="form-input {errors.currentDriverId && "error"}">
                <label for="model">Current driver</label>
                <select name="driver" bind:value={data.currentDriverId}>
                    <option value={-1}>None</option>
                    <option disabled>-- Workers --</option>
                    {#each appData.company.users as v}
                        {#if v.role === "worker"}
                            <option value={v.id}>{v.name} {v.surname}</option>
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
