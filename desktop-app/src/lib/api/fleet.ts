import { fetch } from "@tauri-apps/api/http";
import type { Truck } from "../../types";
import { AppStore } from "../../stores";

type Response = {
    fleet: Truck[];
}

export const loadFleet = async (): Promise<void> => {
    const res = await fetch<Response>("http://localhost:3000/fleet/");

    AppStore.update((v) => {
        v.company.fleet = res.data.fleet;
        return v;
    })
};

type AddRequest = {
    licensePlate: string;
    model: string;
    currentDriverId: number;
}

type AddResponse = {
    success: boolean;
    fields?: string[];
}

export const addTruck = async (req: AddRequest): Promise<AddResponse> => {
    const res = await fetch<AddResponse>("http://localhost:3000/fleet/", {
        method: "POST",
        body: {
            type: "Json",
            payload: req
        }
    });

    return res.data;
};

export const updateTruck = async (id: number, req: AddRequest): Promise<AddResponse> => {
    const res = await fetch<AddResponse>("http://localhost:3000/fleet/"+id, {
        method: "PUT",
        body: {
            type: "Json",
            payload: req
        }
    });

    return res.data;
}

export const removeTruck = async (id: number) => {
    await fetch("http://localhost:3000/fleet/"+id, {
        method: "DELETE"
    });
}