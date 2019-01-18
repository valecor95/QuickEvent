## Defined REST APIs:
All Rest APIs are in "routes" folder, divided into four js files.

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
