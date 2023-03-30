const Sequelize = require('sequelize');

const sequelize = new Sequelize({
	dialect: 'postgres',
	host: 'localhost',
	port: 5432,
	database: 'test_db',
	username: 'postgres',
	password: 'ycsl@gmail',
	pool: {
		max: 5, // maximum number of connections in the pool
		min: 0, // minimum number of connections in the pool
		acquire: 30000, // maximum time, in milliseconds, that a connection can be idle before being released
		idle: 10000 // maximum time, in milliseconds, that a connection can be idle before being destroyed
	}
});

sequelize.authenticate().then((con) => {
	console.log(con)
	console.log('Connection successfully')
}).catch((err) => {
	console.log(err)
})

module.exports = sequelize