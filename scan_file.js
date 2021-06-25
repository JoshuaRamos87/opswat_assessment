//prompt user input for the name of file
"use strict";
const ps = require("prompt-sync")
let http = require("https");
let fs = require('fs');
const prompt = ps();
let fileName = prompt("upload_file ");

//checks if file exists in current directory
if(!fs.existsSync(fileName))
{
    console.log(`The ${fileName} file doesnt exist`)
    process.exit()
}

//APIKEY is require to be the second arguement after npm start
if(process.argv[2] === undefined)
{
    console.log("ERROR: Missing API key command line arguement")
    console.log("Correct usage: \"npm start <APIKEY>\"")
    process.exit()
}

//caclulates the hash of the file and looks up if the file is found at metadefender.opswat.com
function calcSHA256(hashLookUp)
{
    //retrieve the sha256 of the file in files directory
    let crypto = require('crypto');
    let fd = fs.createReadStream(fileName);
    let hash = crypto.createHash('sha256');
    hash.setEncoding('hex');

    fd.on('end', function() {
        hash.end()
        hashLookUp(hash);
    });
    // read all file and pipe it (write it) to the hash object
    fd.pipe(hash);
}

//looks up the hash of the file against metadefender.opswat.com
function hashLookUp(hashVal)
{
    //http request information
    let options = {
        "method": "GET",
        "hostname": "api.metadefender.com",
        "path": '/v4/hash/',
        "headers": 
        {
            "apikey": process.argv[2]
        }
    };
    options["path"] += hashVal.read().toString().toUpperCase()

    let req = http.request(options, function (res) {
    let chunks = [];
    
    res.on("data", function (chunk) {
        chunks.push(chunk);
    });
    
    res.on("end", function () {
            let body = Buffer.concat(chunks);
            //console.log(body.toString());

            let jsonObject = JSON.parse(body.toString())
            
            //checks if error exists in the object which implies the hash lookup was not found
            if(jsonObject['stored'] !== true)  
            {
                //upload file
                console.log("Not found in MetaDefender Cloud, now uploading file")
                uploadFile(fileName)
            }
            //immediately displays results
            else 
            {
                display_results(jsonObject)
            }      
        });
    });

    req.end();
}

//displays the scan results of a file from metadefender.opswat.com
function display_results(scan_result)
{

    let overall_status = "Clean";

    //determines the overall status if malware was found
    Object.keys(scan_result["scan_results"]["scan_details"]).forEach(function(key) 
    {
        if(scan_result["scan_results"]["scan_details"][key]["threat_found"] !== "")
            overall_status = "MalwareFound"
    })

    console.log(`filename: ${fileName}`)
    console.log(`overall_status: ${overall_status}`)

    //loops through all engines and finds each engine scans information on file
    Object.keys(scan_result["scan_results"]["scan_details"]).forEach(function(key) 
    {
        console.log(`engine: ${key}`)

        if(scan_result["scan_results"]["scan_details"][key]["threat_found"] === "")
            console.log(`threat_found: ${"Clean"}`)
        else
            console.log(`threat_found: ${scan_result["scan_results"]["scan_details"][key]["threat_found"]}`)

        console.log(`scan_result: ${scan_result["scan_results"]["scan_details"][key]["scan_result_i"]}`)
        console.log(`def_time: ${scan_result["scan_results"]["scan_details"][key]["def_time"]}`)
      
      });

      console.log("END")


}

function uploadFile(fileName)
{
    let scan_percent;
    let scan_result;

    //accepts a files dataid that was sents after upload and retrieves the scan result
    async function scan_dataID(dataID)
    {
        //http request information
        let options = {
        "method": "GET",
        "hostname": "api.metadefender.com",
        "path": "/v4/file/",
        "headers": {
            "apikey": process.argv[2]
        }
        };
        
        options["path"] += dataID

        let req = http.request(options, async function (res) {
        let chunks = [];
        res.on("data", function (chunk) {
            chunks.push(chunk);
        });
        res.on("end", function () {
                let body = Buffer.concat(chunks);
                scan_percent = JSON.parse(body.toString())['scan_results']['progress_percentage']
                scan_result = body.toString()
        })


        });
        
        req.end();
    }
    //http request information
    let options = {
      "method": "POST",
      "hostname": "api.metadefender.com",
      "path": "/v4/file",
      "headers": {
        "content-type": "application/octet-stream; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW",
        "apikey": process.argv[2],
        "Content-Type": "application/octet-stream"
      }
    };

    let req = http.request(options, function (res) {
      let chunks = [];
    
      res.on("data", function (chunk) {
        chunks.push(chunk);
      });
    
      //after scan has finished at metadefender.opswat.com, the scan results are displayed 
      res.on("end", async function () {
        let body = Buffer.concat(chunks);
        let jsonObject = JSON.parse(body.toString())

        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
          }

        scan_dataID(jsonObject["data_id"])

        while(scan_percent != 100)
        {
            await sleep(100)
            scan_dataID(jsonObject["data_id"])
        }
        //displays scan results
        display_results(JSON.parse(scan_result))
      });
    });


    //read files in current directory and writes file to api.metadefender.com/v4/file endpoint
    let buffer = fs.readFileSync(fileName);
    req.write(buffer)
    req.end();

  }

calcSHA256(hashLookUp)