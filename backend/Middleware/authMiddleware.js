// const jwt = require('jsonwebtoken')
// require('dotenv').config()
// console.log(process.env.SECRET_KEY)
// const authMiddleware=(req,res,next)=>{
//  console.log("helllloo",req.headers)
//     const token = req.headers['authorization']
//     console.log("hiii..",token)
//     if(token){
//         jwt.verify(token,process.env.SECRET_KEY,(err,decode)=>{
//           if(err){
//             return res.status(403).send('Token is invalid')

//           }
//           req.userId=decode.userId
//           next()
//         })
//     }else{
//         res.status(403).send("no token provided")
//     }
//   }
//   module.exports= authMiddleware





const jwt = require('jsonwebtoken');
require('dotenv').config();
const auth={
 authMiddleware: (req, res, next) => {

  console.log(req.body)
  // Fix: read 'authorization' in lowercase
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(403).send("No token provided");
  }


  const token = authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, process.env.SECRET_KEY, (err, decode) => {
      if (err) {


        return res.status(403).send('Token is invalid');
      }

      req.userId = decode.userId;
      next();
    });
  } else {
    res.status(403).send("No token provided");
  }
},



uploadauthMiddleware : (req, res, next) => {

   // Fix: read 'authorization' in lowercase
  const authHeader = req.body.headers['Authorization'];

  if (!authHeader) {
    return res.status(403).send("No token provided");
  }


  const token = authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, process.env.SECRET_KEY, (err, decode) => {
      if (err) {


        return res.status(403).send('Token is invalid');
      }

      req.userId = decode.userId;
      console.log("hello.....",req.userId)
      next();
    });
  } else {
    res.status(403).send("No token provided");
  }
}
}
module.exports=auth
