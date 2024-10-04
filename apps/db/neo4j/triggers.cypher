:use system;
// Trigger for setting timestamps on new nodes
CALL apoc.trigger.install(
  'neo4j',
  'set_node_timestamps',
  'UNWIND $createdNodes AS n
   SET n.createdAt = datetime(), n.updatedAt = datetime()',
  {}
);

// Trigger for setting timestamps on new relationships
CALL apoc.trigger.install(
  'neo4j',
  'set_rel_timestamps',
  'UNWIND $createdRelationships AS r
   SET r.createdAt = datetime(), r.updatedAt = datetime()',
  {}
);

// Trigger for updating timestamps on modified nodes
CALL apoc.trigger.install(
  'neo4j',
  'update_node_timestamps',
  'UNWIND $assignedNodeProperties AS prop
   WITH prop.node AS n
   SET n.updatedAt = datetime()',
  {}
);

// Trigger for updating timestamps on modified relationships
CALL apoc.trigger.install(
  'neo4j',
  'update_rel_timestamps',
  'UNWIND $assignedRelationshipProperties AS prop
   WITH prop.relationship AS r
   SET r.updatedAt = datetime()',
  {}
);

// Trigger for adding UUIDs to nodes
CALL apoc.trigger.install(
  'neo4j',
  'add_uuid_to_nodes',
  'unwind $createdNodes as ns
    set ns.uuid = CASE WHEN ns.uuid IS NULL THEN randomUUID() ELSE ns.uuid END

  ',
  {}
);

// Trigger for adding UUIDs to relationships
CALL apoc.trigger.install(
  'neo4j',
  'add_uuid_to_relationships',
  'unwind $createdRelationships as ns
    set ns.uuid = CASE WHEN ns.uuid IS NULL THEN randomUUID() ELSE ns.uuid END
',
  {}
);