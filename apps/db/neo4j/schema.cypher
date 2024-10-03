// Section 1: Create initial nodes and relationships
CREATE CONSTRAINT user_uuid_unique IF NOT EXISTS FOR (x:USER) REQUIRE x.uuid IS UNIQUE;
CREATE CONSTRAINT user_uuid_not_null IF NOT EXISTS FOR (x:USER) REQUIRE x.uuid IS NOT NULL;
CREATE INDEX user_uuid_index IF NOT EXISTS FOR (x:USER) ON (x.uuid);

CREATE CONSTRAINT sharenode_uuid_unique IF NOT EXISTS FOR (x:SHARENODE) REQUIRE x.uuid IS UNIQUE;
CREATE CONSTRAINT sharenode_uuid_not_null IF NOT EXISTS FOR (x:SHARENODE) REQUIRE x.uuid IS NOT NULL;
CREATE INDEX sharenode_uuid_index IF NOT EXISTS FOR (x:SHARENODE) ON (x.uuid);

CREATE CONSTRAINT post_uuid_unique IF NOT EXISTS FOR (x:POST) REQUIRE x.uuid IS UNIQUE;
CREATE CONSTRAINT post_uuid_not_null IF NOT EXISTS FOR (x:POST) REQUIRE x.uuid IS NOT NULL;
CREATE INDEX post_uuid_index IF NOT EXISTS FOR (x:POST) ON (x.uuid);

CREATE CONSTRAINT edge_uuid_unique IF NOT EXISTS FOR ()-[x:EDGE]->() REQUIRE x.uuid IS UNIQUE;
CREATE CONSTRAINT edge_uuid_not_null IF NOT EXISTS FOR ()-[x:EDGE]->() REQUIRE x.uuid IS NOT NULL;
CREATE INDEX edge_uuid_index IF NOT EXISTS FOR ()-[x:EDGE]->() ON (x.uuid);

CREATE CONSTRAINT parent_user_uuid_unique IF NOT EXISTS FOR ()-[x:PARENT_USER]->() REQUIRE x.uuid IS UNIQUE;
CREATE CONSTRAINT parent_user_not_null IF NOT EXISTS FOR ()-[x:PARENT_USER]->() REQUIRE x.uuid IS NOT NULL;
CREATE INDEX parent_user_uuid_index IF NOT EXISTS FOR ()-[x:PARENT_USER]->() ON (x.uuid);
// Section 2: USER constraints
CREATE CONSTRAINT user_email_unique IF NOT EXISTS FOR (u:USER) REQUIRE u.email IS UNIQUE;
CREATE CONSTRAINT user_username_unique IF NOT EXISTS FOR (u:USER) REQUIRE u.username IS UNIQUE;

CREATE CONSTRAINT user_email_not_null IF NOT EXISTS FOR (u:USER) REQUIRE u.email IS NOT NULL;
CREATE CONSTRAINT user_username_not_null IF NOT EXISTS FOR (u:USER) REQUIRE u.username IS NOT NULL;

// Section 3: POST constraints
CREATE CONSTRAINT post_query_unique IF NOT EXISTS FOR (p:POST) REQUIRE p.query IS UNIQUE;
CREATE CONSTRAINT post_title_not_null IF NOT EXISTS FOR (p:POST) REQUIRE p.title IS NOT NULL;
CREATE CONSTRAINT post_body_not_null IF NOT EXISTS FOR (p:POST) REQUIRE p.body IS NOT NULL;

// Section 4: SHARENODE constraints
// Create a uniqueness constraint on PARENT_USER relationship

// Section 5: EDGE constraints
CREATE CONSTRAINT edge_degree_not_null IF NOT EXISTS FOR ()-[e:EDGE]->() REQUIRE e.degree IS NOT NULL;

// Section 6: Indexes for performance (optional but recommended)
CREATE INDEX user_email_index IF NOT EXISTS FOR (u:USER) ON (u.email);
CREATE INDEX user_username_index IF NOT EXISTS FOR (u:USER) ON (u.username);
CREATE INDEX post_title_index IF NOT EXISTS FOR (p:POST) ON (p.title);


