var express = require('express');
var requestIP = require('request-ip')
var router = express.Router();

const Ajv = require("ajv")
const ajv = new Ajv()

router.post('/user', function (req, res) {
	res.status(200).json({ success: true, code: 200, data: [{ name: 'Hellow', age: 20 }] });
});
router.post('/ajv', ajvValidateReq, function (req, res, next) {
	res.status(200).json({ success: true, code: 200, validate: req.validate, data: [{ name: 'Hellow', age: 20 }] });
});

router.post('/upload', function (req, res, next) {
	var clientIp = requestIP.getClientIp(req)
	console.log(clientIp)
	console.log(req.headers)
	console.log('Files: ', req.files)
	console.log('Body: ', req.body)
	res.status(200).json({ success: true, code: 200, data: [{ name: 'Hellow', age: 20 }] });
});

module.exports = router;

function ajvValidateReq(req, res, next) {
	const data = req.body
	const schema = {
		type: "object",
		properties: {
			bar: { type: "integer" },
			baz: { type: "string" },
		},
		required: ["bar", "baz"],
		additionalProperties: false,
	}
	var validate = ajv.compile(schema);
	var valid = validate(data);
	if (valid) {
		return next()
	}
	const error = validate?.errors[0]
	const message = `${error?.instancePath?.replace(/\//g, '')}${error?.instancePath ? '_' : ''}${error?.message?.replace(/ /g, '_')?.replace(/\'/g, '')}`
	return res.status(200).json({
		message
	})
}
