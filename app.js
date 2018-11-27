const express = require('express');
const exphbs = require('express-handlebars');   //front-end
const mongoose = require('mongoose');
const passport = require('passport');

const app = express();

//load user model
require('./models/User');

//Passport config
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());


//load routes
const index = require('./routes/index');
const events = require('./routes/events');
const users = require('./routes/users');
const auth = require('./routes/auth');


// Map global promise - get rid of warning
mongoose.Promise = global.Promise;
//connect to mongoose
mongoose.connect('mongodb://localhost/quickevent', {    //for now set to local
  useNewUrlParser: true
}).then(() => console.log('MongoDb Connected..'))      //use promise instead of callbacks for cleaner code
.catch(err => console.log(err));

//handlebars middleware
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');


//use routes
app.use('/', index)
app.use('/events', events);
app.use('/users', users);
app.use('/auth', auth);

const port = process.env.port || 5000;
app.listen(port, ()=>{
  console.log(`Server started on port ${port}`);
} );
