<script lang="ts">
    import { dialog } from "@tauri-apps/api";
    import Icon from "@iconify/svelte";

    import { AppStore } from "../stores";
    import Layout from "../lib/Layout.svelte";
    import { push } from "svelte-spa-router";

    $: trips = $AppStore.company.trips;

    function onEdit(id: number) {
        push("/trips/"+id);
    }

    function onCreate() {
        push("/trips/-1");
    }

    async function onDelete(id: number) {
        const trip = trips[id];
        let yes = await dialog.confirm(`Are you sure you want to delete '${trip.cargo}' ?`);
        if (!yes) return;

        AppStore.update((v) => {
            v.company.trips = v.company.trips.filter((_, i) => i !== id);
            return v;
        });
    }
</script>

<Layout>
    <button class="add-button" on:click|preventDefault={onCreate}><Icon width={32} icon="material-symbols:add"/></button>
    <table class="trip-list" cellspacing=0 cellpadding=8>
        <tr class="header">
            <th>Id</th>
            <th>Cargo</th>
            <th>No. of checkpoints</th>
            <th>Manager</th>
            <th>Truck</th>
            <th>Actions</th>
        </tr>
        {#each trips as u, i}
            <tr>
                <td>{i}</td>
                <td>{u.cargo}</td>
                <td>{Math.max(u.path.length - 1, 0)}</td>
                <td>{u.manager?.name ?? "/"}</td>
                <td>{u.truck?.licensePlate ?? "/"}</td>
                <td>
                    <button on:click|preventDefault={() => onEdit(i)}><Icon icon="mdi:lead-pencil" /></button>
                    <button on:click|preventDefault={() => onDelete(i)}><Icon icon="mdi:delete"/></button>
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