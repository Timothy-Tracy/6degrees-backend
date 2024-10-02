// Neo4j Complete Database Reset Script
// WARNING: This script will delete ALL data, constraints, and indexes in the database.
// Make sure you have a backup before running this script.

ats();

// Step 2: Drop all constraints
CALL apoc.schema.assert({}, {});

// Step 3: Drop all indexes
CALL apoc.schema.assert({},{}, true);


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
RETURN "Database reset constraints, and indexes have been removed." AS message;

// Note: To clear server-side caches, you may need to restart the database.
// This requires admin privileges and typically isn't necessary for most use cases.
// If needed, you can use: CALL dbms.database.restart('neo4j');