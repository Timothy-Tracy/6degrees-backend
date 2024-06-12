const fs = require("fs");
const requests = require("./users.json");

        function createUser(user){
            
            fs.readFile(__dirname+"/users.json", 'utf8', function readFileCallback(err, data){
                if (err){
                    console.log(err);
                } else {
                obj = JSON.parse(data); //now it an object
                obj.push(user); //add some data
                json = JSON.stringify(obj); //convert it back to json
                fs.writeFile(__dirname+"/users.json", json, 'utf8', err => {
                    // Checking for errors 
                    if (err) throw err;
            
                    // Success 
                    console.log("Done writing");
                }); // write it back 
            }});
        }

        async function fetchUserByUUID(UUUID, callback){
            fs.readFile(__dirname+"/users.json", 'utf8', function readFileCallback(err, data){
                if (err){
                    console.log(err);
                } else {
                obj = JSON.parse(data); //now it an object
                
                    let userObj = null
                    obj.forEach(user => {
                        console.log(`Testing if  ${user.USER_UUID} is ${UUUID}`);
                        if(user.USER_UUID == UUUID){
                            userObj = user;
                            console.log('user found')
                            console.log(JSON.stringify(userObj))
                        } 
                    });
                    if(userObj == null) throw new Error("User Not Found");
                    callback(JSON.stringify(userObj))
                    return Promise.resolve(JSON.stringify(userObj)
                    )
                
                
                

                
            }});
        }
    
module.exports = {createUser, fetchUserByUUID};