const request = require('supertest')
const app = require('../app')
const index = '/info'
const { scopes } = require('../config/info')

describe(`\n---- #test ${index} ----`, () => {
  const server = app.listen(3030)
  const testRequest = request(server)

  scopes.map(scope => {
    const scopeName = scope[0]
    const topics = Object.keys(scope[1]).filter(key => key !== 'host')

    describe(`\n=== scope: ${scopeName} ===`, () => {
      topics.map(topic => {
        const fullPath = `${index}/${scopeName}/${topic}`

        it(fullPath, async () => {
          await testRequest
            .get(fullPath)
            .expect('Content-Type', /application\/json/)
            .expect(200)
        })
      })
    })
  })
})
