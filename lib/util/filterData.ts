export function filterData<T extends Record<string, any>>(
  obj: T,
  options: {
    include?: (keyof T)[];
    exclude?: (keyof T)[];
  } = {}
): Partial<T> {
  const { include = [], exclude = [] } = options;

  // Determine if all properties should be included
  const includeAll = include.length === 0;

  // Early return if no processing is needed
  if (includeAll && exclude.length === 0) {
    return obj;
  }

  // Convert arrays to Sets for faster lookups
  const includeSet = new Set(include);
  const excludeSet = new Set(exclude);

  // Process inclusions
  const output: Partial<T> = includeAll
    ? { ...obj }
    : Object.fromEntries(
        Object.entries(obj).filter(([key]) => includeSet.has(key as keyof T))
      ) as Partial<T>;

  // Process exclusions
  const filteredOutput: Partial<T> = Object.fromEntries(
    Object.entries(output).filter(([key]) => !excludeSet.has(key as keyof T))
  ) as Partial<T>;

  return filteredOutput;
}

