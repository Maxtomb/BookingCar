var parse  = require('co-body');
var render = require('../lib/views');
var carOwnerCollection = require('../models/CarOwner');
var routeOrderCollection = require('../models/RouteOrder'); 
var jwt = require('jwt-simple');

exports.authcheck = function(token){
  if(token!=null){
    var decoded = jwt.decode(token,'xiaohei');
    var arr = decoded.split('x,%');
    if(arr.length==2){
      return true;
    }else{
      return false;
    }
  }else{
    return false;
  }
}


exports.menu = function *() {
  var isLogin = this.session.isLogin;
  var carOwner = this.session.carOwner;
  var isAdmin = this.session.isAdmin;
  this.body = yield render('index',{isLogin:isLogin,isAdmin:isAdmin,carOwner:carOwner});
};


exports.loginpage = function *() {
  this.body = yield render('login');
};


exports.registerpage = function *() {
  this.body = yield render('register');
};


exports.register = function *() {
  var input = yield parse(this);
  console.log(input);
  var exist = yield carOwnerCollection.findOne({'mobilePhone':input.MobilePhone});
  console.log(exist);
  if(exist==null){
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
      password: input.Password,
      isStandardUser: false,
      created_on: d,
      updated_on: d
    });
    this.body = yield render('message',{message:'恭喜您,注册成功！'});
  }else{
    this.body = yield render('message',{message:'该电话已被注册请直接登陆,如果忘记密码 请联系管理员'});
    
  }
};


exports.login = function *() {
  var input = yield parse(this);
  console.log(input);
  var result = yield carOwnerCollection.findOne({"mobilePhone":input.MobilePhone});
  console.log("result => "+JSON.stringify(result));
  if(result == null){
    this.body = yield render('message',{message:'用户名不存在'});
  }else if(result!=''&&result.password == input.Password){
    var secret = "xiaohei";
    console.log("log: mobilePhone = "+result.mobilePhone);
    if(result.mobilePhone == "admin"){
      this.session.isAdmin = true;
    }
    var token = jwt.encode(input.MobilePhone+"x,%"+result.password,secret);
    this.session.auth=token;
    this.session.isLogin = true;
    this.session.carOwner = result;
    this.body = yield render('index',{isLogin:this.session.isLogin,isAdmin:this.session.isAdmin,carOwner:this.session.carOwner});
  }else{
    this.body = yield render('message',{message:'密码不对。'});
  }
  
};


exports.logout = function *() {

  var  isLogin = this.session.isLogin = true;
  var isAdmin = false;
  if(isLogin == true){
    this.session.isLogin = false;
    this.session.carOwner = null;
    this.session.isAdmin = false;
    this.session.auth = null;
  }
  this.body = yield render('index',{isLogin:isLogin});
  this.redirect('/');
};
/**
 *  显示所有行程
 */
exports.listRouteOrder = function *() {
  var carOwner = yield carOwnerCollection.find({});
  var routeOrder = yield routeOrderCollection.find({});
  this.body = yield render('listrouteorder', {routeOrders: routeOrder,isAdmin:this.session.isAdmin,carOwner: carOwner});
};


exports.listCarOwner = function *() {
  if(this.session.isAdmin){
    var carOwner = yield carOwnerCollection.find({});
    var routeOrder = yield routeOrderCollection.find({});
    this.body = yield render('listcarowner', {routeOrders: routeOrder,isAdmin:this.session.isAdmin, carOwner: carOwner});
  }else{
    this.body = yield render('message',{message:'您没有管理权限，请先登陆管理员'});
  }
};


exports.listMyRouteOrder = function *(id) {
  var carOwner = yield carOwnerCollection.findById(id);
  console.log(carOwner);
  var routeOrderIdArry = carOwner.routeOrder;
  var routeOrderIdArryJsonObj = JSON.stringify(routeOrderIdArry);
  var arrayObj = new Array();
  for(var index in routeOrderIdArry){
    var routeOrder = yield routeOrderCollection.findById(routeOrderIdArry[index].routeOrderId);
    console.log(routeOrder);
    arrayObj.push(routeOrder);
  }
  this.body = yield render('listmyrouteorder', {routeOrders: arrayObj, carOwner: carOwner});
};
/**
 * 跳转到增加车主页面
 */
exports.addCarOwner = function *() {
  if(this.session.isAdmin){
    var results = yield carOwnerCollection.find({});
    console.log(results);
    this.body = yield render('newcarowner', {carOwner: results});
  }else{
    this.body = yield render('message',{message:'您没有管理权限，请先登陆管理员'});
  }
};

/**
 * 跳转到增加行程页面
 */
exports.addRouteOrder = function *() {
  if(this.session.isAdmin){
    var results = yield carOwnerCollection.find({});
    console.log(results);
    this.body = yield render('newrouteorder',{carOwner: results});
  }else{
    this.body = yield render('message',{message:'您没有管理权限，请先登陆管理员'});
  }
};


exports.addMyRouteOrder = function *(id) {
  var results = yield carOwnerCollection.findById(id);
  console.log(results);
  this.body = yield render('newmyrouteorder',{carOwner: results});
};

/**
 * 编辑行程信息
 */
exports.editRouteOrder = function *(routeorderid,ownerid) {
  var order = yield routeOrderCollection.findById(routeorderid);
  var owner = yield carOwnerCollection.findById(ownerid);
  if (!order) {
    this.throw(404, 'invalid routeOrder id');
  }
  this.body = yield render('editrouteorder', {routeOrder: order,carOwner: owner});
};

exports.editMyRouteOrder = function *(routeorderid,ownerid) {
  var order = yield routeOrderCollection.findById(routeorderid);
  var owner = yield carOwnerCollection.findById(ownerid);
  if (!order) {
    this.throw(404, 'invalid routeOrder id');
  }
  this.body = yield render('editmyrouteorder', {routeOrder: order,carOwner: owner});
};

/**
 * 编辑，显示用户信息 所有的注册车主都需要用
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


exports.showMyRouteOrder = function *(id,ownerid) { 
  var order =  yield routeOrderCollection.findById(id);
  var owner = yield carOwnerCollection.findById(ownerid);
  console.log(order);
  console.log(owner);
  if (!order) {
    this.throw(404, 'invalid bookingcar id');
  }
  this.body = yield render('showmyrouteorder', {routeOrder: order,carOwner: owner});
};

/**
 * 显示车主详细信息
 */
exports.showCarOwner = function *(id) { 
  if(this.session.isAdmin){
    var owner = yield carOwnerCollection.findById(id);
    console.log(owner);
    if (!owner) {
      this.throw(404, 'invalid bookingcar id');
    }
    this.body = yield render('showcarowner', {carOwner: owner});
  }else{
    this.body = yield render('message',{message:'您没有管理权限，请先登陆管理员'});
  }
};

/**
 * 删除行程信息
 */
exports.deleteRouteOrder = function *(routeorderid,carownerid) {
  if(this.session.isAdmin){
    yield routeOrderCollection.remove({"_id": routeorderid});
    yield carOwnerCollection.updateById(carownerid,{
        $pull:{
          routeOrder:{"routeOrderId":routeorderid}
        }
    });
    this.redirect('/listrouteorder');
  }else{
    this.body = yield render('message',{message:'您没有管理权限，请先登陆管理员'});
  }
};

/**
 * 删除行程信息
 */
exports.deleteMyRouteOrder = function *(routeorderid,carownerid) {

  yield routeOrderCollection.remove({"_id": routeorderid});
  yield carOwnerCollection.updateById(carownerid,{
      $pull:{
        routeOrder:{"routeOrderId":routeorderid}
      }
  });
  this.redirect('/listmyrouteorder/'+carownerid);
};


/**
 * 删除车主信息
 */
exports.deleteCarOwner = function *(id) {
  if(this.session.isAdmin){
    var input = yield parse.form(this);
    console.log(input);
    yield carOwnerCollection.remove({"_id": id});
    this.redirect('/listcarowner');
  }else{
    this.body = yield render('message',{message:'您没有管理权限，请先登陆管理员'});
  }
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
  this.redirect('/listrouteorder');
};


exports.createMyRouteOrder = function *() {
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
  yield carOwnerCollection.updateById(input.OwnerId,{
    $addToSet:{
      routeOrder:{
        "routeOrderId":id
      }
    }
  });
  this.redirect('/listmyrouteorder/'+input.OwnerId);
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
    password: input.Password,
    isStandardUser: false,
    created_on: d,
    updated_on: d
  });
  this.redirect('/listcarowner');
};

/**
 * 更新行程
 */
exports.updateRouteOrder = function *() {
  if(this.session.isAdmin){
    var input = yield parse(this);
    console.log(input);
    var d = new Date();
    yield routeOrderCollection.updateById(input.id, {$set:{
      routePoint: input.RoutePoint,
      mobilePhone: input.MobilePhone,
      setoffDate: input.SetoffDate,
      setoffTime: input.SetoffTime,
      destination: input.Destination,
      description: input.description,
      updated_on: d
    }});
    this.redirect('/listRouteOrder');
  }else{
    this.body = yield render('message',{message:'您没有管理权限，请先登陆管理员'});
  }
};


exports.updateMyRouteOrder = function *() {
  var input = yield parse(this);
  console.log(input);
  var d = new Date();
  yield routeOrderCollection.updateById(input.id, {$set:{
    routePoint: input.RoutePoint,
    mobilePhone: input.MobilePhone,
    setoffDate: input.SetoffDate,
    setoffTime: input.SetoffTime,
    destination: input.Destination,
    description: input.description,
    updated_on: d
  }});
  this.redirect('/listRouteOrder');
};



/**
 * 更新车主信息 所有的注册车主都需要用
 */
exports.updateCarOwner = function *() {
  
    var input = yield parse(this);
    var d = new Date();
    console.log(JSON.stringify(input));
    var result = yield carOwnerCollection.updateById(input.id, {$set:{
        carOwnerName: input.CarOwnerName,
        mobilePhone: input.MobilePhone,
        password: input.Password,
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

exports.cancelorder = function *(id,phoneNo,orderid,ownerid){
  var te = yield routeOrderCollection.updateById(id,{$pull:{
    customer:{customerPhoneNumber:phoneNo}
  }});
  this.redirect('/bookingcar/myrouteorder/'+orderid+'/'+ownerid);
}

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








