# opswat_assessment
Simple program to scan a file against the metadefender.opswat.com API.
OPSWAT MetaDefender Cloud API key is required.
You will need to register for a free account at portal.opswat.com. This will create an account and generate
a trial apikey for metadefender.opswat.com. The apikey should be displayed on the "Home" tab once you login
to your portal account. Please note this apikey has rate limiting which you may encounter, this is normal.
_____________________________________

## How to get started

The following are instructions to get the program running

### Requirements:

Latest version of Node was used for this, v14.17.0

## Installation of dependencies

```
npm install
```

## Example of running program

```
npm start <APIKEY>
```
Then key in the name of file including file extension to scan a file against our metadefender.opswat.com API