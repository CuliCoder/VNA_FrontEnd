const KEYS = {
  USER: "vna_user",
} as const;

function get<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  } catch {
    return null;
  }
}

function set<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function remove(...keys: string[]): void {
  try {
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}

export const storage = {
  getUser: <T>() => get<T>(KEYS.USER),
  setUser: <T>(user: T) => set(KEYS.USER, user),
  clearAll: () => remove(KEYS.USER),
};
