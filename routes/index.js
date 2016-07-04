var parse  = require('co-body');
var render = require('../lib/views');
var bookingcar = require('../models/bookingcar');
// var todos  = require('../models/todos');

// Route definitions

/**
 * 地图定位跳转
 */
exports.locate = function *(){
  this.body = yield render('locate');
};


/**
 * 显示所有行程信息
 */
exports.list = function *() {
  var results = yield bookingcar.find({});
  console.log(results);
  this.body = yield render('index', {bookingcar: results});
};

/**
 * 跳转到添加行程信息页面
 */
exports.add = function *() {
  var ss = this.session;
  this.body = yield render('new',{session: ss});
};

/**
 * 跳转到修改行程信息页面
 */
exports.edit = function *(id) {
  var result = yield bookingcar.findById(id);
  console.log(JSON.stringify(result));
  if (!result) {
    this.throw(404, 'invalid bookingcar id');
  }
  this.body = yield render('edit', {bookingcar: result});
};

/**
 * 跳转到预定页面
 */
exports.order = function *(id) {
  var result = yield bookingcar.findById(id);
  console.log(JSON.stringify(result));
  if (!result) {
    this.throw(404, 'invalid bookingcar id');
  }
  this.body = yield render('order', {bookingcar: result});
};

/**
 * 显示行程详细信息
 */
exports.show = function *(id) {
  var result = yield bookingcar.findById(id);
  if (!result) {
    this.throw(404, 'invalid bookingcar id');
  }
  this.body = yield render('show', {bookingcar: result});
};

/**
 * 删除一个行程
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
 * 创建行程信息
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




/**
 * 跳转到添加行程信息页面
 */
exports.addOwner = function *() {
  var ss = this.session;
  this.body = yield render('owner/listowner',{session: ss});
};
/**
 * 显示所有车主
 */
exports.listCarOwner = function *() {
  var results = yield bookingcar.find({});
  console.log(results);
  this.body = yield render('owner/listowner', {bookingcar: results});
};
/**
 * 创建车主信息
 */
exports.createCarOwner = function *() {
  var input = yield parse(this);
  console.log(input);
  var d = new Date();
  yield bookingcar.insert({
    carOwnerName: input.CarOwnerName,
    mobilePhone: input.MobilePhone,
    car:{
      carNumberPlate: input.CarNumberPlate,
      carName: input.CarName,
      carColor: input.CarColor,
      carSeatsCount: input.CarSeatsCount
    },
    route:[],
    customer:[],
    isStandardUser: false,
    created_on: d,
    updated_on: d
  });
  this.redirect('/');
};

/**
 * 修改行程信息.
 */
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
 * 预定一个位置.
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
  this.redirect('/bookingcar/'+input.id);
};






