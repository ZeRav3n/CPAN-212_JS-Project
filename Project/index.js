const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const config = require('./config/database');
const cors = require('cors');

var movie_routes = require('./routes/movies');
var user_routes = require('./routes/users');

mongoose.connect(config.database);
let db = mongoose.connection;

db.once('open', function(){
    console.log('Connected to MongoDB');
});

db.on('error', function(err){
    console.log('DB Error');
});

const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static("public"));

app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {},
}));

require("./config/passport")(passport);
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
app.use(flash());

let Movie = require('./models/movie');

app.set("/views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.get("*", function(req, res, next){
    res.locals.user = req.user || null;
    next();
})
app.use("/users", user_routes);
app.use("/movie", movie_routes);

app.use("/", function(req, res){
    Movie.find({}, function(err, movies){
        if(err){
            console.log("error");
        }else{
            res.render("index", {
                title: "Movies",
                movies: movies
            });
        }
    });
});

app.listen(3000, function(){
    console.log("Server started on port 3000...");
});