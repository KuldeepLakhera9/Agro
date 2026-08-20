export const ROLES = ["customer", "staff", "owner"] as const;
export type Role = (typeof ROLES)[number];

export const ADMIN_ROLES: Role[] = ["staff", "owner"];
