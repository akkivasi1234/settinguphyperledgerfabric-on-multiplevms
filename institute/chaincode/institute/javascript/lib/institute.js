/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class Institute extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        console.info('============= END : Initialize Ledger ===========');
    }

    async addUser(ctx, rollno, designation, department) {
        console.info('============= START : Create User ===========');

        const user = {
            docType: 'user',
            designation,
            department,
        };

        await ctx.stub.putState(rollno, Buffer.from(JSON.stringify(user)));
        console.info('============= END : Create User ===========');
    }

    async invoke(ctx,rollno){
        console.info('=========== START : Get User Attributes with given rollno ==========')
        const userAsBytes = await ctx.stub.getState(rollno);
        if(!userAsBytes||userAsBytes.length==0){
            throw new  Error(`${rollno} does not exist`);
        }
        return userAsBytes.toString();
        console.info('=========== END : Get User Attributes with given rollno ==========')
    }
    async modifyUser(ctx, rollno, newdesignation, newdepartment){
        console.info('============= START : Modify User ===========');
        const userAsBytes = await ctx.stub.getState(rollno);
        if(!userAsBytes||userAsBytes.length==0){
            throw new Error(`${rollno} does not exist`);
        }
        const user = JSON.parse(userAsBytes.toString());
        user.designation = newdesignation;
        user.department = newdepartment;
        await ctx.stub.putState(rollno, Buffer.from(JSON.stringify(user)));
        console.info('============= END : Modify User ===========');
    }

}

module.exports.Institute = Institute;

