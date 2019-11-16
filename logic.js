const BigNumber = require('bignumber.js');

const util = require('./util');

module.exports = class Logic {
    aeternity;
    

    constructor(aeternity, verifyConstants = null) {
        this.verifyConstants = verifyConstants;
       
        this.aeternity = aeternity;
    }

    

    addressTransactions = async (address,minBlockHeight) => {
        return this.aeternity.addressTransactions(address,minBlockHeight);
    };   
};
