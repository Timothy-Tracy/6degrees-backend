// Neo4j Complete Database Reset Script
// WARNING: This script will delete ALL data, constraints, and indexes in the database.
// Make sure you have a backup before running this script.

// Step 1: Verify current database state (optional but recommended)
CALL apoc.meta.stats();

// Step 4: Delete all relationships
CALL apoc.periodic.iterate(
  "MATCH (n) RETURN n",
  "DETACH DELETE n",
  {batchSize:10000}
);


// Step 6: Verify that the database is empty
CALL apoc.meta.stats();

// Step 7: Reset any sequences (if used)
// Uncomment and modify if you're using APOC sequences
// CALL apoc.schema.assert({}, {});
// CALL apoc.cypher.runMany('
//   CALL apoc.sequence.reset("sequence1");
//   CALL apoc.sequence.reset("sequence2");
// ');

// Step 8: Clear APOC UUID state (if used)
// Uncomment if you're using APOC UUIDs
// CALL apoc.uuid.removeAll();

// Final Step: Print completion message
RETURN "Database reset complete. All nodes, relationships, have been removed." AS message;

// Note: To clear server-side caches, you may need to restart the database.
// This requires admin privileges and typically isn't necessary for most use cases.
// If needed, you can use: CALL dbms.database.restart('neo4j');