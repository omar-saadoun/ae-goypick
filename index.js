const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const Aeternity = require("./aeternity");
const Logic =require("./logic");
 logic=null;
const WebSocketClient = require('websocket').client;
const app = express();

app.use(bodyParser.json());
process.on('unhandledRejection', (reason, p) => console.log('Unhandled Rejection at: Promise', p, 'reason:', reason));

const cache = {};
cache.wsconnection = null;

cache.shortCacheTime = process.env.SHORT_CACHE_TIME || 2 * 60;
cache.longCacheTime = process.env.LONG_CACHE_TIME || 8 * 60 * 60;
cache.keepHotInterval = process.env.KEEP_HOT_INTERVAL || 60 * 1000;



const init = async () => {
    console.log('Entra0');
    const aeternity = new Aeternity();
    logic=new Logic(aeternity);
    await aeternity.init();
    
    cache.startWSGoyPick(aeternity);
    
    app.listen(3000);
};

const errorHandler = (f) => {
    return (req, res, next) => {
        try {
            f(req, res, next);
        } catch (e) {
            next(e);
        }
    }
};

app.use(cors({
    origin: '*',
    optionsSuccessStatus: 200,
    methods: ['GET', 'OPTIONS']
}));

app.get('/transactions/:address', errorHandler(async (req, res) => {
    if (!req.params.address) return res.sendStatus(400);
    const address = req.params.address;

    const start = new Date().getTime();
    const data = await logic.addressTransactions(address, process.env.MIN_BLOCK);

    if (new Date().getTime() - start > 10) console.log("\nrequest address transactions", address, new Date().getTime() - start, "ms ", "min_height",process.env.MIN_BLOCK);
    res.json(data)
}));
 
app.get('/hello', errorHandler(async (req, res) => {
    console.log("\nrequest hello", new Date().getTime(), "ms");
    res.json('Hello')
}));
app.get('/envs', errorHandler(async (req, res) => {
    console.log("\nrequest hello" + process.env.NODE_URL + process.env.CONTRACT_ADDRESS, new Date().getTime(), "ms");
    res.json('Hello')
}));


 

cache.startWSGoyPick = (aeternity) => {
    console.log('Entra2');
    const wsclient = new WebSocketClient();
    wsclient.connect("ws://mdw.aepps.com:3020");
    wsclient.on('connectFailed', console.error);
    wsclient.on('connect', connection => {
        cache.wsconnection = connection;
        cache.wsconnection.send(JSON.stringify({
            op: "subscribe",
            payload: "object",
            target: "ak_2YpHG7BzPRWzB9oR4NiRZEqgj39UjbbokD89aobmnpjJEJNJXk" //TODO env variable
        }));
        cache.wsconnection.on('message', async message => {
            if (message.type === 'utf8' && message.utf8Data.includes("payload")) {
                const data = JSON.parse(message.utf8Data);
                if (data.subscription === "object") {
                    console.log(data.payload);
                    const payGoyPick = await aeternity.goypicksale(data.payload.tx.sender_id,data.payload.tx.amount);
                    console.log('Enviado');
                }
            }
        });
    });
};


init();