var parse  = require('co-body');
var render = require('../lib/views');
var carOwnerCollection = require('../models/CarOwner');
var routeOrderCollection = require('../models/RouteOrder'); 

/**
 *  显示所有行程
 */
exports.listRouteOrder = function *() {
  var carOwner = yield carOwnerCollection.find({});
  var routeOrder = yield routeOrderCollection.find({});
  this.body = yield render('index', {routeOrders: routeOrder, carOwner: carOwner});
};


/**
 * 跳转到增加车主页面
 */
exports.addCarOwner = function *() {
  var results = yield carOwnerCollection.find({});
  console.log(results);
  this.body = yield render('newcarowner', {carOwner: results});
};


/**
 * 跳转到增加行程页面
 */
exports.addRouteOrder = function *() {
  var results = yield carOwnerCollection.find({});
  console.log(results);
  this.body = yield render('newrouteorder',{carOwner: results});
};

/**
 * 编辑行程信息
 */
exports.editRouteOrder = function *(id) {
  var result = yield routeOrderCollection.findById(id);
  console.log(JSON.stringify(result));
  if (!result) {
    this.throw(404, 'invalid bookingcar id');
  }
  this.body = yield render('editrouteorder', {routeOrder: result});
};

/**
 * 编辑车主信息
 */
exports.editCarOwner = function *(id) {
  var result = yield carOwnerCollection.findById(id);
  console.log(JSON.stringify(result));
  if (!result) {
    this.throw(404, 'invalid carOwner id');
  }
  this.body = yield render('editcarowner', {carOwner: result});
};


/**
 *  跳转预约车辆页面
 */
exports.makeOrder = function *(id,carOwnerId) {
  var result = yield routeOrderCollection.findById(id);
  console.log(result);
  if (!result) {
    this.throw(404, 'invalid bookingcar id');
  }
  this.body = yield render('makeorder', {routeOrder: result,carOwnerId: carOwnerId});
};

/**
 * 显示行程详细信息
 */
exports.showRouteOrder = function *(id,ownerid) { 
  var order =  yield routeOrderCollection.findById(id);
  var owner = yield carOwnerCollection.findById(ownerid);
  console.log(order);
  console.log(owner);
  if (!order) {
    this.throw(404, 'invalid bookingcar id');
  }
  this.body = yield render('showrouteorder', {routeOrder: order,carOwner: owner});
};

/**
 * 显示车主详细信息
 */
exports.showCarOwner = function *(id) { 
  var owner = yield carOwnerCollection.findById(id);
  console.log(owner);
  if (!owner) {
    this.throw(404, 'invalid bookingcar id');
  }
  this.body = yield render('showcarowner', {carOwner: owner});
};

/**
 * 删除行程信息
 */
exports.deleteRouteOrder = function *(id) {
  var input = yield parse.form(this);
  console.log(input);
  var pwd = input.pass;
  if(pwd == "abc"){
    yield routeOrderCollection.remove({"_id": id});
  }
  this.redirect('/');
};

/**
 * 删除车主信息
 */
exports.deleteCarOwner = function *(id) {
  var input = yield parse.form(this);
  console.log(input);
  yield carOwnerCollection.remove({"_id": id});
  this.redirect('/');
};

/**
 * 创建行程
 */
exports.createRouteOrder = function *() {
  var input = yield parse(this);
  console.dir(input);
  var d = new Date();

  var routeOrderObj = yield routeOrderCollection.insert({
        setoffDate: input.SetoffDate,
        setoffTime: input.SetoffTime,
        destination: input.Destination,
        routePoint: input.RoutePoint,
        carSeatsCount: input.CarSeatsCount,
        customer:[],
        description: input.description,
        created_on: d,
        updated_on: d
  });
  var id = routeOrderObj._id.toString();
  yield carOwnerCollection.updateById(input.OwnerName,{
    $addToSet:{
      routeOrder:{
        "routeOrderId":id
      }
    }
  });
  this.redirect('/');
};

/**
 * 创建车主
 */
exports.createCarOwner = function *() {
  var input = yield parse(this);
  console.log(input);
  var d = new Date();
  yield carOwnerCollection.insert({
    carOwnerName: input.CarOwnerName,
    mobilePhone: input.MobilePhone,
    routeOrder:[],
    car:{
      carNumberPlate: input.CarNumberPlate,
      carName: input.CarName,
      carColor: input.CarColor
    },
    isStandardUser: false,
    created_on: d,
    updated_on: d
  });
  this.redirect('/');
};

/**
 * 更新行程
 */
exports.updateRouteOrder = function *() {
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
 * 更新车主
 */
exports.updateCarOwner = function *() {
  var input = yield parse(this);
    var d = new Date();
  console.log(JSON.stringify(input));
 var result = yield carOwnerCollection.updateById(input.id, {$set:{
      carOwnerName: input.CarOwnerName,
      mobilePhone: input.MobilePhone,
      car:{
        carNumberPlate: input.CarNumberPlate,
        carName: input.CarName,
        carColor: input.CarColor
      },
      updated_on: d
    }
  });
  console.log(result);
  this.redirect('/');
};

/**
 * 下订单信息 预约成功
 */
exports.updateOrder = function *() {
  var input = yield parse(this);
  console.log(input);
  yield routeOrderCollection.updateById(input.id, {
    $addToSet:{
      customer:{
        customerName: input.CustomerName,
        customerPhoneNumber: input.CustomerPhoneNumber,
        customerLocation: input.CustomerLocation
      }
    }
  });
  this.redirect('/bookingcar/routeorder/'+input.id+"/"+input.carOwnerId);
};








