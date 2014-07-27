var TmdbApi = require('tmdb-node')
,	apikey = require('../apikey')
,	tmdb = new TmdbApi(apikey)
,	RateLimiter = require('limiter').RateLimiter
,	limiter = new RateLimiter(1,'second')
,	path = require('path')
,	fs = require('fs')
,	movieTemplate = require('./data/movie.template.js')
,	only = require('./only')
,	db = require('./db')
,	moment = require('moment')

module.exports = function(server){
	server.route(hapiRoute("POST","/add/{type}", addMedia))
	server.route(hapiRoute("POST", "/seen/{id}", setSeen))
	server.route(hapiRoute("DELETE", "/remove/{id}", removeMedia))
	server.route(hapiRoute("POST", "/watching/{id}", setWatching))
	server.route(hapiRoute("GET", "/search", searchMedia))
	server.route(hapiRoute("GET", "/movie/{id}", getMovie))
	server.route({
		method : 'GET',
		path : '/{path*}',
		handler : {
			directory : {
				path : path.resolve(__dirname,'../../','hisy-client'),
				listing : false,
				index : true
			}
		}
	})
}

function getMovie(req,res){
	limiter.removeTokens(1, function(err,remainingRequests){
		tmdb.movie(req.params.id).images(function(err,data){
			res(data).code(200)
		})
	})
}

function searchMedia(req,res){
	var searchQuery = req.query.query
	limiter.removeTokens(1, function(err, remainingRequests){
		tmdb.search('movie', searchQuery, function(err, data){
			res(data).code(200)
		})
	})
}

function addMedia(req,res){
	if(!validMediaType(req.params.type)){
		return res({
			error : format(
				config.ERRORS.INVALID_MEDIA_TYPE.MSG,
				req.params.type, 
				Object.keys(config.VALID_MEDIA).join(',').toLowerCase()
				)
		})
		.code(config.ERRORS.INVALID_MEDIA_TYPE.CODE)
	}else if(!req.payload){
		return res({error : config.ERRORS.MISSING_MEDIA.MSG})
		.code(config.ERRORS.MISSING_MEDIA.CODE)
	}
	var save = only(req.payload,movieTemplate)
	save.type = req.params.type
	save.addedOn = new Date()
	if(save.releaseDate != '') save.releaseDate = moment(save.releaseDate).toDate()
	console.log(save.posters)
	db.get('media')
	.insert(save)
	.then(function(doc){
		res(doc).code(201)
	})
	.then(null, function(doc){
		res({error : "Couldn't save media!"}).code(500)
	})
}

function setSeen(req,res){
	db.get('media')
	.findAndModify({_id : req.params.id}, {$set : {seen : true}})
	.then(function(doc){
		return res().code(200)
	})
	.then(null, function(err){
		return res({error : "ID does not exist"}).code(400)
	})
}

function setWatching(req,res){
	if(req.params.id.length < 24) return res({error : "ID does not exist"}).code(400)

	//TODO: Make not shitty
	db.get('media')
	.findById(req.params.id)
	.then(function(doc){
		db.get('media')
		.findAndModify({watching : true}, {watching : false, seen : true})
		.then(function(doc){
			db.get('media')
			.findById(req.params.id)
			.then(function(doc){
				res(doc).code(200)
			})
			.then(null, function(err){
				res({error : "This actually shouldn't throw an error?"}).code(400)
			})
		})
	})
	.then(null,function(err){
		res({error : "ID does not exist"}).code(400)
	})

}

function removeMedia(req,res){
	if(req.params.id.length < 24) return res({error : "ID does not exist"}).code(400)
	db.get('media')
	.remove({_id : req.params.id})
	.then(function(doc){
		res(doc).code(200)
	})
	.then(null,function(err){
		res({error : "ID does not exists"}).code(400)
	})
}

function validMediaType(media){
	return media === 'movie'
}


function hapiRoute(method,path,handler){
	return {method : method, path : path, handler : handler}
}