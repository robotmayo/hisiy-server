var Hapi = require('hapi')
,   routes = require('./routes')
,   config = require('../config.js')
,   server

function setup(port,fn){
    server = new Hapi.Server(port || config.port)
    routes(server)
    server.start(fn)
    return server
}