## Defined REST APIs:
All Rest APIs are in "routes" folder, divided into four js files.
### - auth.js
  * #### '/login'
    ***GET*** : to show login methods (local and oauth)
    ***POST*** : used only for local authentication, takes username and password from login form and authenticates users (manage by passport, see also passport.js) 

  * #### '/register'
    ***GET*** : to show signup methods (local and oauth)
    ***POST*** : used only for local authentication, takes details from register form and create a new User on DB. it checks errors and shows them. It also executes the password's encryption via bcrypt.
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
    ***GET***: to log out a user from the app and redirect on /login. 

## Structure

.
├── app.js
├── config
│   ├── keys.js
│   └── passport.js
├── helpers
│   ├── auth.js
│   └── hbs.js
├── models
│   ├── Event.js
│   └── User.js
├── package.json
├── package-lock.json
├── public
│   ├── css
│   │   ├── chat.css
│   │   └── style.css
│   └── image
│       └── qelogo.jpg
├── README.md
├── routes
│   ├── auth.js
│   ├── chat.js
│   ├── events.js
│   └── index.js
└── views
    ├── auth
    │   ├── login.handlebars
    │   ├── register.handlebars
    │   └── userPage.handlebars
    ├── chat
    │   └── chat.handlebars
    ├── events
    │   ├── createEvent.handlebars
    │   ├── editEvent.handlebars
    │   ├── myEvents.handlebars
    │   ├── show.handlebars
    │   └── userEvents.handlebars
    ├── index
    │   ├── about.handlebars
    │   ├── home.handlebars
    │   └── welcome.handlebars
    ├── layouts
    │   └── main.handlebars
    └── partials
        ├── _errors.handlebars
        ├── _msg.handlebars
        ├── _navbar.handlebars
        └── _notify.handlebars
