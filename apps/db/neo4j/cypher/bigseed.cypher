// Create 25 users and sharenodes
CREATE (u1:USER {username:"user1", email:"user1@example.com"})
CREATE (sn1:SHARENODE {anon: false})
CREATE (sn1)-[:PARENT_USER]->(u1)
CREATE (u2:USER {username:"user2", email:"user2@example.com"})
CREATE (sn2:SHARENODE {anon: false})
CREATE (sn2)-[:PARENT_USER]->(u2)
CREATE (u3:USER {username:"user3", email:"user3@example.com"})
CREATE (sn3:SHARENODE {anon: false})
CREATE (sn3)-[:PARENT_USER]->(u3)
CREATE (u4:USER {username:"user4", email:"user4@example.com"})
CREATE (sn4:SHARENODE {anon: false})
CREATE (sn4)-[:PARENT_USER]->(u4)
CREATE (u5:USER {username:"user5", email:"user5@example.com"})
CREATE (sn5:SHARENODE {anon: false})
CREATE (sn5)-[:PARENT_USER]->(u5)
CREATE (u6:USER {username:"user6", email:"user6@example.com"})
CREATE (sn6:SHARENODE {anon: false})
CREATE (sn6)-[:PARENT_USER]->(u6)
CREATE (u7:USER {username:"user7", email:"user7@example.com"})
CREATE (sn7:SHARENODE {anon: false})
CREATE (sn7)-[:PARENT_USER]->(u7)
CREATE (u8:USER {username:"user8", email:"user8@example.com"})
CREATE (sn8:SHARENODE {anon: false})
CREATE (sn8)-[:PARENT_USER]->(u8)
CREATE (u9:USER {username:"user9", email:"user9@example.com"})
CREATE (sn9:SHARENODE {anon: false})
CREATE (sn9)-[:PARENT_USER]->(u9)
CREATE (u10:USER {username:"user10", email:"user10@example.com"})
CREATE (sn10:SHARENODE {anon: false})
CREATE (sn10)-[:PARENT_USER]->(u10)
CREATE (u11:USER {username:"user11", email:"user11@example.com"})
CREATE (sn11:SHARENODE {anon: false})
CREATE (sn11)-[:PARENT_USER]->(u11)
CREATE (u12:USER {username:"user12", email:"user12@example.com"})
CREATE (sn12:SHARENODE {anon: false})
CREATE (sn12)-[:PARENT_USER]->(u12)
CREATE (u13:USER {username:"user13", email:"user13@example.com"})
CREATE (sn13:SHARENODE {anon: false})
CREATE (sn13)-[:PARENT_USER]->(u13)
CREATE (u14:USER {username:"user14", email:"user14@example.com"})
CREATE (sn14:SHARENODE {anon: false})
CREATE (sn14)-[:PARENT_USER]->(u14)
CREATE (u15:USER {username:"user15", email:"user15@example.com"})
CREATE (sn15:SHARENODE {anon: false})
CREATE (sn15)-[:PARENT_USER]->(u15)
CREATE (u16:USER {username:"user16", email:"user16@example.com"})
CREATE (sn16:SHARENODE {anon: false})
CREATE (sn16)-[:PARENT_USER]->(u16)
CREATE (u17:USER {username:"user17", email:"user17@example.com"})
CREATE (sn17:SHARENODE {anon: false})
CREATE (sn17)-[:PARENT_USER]->(u17)
CREATE (u18:USER {username:"user18", email:"user18@example.com"})
CREATE (sn18:SHARENODE {anon: false})
CREATE (sn18)-[:PARENT_USER]->(u18)
CREATE (u19:USER {username:"user19", email:"user19@example.com"})
CREATE (sn19:SHARENODE {anon: false})
CREATE (sn19)-[:PARENT_USER]->(u19)
CREATE (u20:USER {username:"user20", email:"user20@example.com"})
CREATE (sn20:SHARENODE {anon: false})
CREATE (sn20)-[:PARENT_USER]->(u20)
CREATE (u21:USER {username:"user21", email:"user21@example.com"})
CREATE (sn21:SHARENODE {anon: false})
CREATE (sn21)-[:PARENT_USER]->(u21)
CREATE (u22:USER {username:"user22", email:"user22@example.com"})
CREATE (sn22:SHARENODE {anon: false})
CREATE (sn22)-[:PARENT_USER]->(u22)
CREATE (u23:USER {username:"user23", email:"user23@example.com"})
CREATE (sn23:SHARENODE {anon: false})
CREATE (sn23)-[:PARENT_USER]->(u23)
CREATE (u24:USER {username:"user24", email:"user24@example.com"})
CREATE (sn24:SHARENODE {anon: false})
CREATE (sn24)-[:PARENT_USER]->(u24)
CREATE (u25:USER {username:"user25", email:"user25@example.com"})
CREATE (sn25:SHARENODE {anon: false})
CREATE (sn25)-[:PARENT_USER]->(u25)

// Create the source post
CREATE (p:POST {title:"source", body:"This is the source post", query:"the-source-post"})
CREATE (p)-[:PARENT_USER]->(u1)

// Create NEXT relationships
WITH sn1, sn2, sn3, sn4, sn5, sn6, sn7, sn8, sn9, sn10, sn11, sn12, sn13, sn14, sn15, sn16, sn17, sn18, sn19, sn20, sn21, sn22, sn23, sn24, sn25
MATCH (p:POST)
CREATE (p)-[:NEXT {post_uuid: p.uuid, degree: 0, method: 'default'}]->(sn1)
CREATE (sn1)-[:NEXT {post_uuid: p.uuid, degree: 1, method: 'default'}]->(sn2)
CREATE (sn1)-[:NEXT {post_uuid: p.uuid, degree: 1, method: 'default'}]->(sn3)
CREATE (sn2)-[:NEXT {post_uuid: p.uuid, degree: 2, method: 'default'}]->(sn4)
CREATE (sn2)-[:NEXT {post_uuid: p.uuid, degree: 2, method: 'default'}]->(sn5)
CREATE (sn3)-[:NEXT {post_uuid: p.uuid, degree: 2, method: 'default'}]->(sn6)
CREATE (sn3)-[:NEXT {post_uuid: p.uuid, degree: 2, method: 'default'}]->(sn7)
CREATE (sn4)-[:NEXT {post_uuid: p.uuid, degree: 3, method: 'default'}]->(sn8)
CREATE (sn4)-[:NEXT {post_uuid: p.uuid, degree: 3, method: 'default'}]->(sn9)
CREATE (sn5)-[:NEXT {post_uuid: p.uuid, degree: 3, method: 'default'}]->(sn10)
CREATE (sn5)-[:NEXT {post_uuid: p.uuid, degree: 3, method: 'default'}]->(sn11)
CREATE (sn6)-[:NEXT {post_uuid: p.uuid, degree: 3, method: 'default'}]->(sn12)
CREATE (sn6)-[:NEXT {post_uuid: p.uuid, degree: 3, method: 'default'}]->(sn13)
CREATE (sn7)-[:NEXT {post_uuid: p.uuid, degree: 3, method: 'default'}]->(sn14)
CREATE (sn7)-[:NEXT {post_uuid: p.uuid, degree: 3, method: 'default'}]->(sn15)
CREATE (sn8)-[:NEXT {post_uuid: p.uuid, degree: 4, method: 'default'}]->(sn16)
CREATE (sn9)-[:NEXT {post_uuid: p.uuid, degree: 4, method: 'default'}]->(sn17)
CREATE (sn10)-[:NEXT {post_uuid: p.uuid, degree: 4, method: 'default'}]->(sn18)
CREATE (sn11)-[:NEXT {post_uuid: p.uuid, degree: 4, method: 'default'}]->(sn19)
CREATE (sn12)-[:NEXT {post_uuid: p.uuid, degree: 4, method: 'default'}]->(sn20)
CREATE (sn13)-[:NEXT {post_uuid: p.uuid, degree: 4, method: 'default'}]->(sn21)
CREATE (sn14)-[:NEXT {post_uuid: p.uuid, degree: 4, method: 'default'}]->(sn22)
CREATE (sn15)-[:NEXT {post_uuid: p.uuid, degree: 4, method: 'default'}]->(sn23)
CREATE (sn16)-[:NEXT {post_uuid: p.uuid, degree: 5, method: 'default'}]->(sn24)
CREATE (sn17)-[:NEXT {post_uuid: p.uuid, degree: 5, method: 'default'}]->(sn25);



// Set post_uuid for all NEXT relationships
MATCH(p:POST)
MATCH ()-[n:NEXT]-()
SET n.post_uuid = p.uuid