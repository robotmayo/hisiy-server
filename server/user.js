var db = require('./db')

function User(username){
	this.username = username
}

User.prototype.getPassword = function(username) {
	return db.get('hisiy-users').findOne({username : username || this.username})
}

User.prototype.save = function(password) {
	// TODO: Hash/Salt
	return db.get('hisiy-users').insert({username : username, password : password})
};