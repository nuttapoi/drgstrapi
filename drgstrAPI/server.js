var express = require("express");
var cors = require("cors");
var bodyParser = require("body-parser");
var app = express();

var env = process.env.NODE_ENV || 'development';
var config = require('./config')[env];

const allowedOrigins = [
  'capacitor://localhost',
  'ionic://localhost',
  'http://localhost',
  'http://localhost:8080',
  'http://localhost:8100',
  'http://localhost:8200'
];

// Reflect the origin if it's in the allowed list or not defined (cURL, Postman, etc.)
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Origin not allowed by CORS'));
    }
  }
}

app.options('*', cors(corsOptions));
app.use(cors())
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

// CORS Middleware
//app.use(function (req, res, next) {
//Enabling CORS 
//res.header("Access-Control-Allow-Origin", "*");
//res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
//res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
//next();
//console.log(req.body);
//});

var index = require('./routes/index');
app.use('/', index);

//Setting up server
 var server = app.listen(config.server.port || 3000, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
 });



//Function to connect to database and execute query


//GET API
// app.get("/api/user", function(req , res){
// 	console.log("get contact");
//     var query = "select * from [tb_user]";
//     executeQuery(res, query);
// });