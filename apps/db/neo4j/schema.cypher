CREATE (:USER);
CREATE (:POST);
CREATE (:SHARENODE);
CREATE (:COMMENT);
CREATE ()-[:EDGE]-();

//USER

//UNIQUENESS AND EXISTENCE
CREATE CONSTRAINT ON (u:USER) ASSERT u.email IS NODE KEY;
CREATE CONSTRAINT ON (u:USER) ASSERT u.username IS NODE KEY;

//TYPE CHECKING
CREATE CONSTRAINT ON (u:USER) ASSERT u.email IS STRING;
CREATE CONSTRAINT ON (u:USER) ASSERT u.username IS STRING;
CREATE CONSTRAINT ON (u:USER) ASSERT u.bio IS STRING;

//TIMESTAMP
CREATE CONSTRAINT ON (u:USER) ASSERT u.createdAt IS TIMESTAMP DEFAULT datetime();
CREATE CONSTRAINT ON (u:USER) ASSERT u.updatedAt IS TIMESTAMP DEFAULT datetime();


//POST


//UNIQUENESS AND EXISTENCE
CREATE CONSTRAITN ON (p:POST) ASSERT p.query IS NODE KEY;
//Existance
CREATE CONSTRAINT ON (p:POST) ASSERT EXISTS(p.title);
CREATE CONSTRAINT ON (p:POST) ASSERT EXISTS(p.body);

//Type checking
CREATE CONSTRAINT ON (p:POST) ASSERT p.title IS STRING;
CREATE CONSTRAINT ON (p:POST) ASSERT p.body IS STRING;
CREATE CONSTRAINT ON (p:POST) ASSERT p.views IS INTEGER DEFAULT 0;
CREATE CONSTRAINT ON (p:POST) ASSERT p.visibility IS STRING DEFAULT "PUBLIC";

CREATE CONSTRAINT ON (p:POST) ASSERT p.createdAt IS TIMESTAMP DEFAULT datetime();


CREATE CONSTRAINT ON (c:COMMENT) ASSERT EXISTS(c.body);
CREATE CONSTRAINT ON (c:COMMENT) ASSERT c.body IS STRING;
CREATE CONSTRAINT ON (c:COMMENT) ASSERT c.visibility IS STRING DEFAULT "PUBLIC";
CREATE CONSTRAINT ON (c:COMMENT) ASSERT c.createdAt IS TIMESTAMP DEFAULT datetime();

//SHARENODE
CREATE CONSTRAINT FOR (sn:SHARENODE)-[r:PARENT_USER]->(u:USER) REQUIRE r IS UNIQUE;


//EDGE
CREATE CONSTRAINT ON ()-[e:EDGE]-() ASSERT EXISTS(e.degree);
CREATE CONSTRAINT ON ()-[e:EDGE]-() ASSERT e.degree IS INTEGER;

CREATE CONSTRAINT ON ()-[e:EDGE]-() ASSERT EXISTS(e.shares);
CREATE CONSTRAINT ON ()-[e:EDGE]-() ASSERT EXISTS(e.views);


//DEFAULTS
CREATE CONSTRAINT ON ()-[e:EDGE]-() ASSERT e.visibility IS STRING DEFAULT "PUBLIC";
CREATE CONSTRAINT ON ()-[e:EDGE]-() ASSERT e.views IS INTEGER DEFAULT 0;
CREATE CONSTRAINT ON ()-[e:EDGE]-() ASSERT e.shares IS INTEGER;

//TIMESTAMP
CREATE CONSTRAINT ON ()-[e:EDGE]-() ASSERT e.createdAt IS TIMESTAMP DEFAULT datetime();
CREATE CONSTRAINT ON ()-[e:EDGE]-() ASSERT e.updatedAt IS TIMESTAMP DEFAULT datetime();