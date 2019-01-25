const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');       //front-end
const bodyParser = require('body-parser');          //to access at req.value
const methodOverride = require('method-override');  //needs for edit and delete
const flash = require('connect-flash');             //notification messages
const session = require('express-session');         //needs for flash
const mongoose = require('mongoose');               //database
const passport = require('passport');               //for authentication
const amqp = require('amqplib/callback_api');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

//load user model
require('./models/Event');
require('./models/User');

//Passport config
require('./config/passport')(passport);

//load routes
const index = require('./routes/index');
const events = require('./routes/events');
const auth = require('./routes/auth');
const chat = require('./routes/chat');

//load key
const keys = require('./config/keys.js');

//handlebars helpers
const {
  stripTags,
  formatDate
} = require('./helpers/hbs');


/********************************************************************************************************/
/*                     WebSocket and AMQP connection to handle CHAT and NOTIFIES                        */
/********************************************************************************************************/
io.on('connection', function(socket){

  // Handle notify event
  socket.on('notify', function(data){
      if(data != ''){
        amqp.connect(keys.amqpURI, function(err, conn) {
          conn.createChannel(function(err, ch) {
          var ex = 'notify';
              ch.assertExchange(ex, 'topic', {durable: false});

              ch.assertQueue(data, {exclusive: false}, function(err, q) {
                  console.log(" [*] Waiting for messages in %s", q.queue);
                  io.emit(data+"ack");  //Ack to sure the connection
                  ch.bindQueue(q.queue, ex, data);
                  ch.bindQueue(q.queue, ex, "all");
                  ch.consume(q.queue, function(msg) {
                    io.emit(data, msg.content.toString());
                    //console.log(" [x] %s", msg.content.toString());    
                  }, {noAck: true});
              });   
          });
        });
      }
  });
  

  // Download all prev messages
  socket.on('chatstart', function(data){
    if(data != ''){
      amqp.connect(keys.amqpURI, function(err, conn) {
        conn.createChannel(function(err, ch) {
        var ex = 'chat';
            ch.assertExchange(ex, 'topic', {durable: false});

            ch.assertQueue("chat"+data, {exclusive: false}, function(err, q) {
                console.log(" [*] Waiting for messages in %s", q.queue);
                ch.bindQueue(q.queue, ex, 'chat');
                ch.consume(q.queue, function(msg) {
                  io.emit("chat"+data, msg.content.toString());
                  //console.log(" [x] %s", msg.content.toString());
                }, {noAck: false});
            });
        });
        setTimeout(function() { conn.close();}, 3000);
      });
    }
  });
  
  // Handle message event
  socket.on('chat', function(msg){
    io.emit('chat', msg);
    // Send chat message to the main queue
    amqp.connect(keys.amqpURI, function(err, conn) {
      conn.createChannel(function(err, ch) {
        var ex = 'chat';
        var key = 'chat';
        ch.assertExchange(ex, 'topic', {durable: false});
        ch.publish(ex, key, new Buffer.from('<p><strong>' + msg.handle + ': </strong>' + msg.message + '</p>'));
      });
      setTimeout(function() { conn.close();}, 2000);
    });
  });

  // Handle typing event
  socket.on('typing', function(data){
    socket.broadcast.emit('typing', data);
  });

});
/*********************************************************************************************************
**********************************************************************************************************
**********************************************************************************************************/

// Map global promise - get rid of warning
mongoose.Promise = global.Promise;
//connect to mongoose
mongoose.connect(keys.mongoURI, {
  useNewUrlParser: true
})
  .then(() => console.log('MongoDb Connected..'))      //use promise instead of callbacks for cleaner code
  .catch(err => console.log(err));

//handlebars middleware
app.engine('handlebars', exphbs({
  helpers: {
    stripTags: stripTags,
    formatDate: formatDate
  },
  defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//method override middleware
app.use(methodOverride('_method'));

//espress session middleware
app.use(session({
  secret: 'ivagnescoretti',
  resave: true,
  saveUninitialized: true
}));

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//flash middleware
app.use(flash());

// Set global vars (for navbar and error messages)
app.use(function(req, res, next){
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

//use routes
app.use('/', index)
app.use('/events', events);
app.use('/auth', auth);
app.use('/chat', chat);

const port = process.env.port || 5000;
http.listen(port, ()=>{
  console.log(`Server started on port ${port}`);
} );