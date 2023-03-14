import { writable } from "svelte/store";
import type { Company, User } from "./types";

export type AuthData = {
    isAuthenticated: boolean;
    user?: User;
}

export const AuthStore = writable<AuthData>({
    isAuthenticated: false
});

export const loggedIn = (data: AuthData) => {
    AuthStore.update(() => data);
}

export type AppData = {
    company: Company;
}

export const AppStore = writable<AppData>({
    company: {
        name: "Default Company",
        users: [
            {
                id: 0,
                name: "John",
                surname: "Doe",
                contact: "john@doe.io",
                dateOfBirth: new Date(),
                extraInfo: {},
                login: "john",
                password: "doe",
                role: "manager"
            },
            {
                id: 1,
                name: "Jane",
                surname: "Doe",
                contact: "john@doe.io",
                dateOfBirth: new Date(),
                extraInfo: {},
                login: "johefzan",
                password: "doe",
                role: "manager"
            },
            {
                id: 2,
                name: "Tester",
                surname: "Trix",
                contact: "john@doe.io",
                dateOfBirth: new Date(),
                extraInfo: {},
                login: "jfeaohn",
                password: "doe",
                role: "worker"
            }
        ],
        fleet: [
            {
                id: 0,
                licensePlate: "LJA 342",
                model: "Generic V",
            },
            {
                id: 1,
                licensePlate: "KLC 923",
                model: "Stellar 2022",
            },
            {
                id: 2,
                licensePlate: "ORB 111",
                model: "Tesla Semi 2040",
                currentDriver: {
                    id: 2,
                    name: "Tester",
                    surname: "Trix",
                    contact: "john@doe.io",
                    dateOfBirth: new Date(),
                    extraInfo: {},
                    login: "jfeaohn",
                    password: "doe",
                    role: "worker"
                }
            }
        ],
        trips: [
            {
                cargo: "Nuclear Warhead",
                path: [
                    { address: "Washington DC" },
                    { address: "Miami" },
                    { address: "Tampa" },
                    { address: "San Francisco" }
                ],
            },
            {
                cargo: "Coca-Cola",
                path: [
                    { address: "Paris" },
                    { address: "Lyon" },
                    { address: "Marseille" },
                ],
                manager: {
                    id: 0,
                    name: "John",
                    surname: "Doe",
                    contact: "john@doe.io",
                    dateOfBirth: new Date(),
                    extraInfo: {},
                    login: "john",
                    password: "doe",
                    role: "manager"
                },
                truck: {
                    id: 1,
                    licensePlate: "KLC 923",
                    model: "Stellar 2022",
                }
            }
        ],
        forumPosts: [
            {
                title: "Lorem ipsum",
                content: "Dolor sit amet consectetur adesciping elit",
                author: {
                    id: 2,
                    name: "Tester",
                    surname: "Trix",
                    contact: "john@doe.io",
                    dateOfBirth: new Date(),
                    extraInfo: {},
                    login: "jfeaohn",
                    password: "doe",
                    role: "worker"
                },
                comments: [
                    {
                        content: "A sample reply",
                        author: {
                            id: 1,
                            name: "John",
                            surname: "Doe",
                            contact: "john@doe.io",
                            dateOfBirth: new Date(),
                            extraInfo: {},
                            login: "john",
                            password: "doe",
                            role: "manager"
                        }
                    },
                    {
                        content: "Another reply but this will be longer to test the dimensions of the box containing that comment",
                        author: {
                            id: 1,
                            name: "Jane",
                            surname: "Doe",
                            contact: "john@doe.io",
                            dateOfBirth: new Date(),
                            extraInfo: {},
                            login: "johefzan",
                            password: "doe",
                            role: "manager"
                        }
                    }
                ]
            },
            {
                title: "Making an egg",
                content: "1. Crack the egg 2. Cook the egg 3. Eat the egg",
                author: {
                    id: 0,
                    name: "John",
                    surname: "Doe",
                    contact: "john@doe.io",
                    dateOfBirth: new Date(),
                    extraInfo: {},
                    login: "john",
                    password: "doe",
                    role: "manager"
                },
                comments: []
            }
        ]
    }
});

export const addUser = (user: User) => {
    AppStore.update((v) => {
        v.company.users.push(user);
        return v;
    });
}
