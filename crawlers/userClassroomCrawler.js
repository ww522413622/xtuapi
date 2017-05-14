const request = require('superagent')
const charset = require('superagent-charset')
charset(request)
const cheerio = require('cheerio')

const { checkList, getNameAndRoom, formatByTime, formatByName } = require('../filters/userClassroom')

const header = require('../config/default').header
const user = require('../config/default').xtuURL.user


const init = html => {
  let $ = cheerio.load(html)
  let table = []

  $('#dataList').find('tr').each((idx, tr) => {
    if (idx <= 1) return
    let $tr = $(tr),
        item = {},
        tdArr = $tr.find('td')

    item.classroomName = $(tdArr[0]).text().trim()
    item.classroomTime = []

    for (let i = 1; i < 6; i ++) {
      item.classroomTime.push($(tdArr[i]).text().trim())
    }
    table.push(item)
  })
  return table
}

module.exports = (req, res, session) => {
  let day = req.body.day || 0
  ;(day < 0 || day > 1) && (day = 0)
  const classroomURL = user.host + user.path.classroom

  request.post(classroomURL)
    .send({ xzlx: day })
    .set(header)
    .set('Cookie', session)
    .charset('utf-8')
    .end((err, sres) => {
      if (err) { throw new Error('获取空闲教室失败') }

      let table = init(sres.text)

      table = +req.body.byName === 1
        ? formatByName(table, day)
        : formatByTime(table, day)

      console.log(`=== 成功获取空闲教室 ===`)

      res.status(200).json(table)
    })
}
