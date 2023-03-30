var express = require('express');
var router = express.Router();
const Sequelize = require('sequelize');
var db = require('./db')

router.get('/product/search', async function (req, res, next) {
	try {
		const data = await db.query('SELECT * FROM func_get_search_product2(1, 10)')
		res.status(200).json({
			success: true,
			code: 200,
			data: data[0]
		});
	} catch (error) {
		console.log(error)
		res.status(200).json({
			success: false,
			code: 201
		});
	}
});

module.exports = router;
