<script lang="ts">
    import Icon from "@iconify/svelte";
    import { dialog } from "@tauri-apps/api";
    import { addTrip, updateTrip } from "../lib/api/trip";
    import { push } from "svelte-spa-router";
    import mapboxgl from "mapbox-gl";
    // @ts-ignore
    import AutoComplete from "simple-svelte-autocomplete";

    import Layout from "../lib/Layout.svelte";
    import { AppStore, AuthStore } from "../stores";
    import { hasRights } from "../lib/utils";
    import { onMount } from "svelte";

    export let params: {
        id: string;
    };

    const trip = $AppStore.company.trips.find(
        (e) => e.id === parseInt(params.id)
    );

    let data = {
        cargo: trip?.cargo ?? "",
        path:
            trip?.path
                .map((e) => ({
                    address: e.address,
                    order: e.order,
                    lat: e.lat,
                    lon: e.lon,
                }))
                .sort((a, b) => a.order - b.order) ?? [],
        managerId:
            trip?.manager?.id ??
            ($AuthStore.user?.role === "manager" ? $AuthStore.user?.id : -1),
        truckId: trip?.truck?.id ?? -1,
    };

    let map: mapboxgl.Map;

    onMount(() => {
        mapboxgl.accessToken = import.meta.env.VITE_MAP_BOX_API_KEY ?? "";
        map = new mapboxgl.Map({
            container: "map", // container ID
            style: "mapbox://styles/mapbox/streets-v12", // style URL
            center: [-74.5, 40], // starting position [lng, lat]
            zoom: 9, // starting zoom
        });
        map.on('styledata', () => {
            let geos: any = data.path.map((e: any) => [e.lat, e.lon]);
            if (geos.length > 0) {
                map.setCenter(geos[0]);
            }

            if (!map.getSource("route"))
                map.addSource("route", {
                    type: "geojson",
                    data: {
                        type: "Feature",
                        properties: {},
                        geometry: {
                            type: "LineString",
                            coordinates: geos,
                        },
                    },
                });
            if (!map.getLayer("route"))
                map.addLayer({
                    id: "route",
                    source: "route",
                    type: "line"
                });
        });
    });

    const appData = $AppStore;

    let isLoading = false;
    let errors: any = {};

    async function onSave() {
        isLoading = true;

        let req = {
            ...data,
            path: data.path.map((e) => {
                return {
                    address: e.address,
                    lat: e.lat,
                    lon: e.lon,
                }
            }),
        };

        let res;
        if (trip) {
            // UPDATE
            res = await updateTrip(trip.id, req);
        } else {
            // CREATE
            res = await addTrip(req);
        }

        if (!res.success) {
            errors = {};
            res.fields?.forEach((e) => {
                errors[e] = " ";
            });

            isLoading = false;
            return;
        }

        await dialog.message("Trip updated.");

        isLoading = false;

        push("/trips");
    }

    function onCancel() {
        push("/trips");
    }

    $: doGeoStuff(data);

    const doGeoStuff = (newData: any) => {
        if (!map) return;

        let geos = newData.path.map((e: any) => [e.lat, e.lon]);

        if (geos.length > 1) {
            console.log(geos);
            map.removeLayer("route");
            map.removeSource("route");
            map.addSource("route", {
                type: "geojson",
                data: {
                    type: "Feature",
                    properties: {},
                    geometry: {
                        type: "LineString",
                        coordinates: geos,
                    },
                },
            });
            map.addLayer({
                id: "route",
                source: "route",
                type: "line"
            });
        }
    };

    function onAddCheckpoint() {
        data.path = [
            ...data.path,
            {
                address: selectedAddress,
                order: data.path.length > 0 ? data.path[data.path.length - 1].order + 1 : 0,
                lat: selectedGeo[0],
                lon: selectedGeo[1],
            },
        ];
    }

    function onDeleteCheckpoint(i: number) {
        data.path = data.path.filter((_, k) => k !== i);
    }

    async function getItems(keyword: string) {
        const kw = encodeURIComponent(keyword);
        const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${kw}.json?proximity=ip&access_token=pk.eyJ1Ijoia3I0eGthbiIsImEiOiJjbGd1djNrczMwMDBvM2xvZjVpMm8ya3g0In0.0UnG3JbdB-pXP31115mtIw`,
            {
                method: "GET",
            }
        );
        const json = await res.json();
        const results = json.features.map((e: any) => e.place_name);
        return results;
    }

    async function selectAddress(final: string) {
        const kw = encodeURIComponent(final);
        const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${kw}.json?proximity=ip&access_token=pk.eyJ1Ijoia3I0eGthbiIsImEiOiJjbGd1djNrczMwMDBvM2xvZjVpMm8ya3g0In0.0UnG3JbdB-pXP31115mtIw`,
            {
                method: "GET",
            }
        );
        const json = await res.json();
        selectedGeo = json.features[0].center;
        map.setCenter(selectedGeo);
    }

    let selectedGeo: [number, number];
    let selectedAddress: string;
</script>

<Layout>
    <div class="container">
        <form on:submit|preventDefault={onSave}>
            <div class="form-input {errors.cargo && 'error'}">
                <label for="cargo">Cargo</label>
                <input
                    disabled={!hasRights(
                        "manager",
                        $AuthStore.user?.role ?? ""
                    )}
                    class="form-control"
                    name="cargo"
                    type="text"
                    placeholder="Cargo"
                    bind:value={data.cargo}
                />
                <div class="icon"><Icon icon="mdi:user" /></div>
            </div>
            <div class="form-input {errors.managerId && 'error'}">
                <label for="model">Manager</label>
                <select
                    disabled={!hasRights(
                        "manager",
                        $AuthStore.user?.role ?? ""
                    )}
                    name="driver"
                    bind:value={data.managerId}
                >
                    <option value={-1}>None</option>
                    <option disabled>-- Managers --</option>
                    {#each appData.company.users as v}
                        {#if v.role === "manager"}
                            <option value={v.id}>{v.name} {v.surname}</option>
                        {/if}
                    {/each}
                </select>
                <div class="icon"><Icon icon="mdi:user" /></div>
            </div>
            <div class="form-input {errors.truckId && 'error'}">
                <label for="model">Truck</label>
                <select
                    disabled={!hasRights(
                        "manager",
                        $AuthStore.user?.role ?? ""
                    )}
                    name="driver"
                    bind:value={data.truckId}
                >
                    <option value={-1}>None</option>
                    <option disabled>-- Trucks --</option>
                    {#each appData.company.fleet as v}
                        <option value={v.id}
                            >{v.licensePlate} - {v.model}</option
                        >
                    {/each}
                </select>
                <div class="icon"><Icon icon="mdi:user" /></div>
            </div>
            <div class="form-input-select {errors.path && 'error'}">
                <label for="model">Checkpoints</label>
                <AutoComplete
                    searchFunction={getItems}
                    delay="400"
                    localFiltering={false}
                    onChange={selectAddress}
                    bind:selectedItem={selectedAddress}
                />
                <button on:click|preventDefault={onAddCheckpoint}
                    >Add checkpoint</button
                >
                <ul>
                    {#each data.path as _, i}
                        <li>
                            <p>{data.path[i].address}</p>
                            <button
                                on:click|preventDefault={() =>
                                    onDeleteCheckpoint(i)}
                                ><Icon icon="mdi:delete" /></button
                            >
                        </li>
                    {/each}
                </ul>
            </div>
            <button on:click|preventDefault={onCancel}>Cancel</button>
            <input type="submit" value="Save" disabled={isLoading} />
        </form>
    </div>
    <div id="map" />
</Layout>

<style lang="scss">
    #map {
        width: 500px;
        height: 300px;
        margin: 0 auto;
        margin-top: 32px;
    }

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

            &.error {
                border: 3px solid #f55;
            }

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

                    > p {
                        flex: 1;
                        margin: 0;
                        font-weight: 600;
                        font-size: 12px;
                        font-style: italic;
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
