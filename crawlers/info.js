const request = require('superagent')
require('superagent-charset')(request)

const { rules } = require('../config').info
const { filterList } = require('../filters').info

/**
 * 获取信息详情
 * @param {*} ctx
 * @param {*} options
 */
const crawlerItem = async (ctx, options) => {
  // const $ = cheerio.load()
}

/**
 * 获取信息列表
 * @param {*} ctx
 * @param {*} options
 * @param {*} newest
 */
const crawlerList = (ctx, options) => new Promise((resolve, reject) => {
  const { host, url, scope, topic, newest = '' } = options
  const rule = rules[scope][topic] || {}

  request
    .get(url)
    .charset(rule.charset || 'utf-8')
    .end((err, sres) => {
      if (err) {
        ctx.status = 500
        reject(err)
      }

      let ret = filterList({
        host,
        rule,
        newest,
        html: sres.text
      })

      resolve(ret)
    })
})

module.exports = {
  crawlerItem,
  crawlerList
}