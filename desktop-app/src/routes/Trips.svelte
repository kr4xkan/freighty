<script lang="ts">
    import { dialog } from "@tauri-apps/api";
    import Icon from "@iconify/svelte";

    import { AppStore, AuthStore } from "../stores";
    import Layout from "../lib/Layout.svelte";
    import { push } from "svelte-spa-router";
    import { onMount } from "svelte";
    import { loadTrip, removeTrip } from "../lib/api/trip";
    import { hasRights } from "../lib/utils";

    $: trips = $AppStore.company.trips;

    onMount(async () => {
        if ($AuthStore.user) await loadTrip($AuthStore.user);
    });

    function onEdit(id: number) {
        push("/trips/"+id);
    }

    function onCreate() {
        push("/trips/-1");
    }

    async function onDelete(id: number) {
        const trip = trips.find(e => e.id === id);
        if (!trip) return;
        let yes = await dialog.confirm(`Are you sure you want to delete '${trip.cargo}' ?`);
        if (!yes) return;

        await removeTrip(id);
        AppStore.update((v) => {
            v.company.trips = v.company.trips.filter((e) => e.id !== id);
            return v;
        });
    }
</script>

<Layout>
    {#if hasRights("manager", $AuthStore.user?.role || "" )}
    <button class="add-button" on:click|preventDefault={onCreate}><Icon width={32} icon="material-symbols:add"/></button>
    {/if}
    <table class="trip-list" cellspacing=0 cellpadding=8>
        <tr class="header">
            <th>Id</th>
            <th>Cargo</th>
            <th>No. of checkpoints</th>
            <th>Manager</th>
            <th>Truck</th>
            <th>Actions</th>
        </tr>
        {#each trips as u}
            <tr>
                <td>{u.id}</td>
                <td>{u.cargo}</td>
                <td>{Math.max(u.path.length - 1, 0)}</td>
                <td>{u.manager?.name ?? "/"}</td>
                <td>{u.truck?.licensePlate ?? "/"}</td>
                <td>
                    {#if hasRights("manager", $AuthStore.user?.role || "" )}
                    <button on:click|preventDefault={() => onEdit(u.id)}><Icon icon="mdi:lead-pencil" /></button>
                    <button on:click|preventDefault={() => onDelete(u.id)}><Icon icon="mdi:delete"/></button>
                    {/if}
                </td>
            </tr>
        {/each}
    </table>
</Layout>

<style lang="scss">
    .trip-list {
        width: 100%;
        gap: 0;
        padding: 0;
        td, th {
            border: none;
        }
        td {
            text-align: center;
        }
    }
    .header {
        background-color: var(--primary);
    }
</style>