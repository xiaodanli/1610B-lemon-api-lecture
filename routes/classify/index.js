var mongo = require('mymongo1610');

//获取分类图标
function getIcons(req,res,next){
    mongo.find('iconlist',function(error,results){
        if(error){
            res.json({code:0,msg:err})
        }else{
            res.json({code:1,data:results})
        }
    })
}

//查询分类
function getClassify(req,res,next){
    var uid = req.query.uid;
    if(uid){
        // $or:[{uid:'*'},{uid:uid}]
        mongo.find('classify-list',{uid:{$in:['*',uid]}},function(error,results){
            if(error){
                res.json({code:0,msg:error})
            }else{
                res.json({code:1,data:results})
            }
        })
    }else{
        res.json({code:4,msg:'缺少参数'})
    }    
}

//添加分类

function addClassify(req,res,next){
    var params = req.body,
        intro = params.intro,
        icon = params.icon,
        type = params.type,
        uid = params.uid;

    if(!uid || !icon || !type || !intro){
        return res.json({code:4,msg:'缺少参数'})
    }

    //1.去userlist集合去查此用户是否存在

    //2.去classify-list集合查此分类是否已经存在  uid (* uid)   type 旅游  支出    

    mongo.find('userlist',{_id:uid},function(error,results){
        if(error){
            return res.json({code:0,msg:error});
        }

        if(results.length){
            //此分类是否存在
            isHasClassify();
        }else{
            res.json({code:2,msg:'此用户不存在'})
        }
    })

    function isHasClassify(){
        mongo.find('classify-list',{$and:[{type:type},{intro:intro},{uid:{$in:['*',uid]}}]},function(error,results){
            if(error){
                return res.json({code:0,msg:error});
            }
            if(results.length){
                res.json({code:3,msg:'此分类已存在'})
            }else{
                //添加分类
                addClassifyFun();
            }
        })
    }

    function addClassifyFun(){
        mongo.insert('classify-list',params,function(error,results){
            if(error){
                return res.json({code:0,msg:error});
            }

            res.json({code:1,msg:'添加成功'})
        })
    }
}

module.exports = {
    getIcons:getIcons,
    getClassify:getClassify,
    addClassify:addClassify
}