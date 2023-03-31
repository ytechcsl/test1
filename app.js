var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fileUpload = require('express-fileupload')
const rateLimit = require('express-rate-limit')

/* //Redis store setup to limiter
const RedisStore = require("rate-limit-redis");
const { createClient } = require("redis");
const redisClient = createClient({
	socket: {
		host: '127.0.0.1',
		port: '6379'
	},
	password: ''
})
redisClient.connect().then(() => {
	console.log('Connect redis successfully')
}).catch(() => {
	console.log('Connect redis error')
}); */

var MongoStore = require('rate-limit-mongo'); //Mongo store import to limiter
const limiter = rateLimit({
	//MongoDB store configuration
	store: new MongoStore({
		uri: 'mongodb://127.0.0.1:27017/limiter_db',
		user: 'admin',
		password: '',
		// should match windowMs
		expireTimeMs: 1 * 60 * 1000,
		errorHandler: console.error.bind(null, 'rate-limit-mongo')
		// see Configuration section for more options and details
	}),
	/* // Redis store configuration
	store: new RedisStore({
		sendCommand: (...args) => redisClient.sendCommand(args),
	}), */
	windowMs: 1 * 60 * 1000, // 1 minutes
	max: 15, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	message: 'No permission'
})

// const si = require('systeminformation');
// si.uuid().then(data => console.log(data))
// 	.catch(error => console.error(error));

// const axios = require('axios')
// axios.get('http://192.168.1.35:3000/api/user', {
// 	headers: {
// 		'user-agent': 'Mozilla/5.0 (Linux; Android 50; CPH2127) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Mobile Safari/537.36',
// 		'accept-language': 'en-US,en;q=0.9',
// 		accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',

// 	}
// }).then((res) => {
// 	console.log(res.data)
// }).catch((err) => {
// 	console.log(err)
// })

// const request = require('request');
// request('http://192.168.1.35:3000/api/user', {
// 	'headers': {
// 		'user-agent': 'Mozilla/5.0 (Linux; Android 12; CPH2127) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Mobile Safari/537.36',
// 		'accept-language': 'en-US,en;q=0.9',
// 		accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
// 	}
// }, function (error, response, body) {
// 	console.error('error:', error); // Print the error if one occurred
// 	console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
// 	console.log('body:', body); // Print the HTML for the Google homepage.
// });


/* const redis = require('redis');
const client = redis.createClient({
	socket: {
		host: '127.0.0.1',
		port: '6379'
	},
	password: ''
});
client.on('error', err => {
	console.log('Error ' + err);
});

client.connect().then(() => {
	console.log('Redis connection established successfully')
}).catch(error => {
	console.log(error)
});

// testRedis()
async function testRedis() {
	await client.set('token', 'token123fc')
	// await client.expire('token', 60)
	// await client.del('token')
	const token = await client.get('token')
	console.log(token)
}

// ipRedis()
async function ipRedis() {
	// await client.del('token123fc')
	const ip = await client.get('token123fc')
	if (!ip) {
		await client.set('token123fc', 1)
		await client.expire('token123fc', 60)
	} else {
		if (ip > 10) {
			console.log('Too many connection')
		}
		await client.incrBy('token123fc', 1)
	}
	console.log(ip)
} */

// console.log(new Date(1677658018681), new Date(1677658011731), 1677658018681 - 1677658011731)

var usersRouter = require('./routes/users');
var postgresRouter = require('./routes/postgresql');

var app = express();
app.use(fileUpload());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/image', express.static(path.join(__dirname, 'public/images')));

app.use('/user', limiter, usersRouter);
app.use('/postgres', limiter, postgresRouter);

app.get('/stream', (req, res) => {
	res.writeHead(200, {
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		'Connection': 'keep-alive'
	});
	setInterval(() => {
		console.log('Evnet source working')
		res.write('data: ' + new Date() + '\n\n');
	}, 1000);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};
	console.log(err)
	res.status(err.status || 500);
	res.status(200).end('No permission');
});

module.exports = app;
