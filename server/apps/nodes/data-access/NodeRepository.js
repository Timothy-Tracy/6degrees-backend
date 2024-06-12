const fs = require("fs");
const nodes = require("./nodes.json");


        function createNode(node){
            fs.readFile(__dirname+"/nodes.json", 'utf8', function readFileCallback(err, data){
                if (err){
                    console.log(err);
                } else {
                obj = JSON.parse(data); //now it an object
                obj.push(node); //add some data
                json = JSON.stringify(obj); //convert it back to json
                fs.writeFile(__dirname+"/nodes.json", json, 'utf8', err => {
                    // Checking for errors 
                    if (err) throw err;
            
                    // Success 
                    console.log("Done writing");
                }); // write it back 
            }});
        }
        
    
module.exports = {createNode};
