var models=require('../models');
const config=require('./config/config.js');
const jwt=require('jsonwebtoken');
var authenticate = function(req,res,next){
	var token = req.header('x-auth');
	
	models.session.findOne({where:{token:token}}).then(session=>{

		if(!session){
			res.status(401).json({msg:'Unauthorized'});
		}
		else{
			var decoded;

		try{

			decoded= jwt.verify(token,config.secret);

			}catch(e){
				res.status(401).send();
		}
		if(decoded.id=session.userId){
			models.user.findOne({where:{id:decoded.id}}).then(user=>{
				req.user=user;
				next();
			})
			
		}
		else{
			res.status(401).json({msg:'Unauthorized'});
		}
		
	}
	});
}

module.exports=authenticate;