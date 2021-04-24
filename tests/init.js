const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const instance = require('./helpers/instance')

chai.use(chaiAsPromised)
// Initialize chai `should` interface https://www.chaijs.com/guide/styles/#should
chai.should()
// Initialize chai `expect` interface https://www.chaijs.com/guide/styles/#expect
chai.expect

before(async () => {
  console.time('executionTime')
  global.dvf = await instance()
})

after(async () => {
  console.log('-----------------------')
  console.timeEnd('executionTime')
  console.log('-----------------------')
})
