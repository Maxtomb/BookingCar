var parse  = require('co-body');
var render = require('../lib/views');
var bookingcar  = require('../models/bookingcar');

// Route definitions



exports.locate = function *(){
  this.body = yield render('locate');
};


/**
 * Item List.
 */
exports.list = function *() {
  var results = yield bookingcar.find({});
  console.log(results);
  this.body = yield render('index', {bookingcar: results});
};


/**
 * Item List.
 */
exports.listowner = function *() {
  var results = yield bookingcar.find({});
  console.log(results);
  this.body = yield render('listowner', {bookingcar: results});
};



/**
 * Form for creating new todo item.
 */
exports.add = function *() {
  var ss = this.session;
  this.body = yield render('new',{session: ss});
};

/**
 * Form for editing a todo item.
 */
exports.edit = function *(id) {
  var result = yield bookingcar.findById(id);
  console.log(JSON.stringify(result));
  if (!result) {
    this.throw(404, 'invalid todo id');
  }
  this.body = yield render('edit', {todo: result});
};

exports.order = function *(id) {
  var result = yield bookingcar.findById(id);
  console.log(JSON.stringify(result));
  if (!result) {
    this.throw(404, 'invalid todo id');
  }
  this.body = yield render('order', {todo: result});
};

/**
 * Show details of a todo item.
 */
exports.show = function *(id) {
  var result = yield bookingcar.findById(id);
  if (!result) {
    this.throw(404, 'invalid todo id');
  }
  this.body = yield render('show', {todo: result});
};

/**
 * Delete a todo item
 */
exports.remove = function *(id) {
  var input = yield parse.form(this);
  console.log(input);
  var pwd = input.pass;
  if(pwd == "abc"){
    yield bookingcar.remove({"_id": id});
  }
  this.redirect('/');
};

/**
 * Create a todo item in the data store
 */
exports.create = function *() {
  var input = yield parse(this);
  console.log(input);
  var d = new Date();
  yield bookingcar.insert({
    carOwnerName: input.CarOwnerName,
    routePoint: input.RoutePoint,
    mobilePhone: input.MobilePhone,
    setoffDate: input.SetoffDate,
    setoffTime: input.SetoffTime,
    destination: input.Destination,
    setoffLocation: {
      city: input.SetoffCity,
      address: input.SetoffAddress
    },
    car:{
      carNumberPlate: input.CarNumberPlate,
      carName: input.CarName,
      carColor: input.CarColor,
      carSeatsCount: input.CarSeatsCount
    },
    customer:[],
    description: input.description,
    isStandardUser: false,
    created_on: d,
    updated_on: d
  });
  this.redirect('/');
};


exports.update = function *() {
  var input = yield parse(this);
  console.log(input);
  var d = new Date();
  yield bookingcar.updateById(input.id, {
    carOwnerName: input.CarOwnerName,
    routePoint: input.RoutePoint,
    mobilePhone: input.MobilePhone,
    setoffDate: input.SetoffDate,
    setoffTime: input.SetoffTime,
    destination: input.Destination,
    setoffLocation: {
      city: input.SetoffCity,
      address: input.SetoffAddress
    },
    car:{
      carNumberPlate: input.CarNumberPlate,
      carName: input.CarName,
      carColor: input.CarColor,
      carSeatsCount: input.CarSeatsCount
    },
    customer:[],
    description: input.description,
    isStandardUser: false,
    created_on: d,
    updated_on: d
  });
  this.redirect('/');
};

/**
 * Update an existing todo item.
 */
exports.updateOrder = function *() {
  var input = yield parse(this);
  console.log(input);
  yield bookingcar.updateById(input.id, {
    $addToSet:{
      customer:{
        customerName: input.CustomerName,
        customerPhoneNumber: input.CustomerPhoneNumber,
        customerLocation: input.CustomerLocation
      }
    }
  });
  this.redirect('/todo/'+input.id);
};

exports.updateCarOwnerJsonObject = function *() {
  var input = yield parse(this);
  console.log(input);
  yield bookingcar.updateById(input.id, {
    name: input.name,
    description: input.description,
    created_on: new Date(input.created_on),
    updated_on: new Date()});
  this.redirect('/');
};

exports.offlineCache = function *(req, res){
  console.log("is cacheing");
  res.header("Content-Type", "text/cache-manifest");
  res.end("CACHE MANIFEST");
};






