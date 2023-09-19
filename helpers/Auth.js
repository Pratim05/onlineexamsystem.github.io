const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


const hashPassword = (password)=>{
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(10, (err,salt)=>{
            if(err){
                reject(err)
            }
            bcrypt.hash(password, salt ,(err,hash)=>{
                if(err){
                    reject(err)
                }
                resolve(hash)
            })

        })
    })
}

const comparePassword = (password, hashed)=>{
    return bcrypt.compare(password , hashed)
}

//Verify token

const authToken= (req, res, next) => {
    const token = req.cookies.jwt; // Assuming you're using cookies to store the token
    console.log('middleware Triggred')
    if (token) {
        jwt.verify(token, process.env.SECRET_KEY, (err, decodedToken) => {
            if (err) {
                res.redirect('/'); // Redirect to login page if token is invalid or expired
            } else {
                req.user = decodedToken; // Attach the decoded token payload to the request object
                next(); // Move on to the next middleware or route handler
            }
        });
    } else {
        res.redirect('/'); // Redirect to login page if token is not present
    }
};

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        // User is authenticated, allow access
        return next(); // User is authenticated, allow access
    }
    res.redirect('/'); // Redirect to login if not authenticated
  }
  
 




module.exports = {
    hashPassword,
    comparePassword,
    authToken,
    isAuthenticated
}