const fs = require("fs");
const requests = require("./requests.json");

        function createRequest(request){
            
            fs.readFile(__dirname+"/requests.json", 'utf8', function readFileCallback(err, data){
                if (err){
                    console.log(err);
                } else {
                obj = JSON.parse(data); //now it an object
                obj.push(request); //add some data
                json = JSON.stringify(obj); //convert it back to json
                fs.writeFile(__dirname+"/requests.json", json, 'utf8', err => {
                    // Checking for errors 
                    if (err) throw err;
            
                    // Success 
                    console.log("Done writing");
                }); // write it back 
            }});
        }
    
module.exports = {createRequest};
