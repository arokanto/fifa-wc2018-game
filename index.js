const express   = require('express')
const nunjucks  = require('nunjucks')
const path      = require('path')
const dotenv    = require('dotenv')
const session   = require('express-session')

// Read environment variables from .env file
dotenv.config()

// Set up the app
var app = express()

// Set up the Nunjucks templating engine
nunjucks.configure('views', {
  autoescape: true,
  cache: false,
  express: app
});
app.set('view engine', 'nunjucks')

// Serve everything under /public as static files
app.use(express.static(path.join(__dirname, 'public')))

// Use body parser as JSON
app.use(express.json());

// Set up sessions
app.use(
  session({
    store: new (require('connect-pg-simple')(session))(),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
  })
)

// Authenticate all requests
app.all('*',          require('./global/session'))

// Set up routes
app.use('/',          require('./routes/index'))
app.use('/data',      require('./routes/data'))
app.use('/save',      require('./routes/save'))
app.use('/load',      require('./routes/load'))
app.use('/login',     require('./routes/login'))
app.use('/logout',    require('./routes/logout'))
app.use('/register',  require('./routes/register'))

// Start listening to requests
port = process.env.PORT || 8000
app.listen(port, (port) => console.log('App listening at port ' + port))