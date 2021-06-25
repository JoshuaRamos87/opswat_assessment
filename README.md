# opswat_assessment
Simple program to scan a file against the metadefender.opswat.com API.
OPSWAT MetaDefender Cloud API key is required.
You will need to register for a free account at portal.opswat.com. This will create an account and generate
a trial apikey for metadefender.opswat.com. The apikey should be displayed on the "Home" tab once you login
to your portal account. Please note this apikey has rate limiting which you may encounter, this is normal.

Created on a Windows machine with Node.js through PowerShell.
_____________________________________

## How to get started

The following are instructions to get the program running

### Requirements:

Latest version of Node.js was used for this, v14.17.0
Get it [here](https://nodejs.org/en/)

## Installation of dependencies

```
npm install
```

## Example of running program

```
npm start <APIKEY>
```
Then when prompted to upload a file, key in the name of file including the file extension, that is in the current directory. The file is now being scanned against the metadefender.opswat.com API

## Author
Joshua Ramos