import * as request from 'superagent'
const Eventproxy = require('eventproxy')

import config from '../config/user'
import { Classroom } from '../models'
import {
  infoFilter,
  courseFilter,
  examFilter,
  scheduleFilter,
  rankFilter,
  classroomFilter
} from '../filters/user'

import _h from '../utils/headers'
import _c from '../utils/charset'

const {
  url: { host, path: routes },
  defaultTime: { year: defaultYear, half: defaultHalf }
} = config

type TYPE = {
  year?: number,
  half?: number,
  href?: string,
  sid?: string,
  data?: string,
  method?: string,
  param?: object
};

/**
 * 返回完整的年份和学期
 * @param {String} param0 学年，如：2016-2017-2
 */
const _getFullTime = ({ year, half } : TYPE) => (
  `${ year }-${ (Number(year) + 1) }-${ half }`
)

/**
 * 统一的爬取逻辑（除 rank）
 * @param {Object} filter 过滤后的结果
 */
const _fetch = (filter: any) => {
  return ({ method = 'get', href, sid, data = '' } : TYPE, options = {}) => {
    return new Promise((resolve, reject) => {
      const headers = _h.updateHeaders()

      request
        [method](href)
        .set(headers)
        .set('Cookie', sid)
        .send(data)
        .end((err: any, sres: any) => {
          _c(sres)

          err ? reject(err) : resolve(
            filter({
              html: sres.text,
              ...options
            })
          )
        })
    })
  }
}

/**
 * 信息
 * @param {Object} param0 userInfo
 */
const infoCrawler = async ({ sid }: TYPE) => {
  const href = host + routes.info
  const ret = await _fetch(infoFilter)({ href, sid })

  return ret
}

/**
 * 成绩
 * @param {Object} param0 userCourse
 */
const courseCrawler = async ({ sid, param }: TYPE) => {
  const {
    time = (defaultYear + '-' + defaultHalf)
  } = param

  const fullTime = _getFullTime({
    year: time.split('-')[0],
    half: time.split('-')[1]
  })

  const href = host + routes.course

  const ret = await _fetch(courseFilter)(
    { href: href + fullTime, sid },
    { time: fullTime }
  )

  return ret
}

/**
 * 考试信息
 * @param {Object} param0 userExam
 */
const examCrawler = async ({ sid }: TYPE) => {
  const href = host + routes.exam
  const data = `xqlbmc=&xnxqid=${defaultYear}-${defaultYear + 1}-${defaultHalf}&xqlb=`

  const ret = await _fetch(examFilter)({
    method: 'post',
    sid,
    data,
    href
  })

  return ret
}

/**
 * 课程表
 * @param {Object} param0 userSchedule
 */
const scheduleCrawler = async ({ sid }: TYPE) => {
  const href = host + routes.schedule
  const data = `cj0701id=&zc=&demo=&xnxq01id=${defaultYear}-${defaultYear + 1}-${defaultHalf}&sfFD=1`

  const ret = await _fetch(scheduleFilter)({
    method: 'post',
    sid,
    data,
    href
  })

  return ret
}

/**
 * 空教室
 * @param {Object} param0 classroomSchedule
 */
const classroomCrawler = async ({ sid, param }: TYPE) => {
  const href = host + routes.classroom
  let { day = 0 } = param

  day = +day
  day === 0 || (day = 1)

  // sid 用于判断此次操作是否需要更新数据
  if (sid) {
    const ret = [0, 1].map(async day => {
      const data = `xzlx=${day}`
      const _ret = await _fetch(classroomFilter)({
        method: 'post',
        href,
        sid,
        data
      })

      // 首次操作需要取消以下注释，用于插入原始数据
      // 增
      // await new Classroom({
      //   day,
      //   data: _ret
      // }).save()

      // 改
      if (_ret.length) {
        await Classroom.updateByDay({ day, data: _ret })
      }

      return _ret
    })

    return ret[day]
  } else {
    const ret = await Classroom.getByDay({ day })

    return ret
  }
}

/**
 * 绩点排名
 * @param {Object} param0 userRank
 */
const rankCrawler = async ({ sid, param }: TYPE) => new Promise((resolve, reject) => {
  const href = host + routes.rank
  const prop = ['all', '7', '1']
  const defaultTime = defaultYear + '-' + defaultHalf
  let { time = defaultTime } = param
  let year = ''

  if (time.includes('&')) {
    time = time.split('&').map(el => _getFullTime({
      year: el.split('-')[0],
      half: el.split('-')[1]
    }))
    year = time.reduce((a, b) => a + '&kksj=' + b)
  } else {
    year = time = [_getFullTime({
      year: time.split('-')[0],
      half: time.split('-')[1]
    })]
  }

  const ep = new Eventproxy()

  ep.after('getHtml', prop.length, (htmlArr) => {
    const result = {
      data: [],
      time
    }

    result.data = htmlArr.map((htmlObj) => rankFilter(htmlObj))
    result.time.sort()
    resolve(result)
  })

  prop.map((propEl, pid) => {
    const data = `kksj=${ year }&kclb=${
      propEl = propEl !== 'all'
        ? propEl
        : '1&kclb=7'
      }&zsb=0`

    request
      .post(href)
      .set('Cookie', sid)
      .send(data)
      .end((err, sres) => {
        err ? reject(err) : ep.emit('getHtml', {
          html: sres.text, propEl
        })
      })
  })
})

export default {
  info: infoCrawler,
  course: courseCrawler,
  exam: examCrawler,
  schedule: scheduleCrawler,
  rank: rankCrawler,
  classroom: classroomCrawler
}
