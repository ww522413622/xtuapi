import * as request from 'supertest'
const { expect } = require('chai')

import app from '../app'
import config from '../config'

const server = app.listen(config.testPort)
const testRequest: any = request(server)

type TEST_FN_TYPE = {
  method?: string,
  url: string,
  data?: null | object,
  status?: number
}

type DONE_RES_TYPE = {
  body: {
    token: string,
    time: any,
    data: any
  },
  text: string
}

const headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
  authorization: ''
}

const loginData = require('../../config/private') || {}
const testFn = function ({ method = 'get', url, data = null, status = 200 }: TEST_FN_TYPE, done?: (res: DONE_RES_TYPE) => any) {
  return testRequest[method](url)
    .set(headers)
    .send(data)
    .expect(status)
    .then(res => {
      return Promise.resolve(
        done ? done(res) : {}
      )
    })
    .catch(err => {
      return Promise.reject(err)
    })
}

describe(`进行 User 接口测试`, () => {
  it('【登录】正常登录', async () => {
    await testFn({
      method: 'post',
      url: '/user/login',
      data: loginData.xtu
    }, (res) => {
      expect(res.body.token).to.be.a('string')
      headers.authorization = `Bearer ${res.body.token}`
    })
  })

  it('【登录】账号为空', async () => {
    await testFn({
      method: 'post',
      url: '/user/login',
      status: 400,
      data: {
        ...loginData.xtu,
        username: ''
      }
    }, (res) => {
      expect(res.text).to.be.equal('账号或密码不能为空')
    })
  })

  it('【登录】密码为空', async () => {
    await testFn({
      method: 'post',
      url: '/user/login',
      status: 400,
      data: {
        ...loginData,
        password: ''
      }
    }, (res) => {
      expect(res.text).to.equal('账号或密码不能为空')
    })
  })

  it('【登录】账号不符合规范', async () => {
    await testFn({
      method: 'post',
      url: '/user/login',
      status: 400,
      data: {
        ...loginData,
        username: '2014'
      }
    }, (res) => {
      expect(res.text).to.equal('学号或密码错误')
    })
  })

  it('【登录】密码错误', async () => {
    await testFn({
      method: 'post',
      url: '/user/login',
      status: 400,
      data: {
        ...loginData,
        password: '12345678'
      }
    }, (res) => {
      expect(res.text).to.equal('学号或密码错误')
    })
  })

  it('【登录】方法错误', async () => {
    await testFn({
      url: '/user/login',
      status: 404,
      data: loginData
    }, (res) => {
      expect(res.text).to.equal('资源不存在')
    })
  })

  it('【绩点排名】本学期绩点排名', async () => {
    await testFn({
      url: '/user/rank',
      status: 200
    }, (res) => {
      expect(res.body).to.be.a('object')
      expect(res.body).to.have.property('data')
      expect(res.body).to.have.property('time')
      expect(res.body.time.join('')).to.equal('2017-2018-2')
    })
  })

  it('【绩点排名】2015上半学期绩点排名', async () => {
    await testFn({
      method: 'post',
      url: '/user/rank',
      status: 200,
      data: {
        time: '2015-1'
      }
    }, (res) => {
      expect(res.body.time).to.be.a('array').lengthOf(1)
    })
  })

  it('【绩点排名】2016学年绩点排名', async () => {
    await testFn({
      method: 'post',
      url: '/user/rank',
      status: 200,
      data: {
        time: '2016-1&2016-2'
      }
    }, (res) => {
      expect(res.body.time).to.be.a('array').lengthOf(2)
    })
  })

  it('【绩点排名】2014学年至2017上半学期绩点排名', async () => {
    await testFn({
      method: 'post',
      url: '/user/rank',
      status: 200,
      data: {
        time: '2014-1&2014-2&2015-1&2015-2&2016-1&2016-2&2017-1'
      }
    }, (res) => {
      expect(res.body.time).to.be.a('array').lengthOf(7)
    })
  })

  // TODO:
  // it('【绩点排名】查询格式错误', async () => {
  //   await testFn({
  //     method: 'post',
  //     url: '/user/rank',
  //     status: 400,
  //     data: {
  //       time: '2014&'
  //     }
  //   }, (res) => {
  //   })
  // })

  it('【空闲教室】查看今日教室', async () => {
    await testFn({
      url: '/user/classroom',
      status: 200
    }, (res) => {
      expect(res.body.data).to.be.a('array')
      expect(res.body.data[0]).to.be.a('object')
      expect(res.body.data[0]).to.have.property('name').to.be.a('string')
      expect(res.body.data[0]).to.have.property('details').to.be.a('array')
    })
  })

  it('【空闲教室】查看明日教室', async () => {
    await testFn({
      url: '/user/classroom?day=1',
      status: 200
    }, (res) => {
      expect(res.body.data).to.be.a('array')
    })
  })

  it('【空闲教室】更新教室', async () => {
    await testFn({
      url: '/user/classroom',
      method: 'post',
      status: 200,
      data: loginData,
    })
  })
})
