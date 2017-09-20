// 引入数据库之后
const crawler = require('../crawlers').info
// let start = null

// module.exports = async (options) => {
//   const { url, scope, topic, limit, cursor } = options
//   const Model = require('../models').info(scope, topic)
//   const now = Date.now()

//   if (!start || now - start >= 5 * 1000 * 60) {
//     // 1. 通过 scope 和 topic 取出该数据集中的第一个数据（使用节流，限定时间内不再使用爬虫，1~3 为数据确认和更新）
//     const newest = await Model.getNewest('title')
//     // 2. 向 url 发起爬取请求，在获取数据的过程中，比对第一步中的数据，若一致则立刻终止并返回已获取的新数据
//     const list = crawler({ url, scope, topic }, newest)
//     // 3. 比对数据，将新数据依照 scope 和 topic 存入数据库
//     list.length && list.map(async item => { await new Model(item).save() })
//   }

//   // 4. 最后根据 limit 和 cursor += limit 返回数据（当限定时间内再次收到同一 scope 和 topic 的请求则只执行该步骤）

//   return { url, limit, cursor }
// }

module.exports = async (options) => {
  const { url, scope, topic } = options
  const newest = '数据库返回的最新标题，用于与爬取的标题进行比对，及时终止'
  const list = await crawler({ url, scope, topic }, newest)

  return list
}
