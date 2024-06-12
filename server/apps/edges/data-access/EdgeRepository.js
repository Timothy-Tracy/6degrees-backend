const fs = require("fs");
const edges = require("../edges.json");

function createEdge(edge){
    edges.push(edge);

    fs.writeFile(
        "edges.json",
        JSON.stringify(edges),
        err => {
            // Checking for errors 
            if (err) throw err;
    
            // Success 
            console.log("Done writing");
        }); 
}