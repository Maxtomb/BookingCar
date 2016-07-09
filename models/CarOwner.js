var db = require('../lib/db');
var wrap = require('co-monk');

module.exports = wrap(db.get('CarOwner'));