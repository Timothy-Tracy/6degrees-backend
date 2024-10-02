// Section 1: Create initial nodes and relationships

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
