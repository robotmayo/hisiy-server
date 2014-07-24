var monk = require('monk')
,	db = monk('localhost/test-hisiy')
,	config = require('../config')
,	format = require('util').format
,	movieTemplate = require('./data/movie.template')
,	only = require('./only')

module.exports = function(server){
	// Public
	server.route(hapiRoute("GET","/list", getMediaList))
	server.route(hapiRoute("GET", "/seen", getSeenMedia))
	server.route(hapiRoute("GET", "/unseen", getUnseenMedia))

	// Auth/Admin
	server.route(hapiRoute("POST","/add/{type}", addMedia))
	server.route(hapiRoute("POST", "/seen/{id}", setSeen))
	server.route(hapiRoute("DELETE", "/remove/{id}", removeMedia))
	server.route(hapiRoute("POST", "/watching/{id}", setWatching))

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
	db.get('media')
	.insert(save)
	.then(function(doc){
		res(doc).code(201)
	})
	.then(null, function(doc){
		res({error : "Couldn't save media!"}).code(500)
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