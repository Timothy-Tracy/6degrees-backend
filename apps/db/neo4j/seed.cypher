CREATE (u:USER {username:"timothytracytest", email:"timothydtracytest@gmail.com"})
CREATE (sn:SHARENODE)
CREATE (sn)-[:PARENT_USER ]->(u)
CREATE (u2:USER { username:"leiarumphtest", email:"leiarumphtest@gmail.com"})
CREATE (sn2:SHARENODE )
CREATE (sn2)-[:PARENT_USER ]->(u2)
CREATE (u3:USER { username:"michaelharristest", email:"michaelharristest@gmail.com"})
CREATE (sn3:SHARENODE )
CREATE (sn3)-[:PARENT_USER ]->(u3)
CREATE (u4:USER { username:"eduardofrancotest", email:"eduardofrancotest@gmail.com"})
CREATE (sn4:SHARENODE )
CREATE (sn4)-[:PARENT_USER ]->(u4)
CREATE (u5:USER { username:"daynejohnsontest", email:"daynejohnsontest@gmail.com"})
CREATE (sn5:SHARENODE )
CREATE (sn5)-[:PARENT_USER ]->(u5)
CREATE (u6:USER { username:"christianfernandeztest", email:"christianfernandeztest@gmail.com"})
CREATE (sn6:SHARENODE)
CREATE (sn6)-[:PARENT_USER ]->(u6)

CREATE (p:POST { title:"source", body:"This is the source post", query:"the-source-post"})

WITH sn, sn2, sn3, sn4, sn5, sn6, u, u2, u3, u4, u5, u6
MATCH(p:POST)
CREATE (p)-[:NEXT {post_uuid:p.uuid, degree: 0}]->(sn)

CREATE (sn)-[:NEXT {post_uuid:p.uuid, degree: 0}]->(sn2)
CREATE (sn)-[:NEXT {post_uuid:p.uuid, degree: 1}]->(sn3)

CREATE (sn2)-[:NEXT {post_uuid:p.uuid, degree: 2}]->(sn4)
CREATE (sn2)-[:NEXT {post_uuid:p.uuid, degree: 2}]->(sn5)

CREATE (sn3)-[:NEXT {post_uuid:p.uuid, degree: 3}]->(sn6);

MATCH(p:POST)
MATCH ()-[n:NEXT]-()
SET n.post_UUID = p.uuid