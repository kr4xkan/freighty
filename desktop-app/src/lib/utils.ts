export const hasRights = (required: string, role: string) => {
    if (required === "manager")
        return role === "admin" || role === "manager";
    if (required === "admin")
        return role === "admin";

    return true
}