import { storage } from "./storage";
import type { User } from "@/types/auth";

export function getCachedUser(): User | null {
  return storage.getUser<User>();
}

export function clearAuthData(): void {
  storage.clearAll();
}
