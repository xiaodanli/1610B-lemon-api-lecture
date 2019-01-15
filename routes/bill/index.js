var mymongo = require('mymongo1610');

var mongo = require('mymongo1610/utils/getCollection.js');

//添加账单

function addBill(req,res,next){
    var params = req.body,
        uid = params.uid,
        timer = params.timer,
        icon = params.icon,
        intro = params.intro,
        type = params.type,
        money = params.money,
        cid = params.cid;

    if(!uid || !timer || !icon || !intro || !type || !money || !cid){
        return res.json({code:4,msg:'缺少参数'})
    }

    //1.是否有这个用户
    mymongo.find('userlist',{_id:uid},function(error,results){
        if(error){
            return res.json({code:0,msg:error});
        }

        if(results.length){
            //2.此分类是否存在
            isHasClassify();
        }else{
            res.json({code:2,msg:'此用户不存在'})
        }
    })

    function isHasClassify(){
        mymongo.find('classify-list',{_id:cid},function(error,results){
            if(error){
                return res.json({code:0,msg:error});
            }
            if(results.length){
                //添加账单
                addBillFun();
            }else{
                res.json({code:4,msg:'没有此分类，请创建分类'})
            }
        })
    }

    //添加账单

    function addBillFun(){
        //2018-11-12
        var data = {uid:uid,timer:new Date(timer),icon:icon,intro:intro,type:type,money:money,cid:cid};
        mymongo.insert('bill',data,function(error,results){
            if(error){
                res.json({code:0,msg:error});
            }else{
                res.json({code:1,msg:'添加成功'});
            }
        })
    }
}

//分两大类： 1》 按月查询 默认把符合月的账单全查出来  intro:{$in:['餐饮']}   2》按年查询

//获取账单

function getBill(req,res,next){
    var params = req.query,
        timer = params.timer,// 2018-10
        uid = params.uid,
        cids = params.cid;   // ['餐饮cid','水果cid','旅游cid']

    if(!timer || !uid){
        return res.json({code:4,msg:'丢失参数'});
    }

    var bigtimer = null;

    if(timer.indexOf('-') != -1){  
        //按月查  2018-12  ~~ 2019-01(不包括)  $lt 小于   $gte 大于等于   排序   
        var timerArr = timer.split('-');
        if(timerArr[1] == 12){
            bigtimer = (timerArr[0]*1+1) +'-01';
        }else{
            bigtimer = timerArr[0] +'-'+ (timerArr[1]*1+1);
        }
    }else{
        //按年查  2018 ~~ 2019(不包括)

        bigtimer = timer*1+1+'';  //2019
    }

    mongo('bill',function(error,db,cols){
        if(error){
            res.json({code:0,msg:error})
        }else{
            cols.find({$and:[{timer:{"$lt":new Date(bigtimer),"$gte":new Date(timer)}},{uid:uid},{cid:{$in:cids}}]}).sort({timer:1}).toArray(function(error,results){
                if(error){
                    res.json({code:0,msg:error});
                }else{
                    res.json({code:1,data:results});
                }
                db.close();
            })
        }
    })
}

//删除账单

function delBill(req,res,next){
    var lid = req.query.lid; //账单的id
    console.log(lid);

    mymongo.delete('bill',{_id:lid},function(error,results){
        if(error){
            res.json({code:0,msg:error});
        }else{
            res.json({code:1,msg:'删除成功'});
        }
    })
}

module.exports = {
    addBill:addBill,
    getBill:getBill,
    delBill:delBill
}