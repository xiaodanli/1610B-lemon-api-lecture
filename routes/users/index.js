var mongo = require('mymongo1610');

function addUser(req, res, next) {
    var nick_name = req.query.nick_name || '';
    mongo.insert('userlist',{nick_name:nick_name},function(error,results){
        if(error){
            res.json({code:0,msg:error})
        }else{
            res.json({code:1,data:results.insertedId})
        }
    })
}

module.exports = {
    addUser:addUser
}