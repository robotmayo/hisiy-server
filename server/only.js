module.exports = function only(source, test) {
    var isArr = Array.isArray
    ,	keys = Object.keys(test)
    ,	sType
    , 	tType
    , 	key
    , 	ret = {}

    for (var i = 0, l = keys.length; i < l; i++) {
        key = keys[i];
        sType = typeof source[key]
        tType = typeof test[key]
        if(isArr(test[key])){
            if(!isArr(source[key])){
                ret[key] = test[key].slice(0);
            }else{
               ret[key] = source[key].slice(0); 
            }
        }else if(tType === 'object'){
            if(sType !== 'object'){
                ret[key] = only({},test[key]); 
            }else{
                ret[key] = only(source[key],test[key]);
            }
        }else if(sType === tType){
            ret[key] = source[key];
        }else{
            ret[key] = test[key];
        }
    }
    return ret
}