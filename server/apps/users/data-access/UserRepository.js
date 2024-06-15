const fs = require("fs");
const requests = require("./users.json");
const neo4j = require('neo4j-driver');
require('dotenv').config()
const{
    DB_URL,
    DB_USERNAME,
    DB_PASSWORD,
    DB_DATABASE
} = process.env;
const driver = neo4j.driver(DB_URL, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD))
const session = driver.session({DB_DATABASE});

        async function createUser(req, res, next){
            
            fs.readFile(__dirname+"/users.json", 'utf8', function readFileCallback(err, data){
                if (err){
                    console.log(err);
                } else {
                obj = JSON.parse(data); //now it an object
                obj.push(res.user); //add some data
                json = JSON.stringify(obj); //convert it back to json
                fs.writeFile(__dirname+"/users.json", json, 'utf8', err => {
                    // Checking for errors 
                    if (err) throw err;
                    console.log('UserRepository: Created User Successfully')
                    res.status("201");
                    next()
                    // Success 
                    console.log("Done writing");
                    
                }); // write it back 
            }});
        }

        function fetchUserByUUID(UUUID){
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
                        } 
                    });
                    return obj;
                    
            }});
        }

    const findAll = async() =>{
        const result = await session.run('Match (u:USER) return u');
        return result.records.map(i=>i.get('u').properties);
    }
    
module.exports = {createUser, fetchUserByUUID, findAll};