export function filterData(obj: any, {include=[], exclude=[] }){
    // Initialize logger for this function

  // Log input parameters for debugging
  // log.debug(
  //   { properties, include, exclude },
  //   'Unprocessed properties:'
  // );

  // Determine if all properties should be included
  const includeAll = include.length === 0;
  //log.trace({ includeAll });

  // Early return if no processing is needed
  if (includeAll && exclude.length === 0) {
    //log.debug({ properties }, 'Processed properties:');
    return obj;
  }

  // Convert arrays to Sets for faster lookups
  const includeSet = new Set(include);
  const excludeSet = new Set(exclude);

  // Process inclusions
  const output = includeAll
    ? { ...obj } // Include all if includeAll is true
    : Object.fromEntries(
      Object.entries(obj).filter(([key]) => includeSet.has(key))
    );

  // Process exclusions
  const filteredOutput = Object.fromEntries(
    Object.entries(output).filter(([key]) => !excludeSet.has(key))
  );

  // Log the final processed properties
  //log.debug({ properties: filteredOutput }, 'Processed properties:');

  return filteredOutput;
}