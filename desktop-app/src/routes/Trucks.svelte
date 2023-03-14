<script lang="ts">
    import { dialog } from "@tauri-apps/api";
    import Icon from "@iconify/svelte";

    import { AppStore } from "../stores";
    import Layout from "../lib/Layout.svelte";
    import { push } from "svelte-spa-router";

    $: trucks = $AppStore.company.fleet;

    function onEdit(id: number) {
        push("/fleet/"+id);
    }

    function onCreate() {
        push("/fleet/-1");
    }

    async function onDelete(id: number) {
        const truck = trucks[id];
        let yes = await dialog.confirm(`Are you sure you want to delete '${truck.licensePlate}' ?`);
        if (!yes) return;

        console.log(id);

        AppStore.update((v) => {
            v.company.fleet = v.company.fleet.filter((_, i) => i !== id);
            return v;
        });
    }
</script>

<Layout>
    <button class="add-button" on:click|preventDefault={onCreate}><Icon width={32} icon="material-symbols:add"/></button>
    <table class="truck-list" cellspacing=0 cellpadding=8>
        <tr class="header">
            <th>Id</th>
            <th>License Plate</th>
            <th>Model</th>
            <th>Current Driver</th>
            <th>Actions</th>
        </tr>
        {#each trucks as u, i}
            <tr>
                <td>{i}</td>
                <td>{u.licensePlate}</td>
                <td>{u.model}</td>
                <td>{u.currentDriver?.name ?? "/"}</td>
                <td>
                    <button on:click|preventDefault={() => onEdit(i)}><Icon icon="mdi:lead-pencil" /></button>
                    <button on:click|preventDefault={() => onDelete(i)}><Icon icon="mdi:delete"/></button>
                </td>
            </tr>
        {/each}
    </table>
</Layout>

<style lang="scss">
    .truck-list {
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