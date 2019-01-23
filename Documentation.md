## Defined REST APIs:
All Rest APIs are in "routes" folder, divided into four js files.
look at helpers/auth for ensureAuthenticated function

### index.js
  * ***GET '/'*** : home page, it shows all events in the DB created from all users

  * ***GET '/welcome'*** : welcome page showed after login

  * ***GET '/about'*** : standard about page


### auth.js
  * ***GET '/login'*** : to show login methods (local and oauth)

  * ***POST '/login'*** : used only for local authentication, takes username and password from login form and authenticates users (manage by passport, see also passport.js)

  * ***GET '/register'*** : to show signup methods (local and oauth)

  * ***POST '/register'*** : used only for local authentication, takes details from register form and create a new User on DB. it checks errors and shows them. It also executes the password's encryption via bcrypt

  * ***GET '/userPage'*** : to show user page

  * ***GET '/facebook'*** : to start facebook oauth via passport (see also passport.js)

  * ***GET '/facebook/callback'*** :  if facebook auth fails it redirects on /login, else on /welcome

  * ***GET '/google'*** : to start google oauth via passport (see also passport.js)

  * ***GET '/google/callback'*** : if google auth fails it redirects on /login, else on /welcome

  * ***GET '/logout'*** : to log out a user from the app and redirect on /login


### events.js
  * ***GET '/myevents'*** : to show user events. For first, events created by the user. Then, events joined by the user

  * ***GET '/createEvents'*** : to show the 'create new event' form

  * ***POST '/createEvents'*** : takes details from 'create new event' form, checks for errors and add the event in the DB. Then notify all users by AMQP

  * ***GET '/show/:id'*** : to show informations about the event selected by the :id. also provides join function and comments section

  * ***GET /user/:userId'*** : to show all events created by the user, selected by the :UserId

  * ***GET '/editEvent'*** : to show the 'edit event' form

  * ***PUT ':id'*** : to edit events. Takes details from 'create new event' form, checks for errors and add the event in DB. Then notify all users who joined the event by AMQP

  * ***DELETE ':id'*** : to delete the event in the DB and remove it from users event joined list

  * ***POST '/comment/:id'*** : used in the show event page to add a new comment on the event and store it in the DB

  * ***PUT '/join/:id'*** : used in the show event page to join an event, if not already joined, and store it in the DB. Then notify the user who created the event by AMQP

  * ***PUT '/delete/:id'*** : used in my events page to leave an event joined. Then notify the user who created the event by AMQP


### chat.js
  * ***GET '/chat'*** : to show chat page

## Config folder

### keys.js
file used to contain services URI, ID and oauth secrets


### passport.js
used to contain passport middleware functions, the email is used as key id
  * ***'local'*** : used for local authentication. It also executes the password's encryption via bcrypt

  * ***'facebook'*** : provides access by facebook

  * ***'facebook'*** : provides access by google

  * ***'serializeUser'*** : to get information from a user object to store in a session

  * ***'deserializeUser'*** : to take that information and turn it back into a user object



## Helpers folder

### auth.js
  * ***ensureAuthenticated*** : provides access to the route only if the user is logged in, otherwise flash an error message and redirect to login page


### hbs.js
  * ***stripTags*** : to remove html syntax from output text

  * ***formatDate*** : to format dates on output text


## Views folder
  - the view engine is based on handlebars and decorated with bootstrap and awesome icons
  - views are divided in the same way as routes. Plus there is layouts for main page, that provides connection to bootstrap, awesome icons and handle notifies and chat throw WebSocket and Socket.io.
  Partials provides the navbar and messages/errors sections



## Other folders and app.js
  * "models" folder contains database schemas for users and events
  * "public" folder contains css files and images
  * **app.js** is the main file, first establish connection with mongoDB and amqp and manages the socket.io connection. Set the view engine, middlewares, global variables and the static folder. Then starts the server


## How QuickEvent use AMQP and Socket.io (WebSocket)
Our application is provided with a chat service and a real-time notification. This with the use of AMQP (Rabbit MQ) and Socket.io (WebSockets).

### Chat service
In this service we use Socket.io (that use WebSockets) for allows the real-time exchange of messages.
AMQP is used for save all messages and download it when a user refresh the page. We have a topic exchange called "chat" and a queue for each user called "chat+email". (Note: email is a primary key in the app)

Everything is managed by the event based programming of Socket.io in this way:

* **Connection and Download of messages**
1) When a user open "chat" page send an event called "chatstart" that request the connection:

![img chatconnection-client](http://i67.tinypic.com/2cyfqk8.png)

2) Server receives a "chatstart" event and open an AMQP connection, bind the named queue "chat+email" (where email is the email of the user that requested the connection), download all messages from the queue and finally send it to the client via Socket.io (WS):

![img chatstart-server](http://i64.tinypic.com/16c17xw.png)

3) Client receives "chat+email" and prints all downloaded messages in chat page:

![img handle-chat+email-client](http://i64.tinypic.com/s6sigl.png)

* **Exchange of messages**
1) While a user writes a message client send a "typing" event to server:

![img typing-client](http://i64.tinypic.com/2e4kfna.png)

2) Server receives "typing" event and send a "typing" event to all user connected except me:

![img typing-server](http://i67.tinypic.com/16lh5io.png)

3) Client receive "typing" event and print "name is typing a message...":

![img handle-typing-event](http://i67.tinypic.com/2s6kar9.png)

## Structure
```
.
├── app.js
├── config
│   ├── keys.js
│   └── passport.js
├── helpers
│   ├── auth.js
│   └── hbs.js
├── models
│   ├── Event.js
│   └── User.js
├── package.json
├── package-lock.json
├── public
│   ├── css
│   │   ├── chat.css
│   │   └── style.css
│   └── image
│       └── qelogo.jpg
├── README.md
├── routes
│   ├── auth.js
│   ├── chat.js
│   ├── events.js
│   └── index.js
└── views
    ├── auth
    │   ├── login.handlebars
    │   ├── register.handlebars
    │   └── userPage.handlebars
    ├── chat
    │   └── chat.handlebars
    ├── events
    │   ├── createEvent.handlebars
    │   ├── editEvent.handlebars
    │   ├── myEvents.handlebars
    │   ├── show.handlebars
    │   └── userEvents.handlebars
    ├── index
    │   ├── about.handlebars
    │   ├── home.handlebars
    │   └── welcome.handlebars
    ├── layouts
    │   └── main.handlebars
    └── partials
        ├── _errors.handlebars
        ├── _msg.handlebars
        ├── _navbar.handlebars
        └── _notify.handlebars
```
