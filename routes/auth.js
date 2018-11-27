const express = require('express');
const router = express.Router();
const passport = require('passport');

//FACEBOOK authentication routes
router.get('/facebook',												
	  passport.authenticate('facebook', {scope : ['email'] })
);

router.get('/facebook/callback',										
	passport.authenticate('facebook', {
	    successRedirect : '/',
	    failureRedirect : './users/login'
	})
);

module.exports = router;


