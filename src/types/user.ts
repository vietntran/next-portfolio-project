// Base user type extending NextAuth's User type
export interface BaseUser {
  id: string; // Using string to align with NextAuth's default
  name?: string | null;
  email?: string | null;
  image?: string | null;
  emailVerified?: Date | null;
}

// Extended user type for additional application-specific fields
export interface AppUser extends BaseUser {
  role: string; // Required field from userService
  // Add any other application-specific fields here
}

// Type guard to check if a user has all AppUser fields
export function isAppUser(user: BaseUser): user is AppUser {
  return (user as AppUser).role !== undefined;
}
