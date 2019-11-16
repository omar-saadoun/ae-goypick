 
const mdwUrl = 'https://testnet.mdw.aepps.com'

const fs = require('fs');
const Universal = require('@aeternity/aepp-sdk').Universal;
const BigNumber = require('bignumber.js');
const axios = require('axios');

const util = require("./util");
 

 module.exports = class Aeternity {
 
    client;
    buyers;
   

    init = async () => {
        if (!this.client) {
            this.client = await Universal({
                url: 'https://nodo.inmind.space',
                internalUrl: 'https://nodo.inmind.space',
                compilerUrl: 'https://compiler.inmind.space'
            });
            this.buyers=[];
            console.log("initialized aeternity sdk");
        }
    };

    callAndKeep(tx_hash,sender,amountSent) {
    console.log("call and keep");
      if (this.buyers.find(element=>element.tx_hash==tx_hash&&element.sender==sender)==null){
            this.buyers.push({sender,tx_hash,amountSent});
            console.log("registering payment from ",sender, " for ",amountSent, "at hash ", tx_hash);
        }else{
            console.log("already registered");
        }

   }

    addressTransactions = async (address,minBlockHeight) => {
        const txs= (await axios.get(`https://testnet.mdw.aepps.com/middleware/transactions/account/${address}?limit=30`)
                                .then(res=>res.data
                                    .filter(curtx=>curtx.tx.type=="SpendTx")
                                    .filter(curtx=>curtx.block_height>=minBlockHeight)
                                    .map(curtx=>this.callAndKeep(curtx.hash,curtx.tx.sender_id,curtx.tx.amount))));
        return txs;
    };

    goypicksale = async (sender,amount) => {
        const txs= (await axios.post(`http://52.117.30.244:8080/GoyPickVentas/servoy-service/rest_ws/GoyPickVentas/aeternity`,
                    {sender_id: sender, payed_amount: amount}));
                    console.log(txs);
        return txs;
    };
  
    
};