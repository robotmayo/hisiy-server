var Hapi = require('hapi')
,   routes = require('./routes')
,   config = require('../config.js')
,   server

module.exports = function setup(port,fn){
    server = new Hapi.Server(port || config.port, {cors : true})
    console.log(server._router)
    routes(server)
    return server
}