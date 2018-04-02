import * as cheerio from 'cheerio'

const _filterTitle = ({ title, parent }) => {
  if (!parent || title) { return title.trim() }

  return parent.trim()
}

export const filterTime = (time) => {
  return time
    .replace(/\s/g, '')
    .replace(/^（\d*次）/, '') // (**次)Date
    .replace(/^\(([\d-]+)\)$/, (str, $1) => $1) // (Date)
    // .replace(/^.*(\d{4})年(\d+)月(\d+)日.*$/g, (str, $1, $2, $3) => $1 + '-' + $2 + '-' + $3) // (年月日)
    .replace(/.*(\d{4}).{1}(\d+).{1}(\d+).*/mg, (str, $1, $2, $3) => $1 + '-' + $2 + '-' + $3)
}

const _filterHref = ({ host, href }) => {
  return /http/.test(href)
    ? href
    : /^\//.test(href)
      ? host + href
      : host + '/' + href
}

export const filterList = ({ host, html, rule, newest, scope, topic }) => {
  const ret = []
  const $ = cheerio.load(html)

  try {
    $(rule.el).find(rule.parent).each(function (i) {
      let { href, title, time } = rule.func($(this))

      if (!title) {
        return false
      } else {
        title = title.trim()
        if (title.trim() === newest) {
          return false
        }
      }

      href = _filterHref({ host, href })
      if (!time) {
        time = filterTime(
          $(this).find(rule.time).text()
        )
      }

      ret.push({ title, href, time, scope, topic })
    })
  } catch (err) {
    console.log(err.message)
    return false
  }

  return ret.reverse()
}
