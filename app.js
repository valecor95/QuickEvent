const express = require('express');
const exphbs = require('express-handlebars');   //front-end
//const mongoose = require('mongoose');

const app = express();

//load routes
const index = require('./routes/index');
const events = require('./routes/events');
const users = require('./routes/users');

/*
// Map global promise - get rid of warning
mongoose.Promise = global.Promise;
//connect to mongoose
mongoose.connect('mongodb://localhost/quickevent', {    //for now set to local
  useNewUrlParser: true
})
.then(() => console.log('MongoDb Connected..'))      //use promise instead of callbacks for cleaner code
.catch(err => console.log(err));
*/

//handlebars middleware
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');


//use routes
app.use('/', index)
app.use('/events', events);
app.use('/users', users);

const port = process.env.port || 5000;
app.listen(port, ()=>{
  console.log(`Server started on port ${port}`);
} );
