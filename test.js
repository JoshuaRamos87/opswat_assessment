//prompt user input for the name of file
"use strict";
const ps = require("prompt-sync")
const prompt = ps();
var name = prompt("upload_file ");


if(process.argv[2] === undefined)
{
    console.log("ERROR: Missing API key command line arguement")
    console.log("Correct usage: \"npm start <APIKEY>\"")
    process.exit(1)
}

function calcSHA256(hashLookUp)
{
    //retrieve the sha256 of the file in files directory
    let fs = require('fs');
    let crypto = require('crypto');
    let fd = fs.createReadStream(name);
    let hash = crypto.createHash('sha256');
    hash.setEncoding('hex');

    fd.on('end', function() {
        hash.end()
        hashLookUp(hash);
    });
// read all file and pipe it (write it) to the hash object
    fd.pipe(hash);
}
function hashLookUp(hashVal)
{
    var http = require("https");
    var options = {
        "method": "GET",
        "hostname": "api.metadefender.com",
        "path": '/v4/hash/',
        "headers": 
        {
            "apikey": process.argv[2]
        }
    };
    options["path"] += hashVal.read().toString().toUpperCase()

    var req = http.request(options, function (res) {
    var chunks = [];
    
    res.on("data", function (chunk) {
        chunks.push(chunk);
    });
    
    res.on("end", function () {
            var body = Buffer.concat(chunks);
            console.log(body.toString());

            var jsonObject = JSON.parse(body.toString())
            
            //checks if error exists in the object which implies the hash lookup was not found
            if('error' in jsonObject)  
            {
                //upload file
                console.log("ERROR: Not found in the metadefender database")
            }
            else
            {
                //immediately display results
                display_results(jsonObject)
                console.log("SUCCESS: Found in the metadefender database")
            }      
        });
    });

    req.end();
}
function display_results(scan_result)
{

    let overall_status = "Clean";
    Object.keys(scan_result["scan_results"]["scan_details"]).forEach(function(key) 
    {
        if(scan_result["scan_results"]["scan_details"][key]["threat_found"] !== "")
            overall_status = "MalwareFound"
    })

    console.log(`filename: insert_filename_here`)
    console.log(`overall_status: ${overall_status}`)

    Object.keys(scan_result["scan_results"]["scan_details"]).forEach(function(key) 
    {

        console.log(`engine: ${key}`)
        if(scan_result["scan_results"]["scan_details"][key]["threat_found"] === "")
            console.log(`threat_found: ${"Clean"}`)
        else
            console.log(`threat_found: ${"threat_found"}`)

        console.log(`scan_result: ${scan_result["scan_results"]["scan_details"][key]["scan_result_i"]}`)
        console.log("def_time: " + scan_result["scan_results"]["scan_details"][key]["def_time"])
      
      });

      console.log("END")


}

calcSHA256(hashLookUp)