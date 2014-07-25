var monk = require('monk')
,	db = monk('localhost/hisiy')

module.exports = db