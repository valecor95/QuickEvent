## Defined REST APIs:
All Rest APIs are in "routes" folder, divided into four js files.
look at helpers/auth for ensureAuthenticated function

### index.js
  * #### '/'
    ***GET*** : home page, it shows all events in the DB created from all users

  * #### '/welcome'
    ***GET*** : showed after login

  * #### '/about'
    ***GET*** : standard about page


### auth.js
  * #### '/login'
    ***GET*** : to show login methods (local and oauth)

    ***POST*** : used only for local authentication, takes username and password from login form and authenticates users (manage by passport, see also passport.js)

  * #### '/register'
    ***GET*** : to show signup methods (local and oauth)

    ***POST*** : used only for local authentication, takes details from register form and create a new User on DB. it checks errors and shows them. It also executes the password's encryption via bcrypt

  * #### '/userPage'
    ***GET***: to show user page

  * #### '/facebook'
    ***GET***: to start facebook oauth via passport (see also passport.js)

  * #### '/facebook/callback'
    ***GET***:  if facebook auth fails it redirects on /login, else on /welcome

  * #### '/google'
    ***GET***: to start google oauth via passport (see also passport.js)

  * #### '/google/callback'
    ***GET***: if google auth fails it redirects on /login, else on /welcome

  * #### '/logout'
    ***GET***: to log out a user from the app and redirect on /login


### events.js
  * #### '/myevents'
    ***GET*** : to show user events. for first, events created by the user. Then, events joined by the user

  * #### '/createEvents'
    ***GET*** : to show the 'create new event' form

    ***POST*** : takes details from 'create new event' form, checks for errors and add the event in the DB. Then notify all users by AMQP

  * #### '/show/:id'
    ***GET*** : to show informations about the event selected by the :id. also provides join function and comments section

  * #### /user/:userId'
    ***GET*** : to show all events created by the user, selected by the :UserId

  * #### '/editEvent'
    ***GET*** : to show the 'edit event' form

  * #### ':id'
    ***PUT*** : to edit events. Takes details from 'create new event' form, checks for errors and add the event in DB. Then notify all users who joined the event by AMQP

    ***DELETE*** : to delete the event in the DB and remove it from users event joined list

  * #### '/comment/:id'
    ***POST*** : used in the show event page to add a new comment on the event and store it in the DB

  * #### '/join/:id'
    ***PUT*** : used in the show event page to join an event, if not already joined, and store it in the DB. Then notify all users who joined the even by AMQP

  * #### '/delete/:id'
    ***PUT*** : used in my events page to leave an event joined. Then notify the user who joined the even by AMQP



## Config folder

### keys.js
file used to contain services URI, ID and oauth secrets


### passport.js
used to contain passport oauth middlewares, the email is used as key id
  * #### 'local'
    used for local authentication. It also executes the password's encryption via bcrypt

  * #### 'facebook'
    provides access by facebook

  * #### 'facebook'
    provides access by google



## Helpers folder

### auth.js
  * #### ensureAuthenticated
    provides access to the route only if the user is logged in, otherwise flash an error message and redirect to login page


### hbs.js
  * #### stripTags
    to remove html syntax from output text

  * #### formatDate
    to format dates on output text


## Views folder
  - the view engine is based on handlebars and decorated with bootstrap and awesome icons
  - views are divided in the same way as routes. Plus there is layouts for main page, that provides connection to bootstrap, awesome icons and handle notifies and chat throw WebSocket and Socket.io.
  Partials provides the navbar and messages/errors sections



## Other folders 
  * models folder contains database schemas for users and events
  * public folder contains css files and images



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
