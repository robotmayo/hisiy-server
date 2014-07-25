var db = require('./db')
,	config = require('../config')
,	format = require('util').format
,	movieTemplate = require('./data/movie.template')
,	only = require('./only')
,	adminRoutes = require('./admin-routes')

module.exports = function(server){
	// Public
	server.route(hapiRoute("GET","/list", getMediaList))
	server.route(hapiRoute("GET", "/seen", getSeenMedia))
	server.route(hapiRoute("GET", "/unseen", getUnseenMedia))

	// Auth/Admin
	adminRoutes(server)

}

function getSeenMedia(req,res){
	db.get('media')
	.find({seen : true})
	.then(function(docs){
		res(docs).code(200)
	})
	.then(null, function(err){
		res({error : "Uh oh something went wrong"}).code(500)
	})
}

function getUnseenMedia(req,res){
	db.get('media')
	.find({seen : false})
	.then(function(docs){
		res(docs).code(200)
	})
	.then(null, function(err){
		res({error : "Uh oh something went wrong"}).code(500)
	})
}

function getMediaList(req,res){
	db.get('media')
	.find({})
	.then(function(docs){
		res(docs)
	})
	.then(null,function(err){
		res({error : "Couldn't get list."}).code(500)
	})
}

function validMediaType(media){
	return media === 'movie'
}


function hapiRoute(method,path,handler){
	return {method : method, path : path, handler : handler}
}