var http     = require('http');
var koa      = require('koa');
var logger   = require('koa-logger');
var route    = require('koa-route');
var routes   = require('./routes');
var serve    = require('koa-static');
var stylus   = require('koa-stylus');
var session = require('koa-session');

// Create koa app
var app = koa();
app.keys = ['some secret hurr'];
app.use(session(app));

// middleware
app.use(logger());
app.use(stylus('./public'));
app.use(serve('./public'));

// Route middleware
app.use(route.get('/', routes.listRouteOrder));
// app.use(route.get('/offline.manifest',route.offlineCache));
app.use(function* (next){
  yield next;
  if ('/favicon.ico' == this.path) return;
  var n = this.session.views || 0;
  this.session.views = ++n;
  this.session.loginid = null;
});
//所有跳转增加页面的 path 使用new 开头, 对应的route 使用add 
app.use(route.get('/bookingcar/newrouteorder', routes.addRouteOrder));
app.use(route.get('/bookingcar/newowner', routes.addOwner));

//所有的增加操作的path 使用 create 开头, 对应的route 使用create
app.use(route.post('/bookingcar/createrouteorder', routes.createRouteOrder));
app.use(route.post('/bookingcar/createowner', routes.createOwner));
app.use(route.post('/bookingcar/updateowner', routes.updateOwner));


app.use(route.get('/bookingcar/routeorder/:id/:ownerid', routes.showRouteOrder));
app.use(route.get('/bookingcar/routeorder/delete/:id/:ownerid', routes.deleteRouteOrder));
app.use(route.get('/bookingcar/routeorder/edit/:id/:ownerid', routes.editRouteOrder));
app.use(route.get('/bookingcar/carowner/:id', routes.showCarOwner));
app.use(route.get('/bookingcar/carowner/delete/:id', routes.deleteCarOwner));
app.use(route.get('/bookingcar/carowner/edit/:id', routes.editCarOwner));

app.use(route.get('/bookingcar/order/:id/:carOwnerId', routes.neworder));

app.use(route.post('/bookingcar/update', routes.update));
app.use(route.post('/bookingcar/updateOrder', routes.updateOrder));
app.use(route.get('/locate', routes.locate));


// Create HTTP Server
http.createServer(app.callback()).listen(3000);
console.log('Server listening on port 3000');
