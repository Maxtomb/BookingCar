var http     = require('http');
var session = require('koa-session');
var koa      = require('koa');
var logger   = require('koa-logger');
var route    = require('koa-route');
var routes   = require('./routes');
var serve    = require('koa-static');
var stylus   = require('koa-stylus');
 



// Create koa app
var app = koa();

app.keys = ['some secret hurr'];
app.use(session(app));

// middleware
app.use(logger());
app.use(stylus('./public'));
app.use(serve('./public'));

// Route middleware
app.use(route.get('/', routes.menu));
// 登陆页面
app.use(route.get('/loginpage',routes.loginpage));
// 登陆操作
app.use(route.post('/login',routes.login));
// 注册页面
app.use(route.get('/registerpage',routes.registerpage));
// 注册操作
app.use(route.post('/register', routes.register));
// 显示所有行程
app.use(route.get('/listrouteorder', routes.listRouteOrder));
// 注销登陆
app.use(route.get('/logout', routes.logout));
// 显示行程详细信息(这是给顾客下订单用得)
app.use(route.get('/bookingcar/routeorder/:id/:ownerid', routes.showRouteOrder));
// 下订单页面
app.use(route.get('/bookingcar/order/:id/:carOwnerId', routes.makeOrder));
// 下订单操作(预定按钮得行为)
app.use(route.post('/bookingcar/updateorder', routes.updateOrder));
// 拦截器 拦截所有得请求 如果符合要求 则才能继续访问它下面的资源连接
app.use(function *(next){
	if(this.session.auth!=''||this.session.auth!=null){
		if(routes.authcheck(this.session.auth)){
			yield next;
		}else{
			this.body = '<h1>auth 信息不对</h1>';
		}
		
	}else{
		this.body = "<h1>请先登陆</h1>";
	}
});
//显示我的行程(我的行程拥有curd权限)
app.use(route.get('/listmyrouteorder/:id', routes.listMyRouteOrder));
//跳转到添加我的行程页面
app.use(route.get('/bookingcar/newmyrouteorder/:id', routes.addMyRouteOrder));
//添加我的行程执行的操作
app.use(route.post('/bookingcar/createmyrouteorder', routes.createMyRouteOrder));
//修改我的行程页面
app.use(route.get('/bookingcar/myrouteorder/edit/:id/:ownerid', routes.editMyRouteOrder));
//修改我的行程操作
app.use(route.post('/bookingcar/updatemyrouteorder', routes.updateMyRouteOrder));
//跳转修改用户信息页面
app.use(route.get('/bookingcar/carowner/edit/:id', routes.editCarOwner));
//修改用户信息操作
app.use(route.post('/bookingcar/updateowner', routes.updateCarOwner));
//取消顾客订单操作
app.use(route.get('/cancelorder/:id/:phoneNo/:orderid/:ownerid', routes.cancelorder));
//显示我的行程详细信息
app.use(route.get('/bookingcar/myrouteorder/:id/:ownerid', routes.showMyRouteOrder));
//删除我的行程
app.use(route.get('/bookingcar/myrouteorder/delete/:id/:ownerid', routes.deleteMyRouteOrder));



app.use(route.get('/bookingcar/routeorder/delete/:id/:ownerid', routes.deleteRouteOrder));

app.use(route.get('/bookingcar/routeorder/edit/:id/:ownerid', routes.editRouteOrder));

app.use(route.post('/bookingcar/updaterouteorder', routes.updateRouteOrder));

app.use(route.get('/listcarowner', routes.listCarOwner));

app.use(route.get('/bookingcar/newcarowner', routes.addCarOwner));

app.use(route.get('/bookingcar/carowner/:id', routes.showCarOwner));

app.use(route.post('/bookingcar/createowner', routes.createCarOwner));

//所有跳转增加页面的 path 使用new 开头, 对应的route 使用add 
// app.use(route.get('/bookingcar/newrouteorder', routes.addRouteOrder));



//所有的增加操作的path 使用 create 开头, 对应的route 使用create
// app.use(route.post('/bookingcar/createrouteorder', routes.createRouteOrder));

app.use(route.get('/bookingcar/carowner/:id', routes.showCarOwner));
app.use(route.get('/bookingcar/carowner/delete/:id', routes.deleteCarOwner));
app.use(route.get('/bookingcar/carowner/edit/:id', routes.editCarOwner));

// app.use(route.get('/bookingcar/carowner/delete/:id', routes.deleteCarOwner));

// Create HTTP Server
http.createServer(app.callback()).listen(3000);
console.log('Server listening on port 3000');
