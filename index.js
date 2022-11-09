const express = require('express');
const bodyParser = require('body-parser');
const exphb = require('express-handlebars');
const session = require('express-session');
const flash = require('express-flash');
const ShortUniqueId = require('short-unique-id');
const pgp = require('pg-promise')();

const WaitersDB = require('./waiters-database');

const app = express();

//setting up handlebars
app.engine('handlebars', exphb.engine({defaultLayout : false}));
app.set('view engine', 'handlebars');
//setting up body-parser
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json());

const uid = new ShortUniqueId({ length: 5 });

// database connection 
const DATABASE_URL =  process.env.DATABASE_URL || 'postgresql://waiter_admin:waiters@localhost:5432/waiters_app'

// const conString = "postgres://YourUserName:YourPassword@YourHostname:5432/YourDatabaseName";

const config = {
    connectionString: DATABASE_URL
}

if(process.env.NODE_ENV === 'production'){
    config.ssl ={
        rejectUnauthorized : false
    }
}

const db = pgp(config);

const waiterDB = WaitersDB(db)
// express flash and sessions
app.use(session({
    secret: 'Dikgang',
    resave: false,
    saveUninitialized: true, 
    cookie: {maxAge: 60000}
  }));
app.use(flash());

app.use(express.static('public'));

app.get('/',(req,res)=>{

  if(!req.session.user){
    res.redirect('/login')
    return;
}
  res.render('index')
})

app.post('/register', async (req,res)=>{
  const code = uid();
  const {waiter} = req.body;
  const checkDuplicate = await waiterDB.findDuplicate(waiter);

  if(!waiter){
    req.flash('error','Please enter a name and press the register button')
  } else if(waiter){

    if( Number(checkDuplicate) != 0){
      req.flash('error','Waiter already registered')
    } else{
      waiterDB.register(waiter,code);
      req.flash('success',`Waiter registered, use the code to log in. CODE : ${code}`)
    }
  }
  res.redirect('/register')
})

app.get('/register',(req,res)=>{
  res.render('register');
})

app.post('/login', async (req,res)=>{

  const {login_code} = req.body;
  const user = await waiterDB.getUserByCode(login_code);

  if(!login_code){
    req.flash('error','Please enter a code and press the login button')
  } else if(login_code){
    if(user){
      req.session.user = user;
      console.log(req.session.user = user);
      res.redirect('/');
      return
  }
  }

  res.render('login')
})

app.get('/login',(req,res)=>{
  res.render('login')
})

const PORT = process.env.PORT || 3011
app.listen(PORT, ()=>{
    console.log('the server started at port:', PORT)
})