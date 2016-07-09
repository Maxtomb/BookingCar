var parse  = require('co-body');
var render = require('../lib/views');
var bookingcar  = require('../models/bookingcar');
var carOwnerCollection = require('../models/CarOwner');
var routeOrderCollection = require('../models/RouteOrder'); 

// Route definitions



exports.locate = function *(){
  this.body = yield render('locate');
};


/**
 * Item ListRouteOrder.
 */
exports.listRouteOrder = function *() {
  var carOwner = yield carOwnerCollection.find({});
  var routeOrder = yield routeOrderCollection.find({});
  this.body = yield render('index', {routeOrders: routeOrder, carOwner: carOwner});
};


/**
 * Item List.
 */
exports.addOwner = function *() {
  var results = yield carOwnerCollection.find({});
  console.log(results);
  this.body = yield render('newowner', {carOwner: results});
};



/**
 * Form for creating new bookingcar item.
 */
exports.addRouteOrder = function *() {
  var results = yield carOwnerCollection.find({});
  console.log(results);
  this.body = yield render('newrouteorder',{carOwner: results});
};

/**
 * Form for editing a bookingcar item.
 */
exports.edit = function *(id) {
  var result = yield bookingcar.findById(id);
  console.log(JSON.stringify(result));
  if (!result) {
    this.throw(404, 'invalid bookingcar id');
  }
  this.body = yield render('edit', {bookingcar: result});
};


exports.editCarOwner = function *(id) {
  var result = yield carOwnerCollection.findById(id);
  console.log(JSON.stringify(result));
  if (!result) {
    this.throw(404, 'invalid carOwner id');
  }
  this.body = yield render('editcarowner', {carOwner: result});
};

exports.neworder = function *(id,carOwnerId) {
  var result = yield routeOrderCollection.findById(id);
  console.log(result);
  if (!result) {
    this.throw(404, 'invalid bookingcar id');
  }
  this.body = yield render('order', {routeOrder: result,carOwnerId: carOwnerId});
};

/**
 * Show details of a bookingcar item.
 */
exports.showRouteOrder = function *(id,ownerid) { 
  var order =  yield routeOrderCollection.findById(id);
  var owner = yield carOwnerCollection.findById(ownerid);
  console.log("--------------------------");
  console.log(order);
  console.log(owner);
  if (!order) {
    this.throw(404, 'invalid bookingcar id');
  }
  this.body = yield render('showrouteorder', {routeOrder: order,carOwner: owner});
};


exports.showCarOwner = function *(id) { 
  var owner = yield carOwnerCollection.findById(id);
  console.log("--------------------------");
  console.log(owner);
  if (!owner) {
    this.throw(404, 'invalid bookingcar id');
  }
  this.body = yield render('showcarowner', {carOwner: owner});
};

/**
 * Delete a bookingcar item
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

exports.deleteCarOwner = function *(id) {
  var input = yield parse.form(this);
  console.log(input);
  yield carOwnerCollection.remove({"_id": id});
  this.redirect('/');
};

exports.createRouteOrder = function *() {
  var input = yield parse(this);
  console.log("-------Create Route Order Input--------");
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

exports.createOwner = function *() {
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

exports.updateOwner = function *() {
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



exports.createCustomer = function *() {
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


/**
 * Update an existing bookingcar item.
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






