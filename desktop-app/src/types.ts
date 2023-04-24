export type Company = {
    name: string;
    users: User[];
    fleet: Truck[];
    trips: Trip[];
    forumPosts: ForumPost[];
}

export type User = {
    id: number;
    name: string;
    surname: string;
    login: string;
    password: string;
    role: "admin" | "manager" | "worker";
    contact: string;
    dateOfBirth: number;
    extraInfo: ExtraUserInfo;
}

export type ExtraUserInfo = {
    medicalCertificate?: string;
}

export type Truck = {
    id: number;
    licensePlate: string;
    model: string;
    currentDriver?: User;
}

export type Trip = {
    id: number;
    cargo: string;
    truck?: Truck;
    manager?: User;
    path: Checkpoint[];
}

export type Checkpoint = {
    id: number;
    address: string;
    order: number;
}

export type ForumPost = {
    id: number;
    title: string;
    content: string;
    author: User;
    comments: Comment[];
}

export type Comment = {
    id: number;
    content: string;
    author: User;
    parent?: Comment;
}