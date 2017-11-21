const express = require('express');
const swig = require('swig');
const path = require('path');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const session = require('express-session');
const redis   = require("redis");
const redisStore = require('connect-redis')(session);

const app = express();
app.use(helmet());

global.env = app.get('env');
global.__base = __dirname + '/';
global.db = require('./db');

let redisClient;
let redisOptions;
if(global.env == 'production'){
    redisClient  = redis.createClient(process.env.REDIS_URL);
    redisOptions = { client:redisClient };
} else{
    redisClient  = redis.createClient();
    redisOptions = { host:'localhost', port:6379, client:redisClient };
}

app.use(session({
    secret:'jp_test',
    store: new redisStore(redisOptions),
    cookie:{ maxAge:1000*60*30 },
	resave: true,
    saveUninitialized: true,
}));

app.use(function (req, res, next) {
    if (!req.session) {
        return next(new Error('session error'));
    }
    next();
})

app.set('views', './views');
app.set('view engine', 'html');
app.engine('html', swig.renderFile);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
require('./routes')(app);

/* Startup server */
if(global.env == 'production'){
    app.set('port', (process.env.PORT || 5000));
    app.listen(app.get('port'), function() {
        console.log('Node app is running on port', app.get('port'));
    });
} else{
    app.listen(3000, function() {  
        console.log('Listening on port 3000');
    });
}
