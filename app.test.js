var supertest = require('supertest');
var app = require('./app')
describe('Test csl API', () => {
	it('test router /user', () => {
		return supertest(app).get('/user')
			.expect('Content-Type', /json/)
			.expect(200)
			.then((resp) => {
				expect(resp.body).toEqual(
					expect.objectContaining({
						success: expect.any(Boolean),
						code: expect.any(Number),
						data: expect.arrayContaining([
							expect.objectContaining({
								name: expect.any(String),
								age: expect.any(Number)
							})
						])
					})
				)
			})
	})
})