CREATE (u:USER {username:"timothytracytest", email:"timothydtracytest@gmail.com"})
CREATE (sn:SHARENODE)
CREATE (sn)-[:PARENT_USER]->(u)
CREATE (u2:USER {username:"leiarumphtest", email:"leiarumphtest@gmail.com"})
CREATE (sn2:SHARENODE)
CREATE (sn2)-[:PARENT_USER]->(u2)
CREATE (u3:USER {username:"michaelharristest", email:"michaelharristest@gmail.com"})
CREATE (sn3:SHARENODE)
CREATE (sn3)-[:PARENT_USER]->(u3)
CREATE (u4:USER {username:"eduardofrancotest", email:"eduardofrancotest@gmail.com"})
CREATE (sn4:SHARENODE)
CREATE (sn4)-[:PARENT_USER]->(u4)
CREATE (u5:USER {username:"daynejohnsontest", email:"daynejohnsontest@gmail.com"})
CREATE (sn5:SHARENODE)
CREATE (sn5)-[:PARENT_USER]->(u5)
CREATE (u6:USER {username:"christianfernandeztest", email:"christianfernandeztest@gmail.com"})
CREATE (sn6:SHARENODE)
CREATE (sn6)-[:PARENT_USER]->(u6)

CREATE (p:POST {title:"source", body:"This is the source post", query:"the-source-post"})

CREATE (p)-[:EDGE {degree: 0}]->(sn)

CREATE (sn)-[:EDGE {degree: 1}]->(sn2)
CREATE (sn)-[:EDGE {degree: 1}]->(sn3)

CREATE (sn2)-[:EDGE {degree: 2}]->(sn4)
CREATE (sn2)-[:EDGE {degree: 2}]->(sn5)

CREATE (sn3)-[:EDGE {degree: 2}]->(sn6);