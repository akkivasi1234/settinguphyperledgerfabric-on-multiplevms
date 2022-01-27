const express=require("express");
const bodyParser=require("body-parser");
const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const app=express();
const jsonparser=bodyParser.json();
const urlencodedparser=bodyParser.urlencoded({extended:false});
app.use(bodyParser.urlencoded({ extended: false }));
console.log(__dirname);
app.use(express.static(__dirname));

var i=0;
app.post("/user",urlencodedparser,(req,res)=>{
    async function main() {
        try {
            // load the network configuration
            const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
            let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    
            // Create a new file system based wallet for managing identities.
            const walletPath = path.join(process.cwd(), 'wallet');
            const wallet = await Wallets.newFileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);
    
            // Check to see if we've already enrolled the user.
            const identity = await wallet.get('appUser');
            if (!identity) {
                console.log('An identity for the user "appUser" does not exist in the wallet');
                console.log('Run the registerUser.js application before retrying');
                return;
            }
    
            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });
    
            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork('mychannel');
            // Get the contract from the network.
            const institute = network.getContract('institute');
            await institute.submitTransaction('addUser', req.body.rollno, req.body.designation, req.body.department);
            console.log(req.body.rollno+' has been added');
            await gateway.disconnect();
        } catch (error) {
            console.error(`Failed to submit transaction: ${error}`);
            process.exit(1);
        }
    }
    main();
    console.log(req.body);
    res.redirect("/");
});

app.post("/invoke",jsonparser,(req,res)=>{
    console.log(req.body);
    async function main() {
        try {
            // load the network configuration
            const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
            const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

            // Create a new file system based wallet for managing identities.
            const walletPath = path.join(process.cwd(), 'wallet');
            const wallet = await Wallets.newFileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);

            // Check to see if we've already enrolled the user.
            const identity = await wallet.get('appUser');
            if (!identity) {
                console.log('An identity for the user "appUser" does not exist in the wallet');
                console.log('Run the registerUser.js application before retrying');
                return;
            }

            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork('mychannel');

            // Get the contract from the network.
            const institute = network.getContract('institute');
            let result = await institute.evaluateTransaction('invoke', req.body.rollno);
            result=result.toString('utf-8');
            // result=JSON.parse(result);
            res.send(result);
            // res.redirect("/");
            // Disconnect from the gateway.
            await gateway.disconnect();
            
        } catch (error) {
            console.error(`Failed to evaluate transaction: ${error}`);
            process.exit(1);
        }
    }
    main();
});
app.listen(8000,()=>{
    console.log("listening the port at 8000");
});