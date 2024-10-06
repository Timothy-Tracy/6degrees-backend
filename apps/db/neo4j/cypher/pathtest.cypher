MATCH (sn:SHARENODE)-[:PARENT_USER]->(u:USER {username:'christianfernandeztest'})

MATCH (p:POST {query:'the-source-post'})

MATCH PATH = (sn)-[:EDGE*]-(p)

return PATH