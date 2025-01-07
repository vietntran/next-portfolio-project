// src/services/userService.ts
import type { AppUser } from "../types/user";

export type { AppUser as User };

export const fetchUsers = async (
  page: number,
  pageSize: number,
  sort?: string,
): Promise<AppUser[]> => {
  try {
    const params = new URLSearchParams();
    if (sort) params.append("sort", sort);
    params.append("page", page.toString());
    params.append("pageSize", pageSize.toString());

    const response = await fetch(`/api/users?${params.toString()}`);
    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }
    const users: AppUser[] = await response.json();
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};
