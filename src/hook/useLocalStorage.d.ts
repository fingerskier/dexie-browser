declare function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void]

export default useLocalStorage

export function getItem<T = unknown>(key: string): T | null
