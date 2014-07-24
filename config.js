module.exports = {
    port : 7890,
    ERRORS :{
    	INVALID_MEDIA_TYPE : {
    		MSG : "Invalid media type. You supplied %s. The supported types are %s.",
    		CODE : 400
    	},
    	MISSING_MEDIA : {
    		MSG : "You need to supply the media for addition!",
    		CODE : 400
    	}
    },
    VALID_MEDIA : {
    	MOVIE : "movie"
    }
}