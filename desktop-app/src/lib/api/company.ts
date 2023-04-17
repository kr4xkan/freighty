import { fetch } from "@tauri-apps/api/http";
import type { Company } from "../../types";
import { AppStore } from "../../stores";

type Response = {
    company: Company;
}

export const loadCompany = async (): Promise<void> => {
    const res = await fetch<Response>("http://localhost:3000/company/");

    AppStore.update((v) => {
        v.company = res.data.company;
        return v;
    })
};