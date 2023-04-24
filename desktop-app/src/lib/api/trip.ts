import { fetch } from "@tauri-apps/api/http";
import type { Trip, User } from "../../types";
import { AppStore } from "../../stores";

type Response = {
    trips: Trip[];
}

export const loadTrip = async (user: User): Promise<void> => {
    const res = await fetch<Response>(`http://localhost:3000/trip`, {
        method: 'GET',
        body: {
            type: "Json",
            payload: {
                id: user.id,
                role: user.role
            }
        }
    });

    AppStore.update((v) => {
        v.company.trips = res.data.trips;
        return v;
    })
};

type AddRequest = {
    cargo: string;
    path: {
        address: string;
        lat: number;
        lon: number;
    }[];
    managerId: number;
    truckId: number;
}

type AddResponse = {
    success: boolean;
    fields?: string[];
}

export const addTrip = async (req: AddRequest): Promise<AddResponse> => {
    const res = await fetch<AddResponse>("http://localhost:3000/trip/", {
        method: "POST",
        body: {
            type: "Json",
            payload: req
        }
    });

    return res.data;
};

export const updateTrip = async (id: number, req: AddRequest): Promise<AddResponse> => {
    const res = await fetch<AddResponse>("http://localhost:3000/trip/"+id, {
        method: "PUT",
        body: {
            type: "Json",
            payload: req
        }
    });

    return res.data;
}

export const removeTrip = async (id: number) => {
    await fetch("http://localhost:3000/trip/"+id, {
        method: "DELETE"
    });
}