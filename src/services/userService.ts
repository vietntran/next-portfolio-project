// src/services/userService.ts
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export type UsersResponse = User[];

export const fetchUsers = async (
  page: number = 1,
  limit: number = 10,
  sort?: string
): Promise<UsersResponse> => {
  try {
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(sort && { sort }),
    });

    const response = await fetch(`/api/users?${searchParams}`);
    if (!response.ok) throw new Error("Failed to fetch users");
    return response.json();
  } catch (error) {
    throw error;
  }
};
