module.exports = {
  port: process.env.PORT || 3000,
  mongo_url: 'mongodb://127.0.0.1:27017/xtu',
  info: require('./info')
}
