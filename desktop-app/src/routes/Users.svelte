<script lang="ts">
    import { dialog } from "@tauri-apps/api";
    import Icon from "@iconify/svelte";

    import { AppStore } from "../stores";
    import Layout from "../lib/Layout.svelte";
    import { push } from "svelte-spa-router";

    $: users = $AppStore.company.users;

    function onEdit(id: number) {
        push("/users/"+id);
    }

    async function onDelete(id: number) {
        const user = users[id];
        let yes = await dialog.confirm(`Are you sure you want to delete '${user.login}' ?`);
        if (!yes) return;

        console.log(id);

        AppStore.update((v) => {
            v.company.users = v.company.users.filter((_, i) => i !== id);
            return v;
        });
    }
</script>

<Layout>
    <table class="user-list" cellspacing=0 cellpadding=8>
        <tr class="header">
            <th>Id</th>
            <th>Name</th>
            <th>Surname</th>
            <th>Contact</th>
            <th>Role</th>
            <th>Actions</th>
        </tr>
        {#each users as u, i}
            <tr class="user-card">
                <td>{i}</td>
                <td>{u.name}</td>
                <td>{u.surname}</td>
                <td>{u.contact}</td>
                <td>{u.role}</td>
                <td>
                    <button on:click|preventDefault={() => onEdit(i)}><Icon icon="mdi:lead-pencil" /></button>
                    <button on:click|preventDefault={() => onDelete(i)}><Icon icon="mdi:delete"/></button>
                </td>
            </tr>
        {/each}
    </table>
</Layout>

<style lang="scss">
    .user-list {
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