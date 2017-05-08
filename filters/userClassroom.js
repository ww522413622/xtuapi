const list = {
  classroomList: [
    '经管',
    '逸夫'
  ],
  northOrSouthList: [
    '南山',
    '北山'
  ]
}

const checkList = listName => name => {
  for (let el of list[listName]) {
    if (name.indexOf(el) > -1 && name.indexOf('阶') > -1) { return el }
  }
  return null
}

const getNameAndRoom = name => {
  let curName = name,
      nextName = name,
      pos = name.search(/\w/g),
      isClassroom = checkList('classroomList')(name),
      isNorthOrSouth = checkList('northOrSouthList')(name)

  if (/\-/g.test(name)) {
    curName = name.split('-')[0]
    nextName = name.split('-')[1]
  } else if (pos !== -1){
    curName = name.slice(0, pos)
    nextName = name.slice(pos)
  } else {
    if (isNorthOrSouth) {
      curName = name.substring(0, 2) + '阶梯'
    } else if (isClassroom) {
      curName = isClassroom + '楼'
    }
  }
  return { curName, nextName }
}

const judgeDay = (day) => {
  let today = new Date().getDay()
  return (day ? today + 1 : today) % 7
}

module.exports = {
  checkList,
  judgeDay,
  getNameAndRoom
}
