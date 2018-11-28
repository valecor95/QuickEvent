//to control the access to a route
module.exports = {
  ensureAuthenticated: function(req, res, next){
    if(req.isAuthenticated()){
      return next();
    }
    req.flash('error_msg', 'Not authorized, log-in first');
    res.redirect('/auth/login');
  }
}
