# README
This is a script to get statistics on the coin in the [Minter network](https://www.minter.network/). 

Before running the script, you must have a Node.js 8+ installed and install the dependencies:
```
npm install
```

⚠️ To run the script, you must specify the Minter network node address in the MINTER_API_URL environment variable. 

To check the work of the script you can use one of the public nodes, for example - [https://api.minter.stakeholder.space](https://api.minter.stakeholder.space/), but for efficient work of the script it is better to set up your own node and use it locally or in a private network.

Default value for MINTER_API_URL - http://localhost:8841

## Examples of commands to run

Processes the latest data from the Minter network blocks (the first time you start up, it may take several hours if you use a local node):
```
MINTER_API_URL=http://localhost:8841 COIN=TIME node index.js
```
 
Displays the daily coin statistics to the console:
```
COIN=TIME node index.js daily
```


Displays the monthly coin statistics to the console:
```
COIN=TIME node index.js monthly
```
