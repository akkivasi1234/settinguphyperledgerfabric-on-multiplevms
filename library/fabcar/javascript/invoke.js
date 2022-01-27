/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

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

        const network1=await gateway.getNetwork('channel1');

        // Get the contract from the network.
        const institute = network.getContract('institute');
        const library = network1.getContract('library');

        const users=[
            {
                rollno: '1A',
                designation: 'Student',
                department: 'ECE',
            },{
                rollno: '1B',
                designation: 'Teacher',
                department: 'CSE',
            },{
                rollno:'1C',
                designation: 'Teacher',
                department: 'ME',
            },
        ];
        const files=[
            {
                filename: 'File1',
                filetype: 'Journal Paper',
                sensitivity: 3,
            },
            {
                filename: 'File2',
                filetype: 'Conference Paper',
                sensitivity: 2,
            },
            {
                filename: 'File3',
                filetype: 'E-Book',
                sensitivity: 1,
            },
        ];

        const rules=[
            {
                designation: 'Student',
                department: 'ECE',
                operation: 'read',
                filetype: 'Journal Paper',
                sensitivity: 2,
            },
            {
                designation: 'Student',
                department: 'ECE',
                operation: 'read',
                filetype: 'Conference Paper',
                sensitivity: 2,
            },
            {
                designation: 'Student',
                department: 'ECE',
                operation: 'read',
                filetype: 'E-Book',
                sensitivity: 2,
            },
            {
                designation: 'Teacher',
                department: 'CSE',
                operation: 'read',
                filetype: 'Journal Paper',
                sensitivity: 3,
            },
            {
                designation: 'Teacher',
                department: 'CSE',
                operation: 'read',
                filetype: 'Conference Paper',
                sensitivity: 3,
            },
            {
                designation: 'Teacher',
                department: 'CSE',
                operation: 'read',
                filetype: 'E-Book',
                sensitivity: 3,
            },
        ];

        for(let i=0;i<users.length;i++){
            await institute.submitTransaction('addUser', users[i].rollno, users[i].designation, users[i].department);
            console.log(users[i].rollno+' has been added');
        }
        for(let i=0;i<files.length;i++){
            await library.submitTransaction('addFile', files[i].filename, files[i].filetype, files[i].sensitivity);
            console.log(files[i].filename+' has been added');
        }
        for(let i=0;i<rules.length;i++){
            await library.submitTransaction('addRule', 'Rule'+i, rules[i].designation, rules[i].department, rules[i].operation, rules[i].filetype, rules[i].sensitivity);
            console.log('Rule'+i+' has been added');
        }
        // Disconnect from the gateway.
        await gateway.disconnect();
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();