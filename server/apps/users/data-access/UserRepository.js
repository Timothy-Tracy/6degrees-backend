const fs = require("fs");
const users = require("../users.json");

function createUser(request){
    users.push(user);

    fs.writeFile(
        "users.json",
        JSON.stringify(users),
        err => {
            // Checking for errors 
            if (err) throw err;
    
            // Success 
            console.log("Done writing");
        }); 
}