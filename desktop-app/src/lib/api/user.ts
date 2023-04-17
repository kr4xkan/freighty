import { fetch } from "@tauri-apps/api/http";
import type { User } from "../../types";
import { AppStore } from "../../stores";

type RegisterRequest = {
    login: string;
    password: string;
    name: string;
    surname: string;
    contact: string;
    dateOfBirth: number;
}

type RegisterResponse = {
    success: boolean;
    fields?: string[];
    user: User;
}

export const register = async (req: RegisterRequest): Promise<RegisterResponse> => {
    const res = await fetch<RegisterResponse>("http://localhost:3000/user/register", {
        method: "POST",
        body: {
            type: "Json",
            payload: req
        }
    });

    return res.data;
};

export const updateUser = async (id: number, req: RegisterRequest): Promise<RegisterResponse> => {
    const res = await fetch<RegisterResponse>("http://localhost:3000/user/update/"+id, {
        method: "PUT",
        body: {
            type: "Json",
            payload: req
        }
    });

    return res.data;
};

type LoginRequest = {
    login: string;
    password: string;
}

type LoginResponse = {
    success: boolean;
    fields?: string[];
    user: User;
}

export const login = async (req: LoginRequest): Promise<LoginResponse> => {
    const res = await fetch<LoginResponse>("http://localhost:3000/user/login", {
        method: "POST",
        body: {
            type: "Json",
            payload: req
        }
    });

    return res.data;
};

type GetAllResponse = {
    users: User[];
}

export const loadUsers = async (): Promise<void> => {
    const res = await fetch<GetAllResponse>("http://localhost:3000/user");

    AppStore.update((v) => {
        v.company.users = res.data.users;
        return v;
    });
};