const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const bcrypt = require('bcryptjs');

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({usernameField: "email"}, function(
            email, password, done) {
                let query = {email: email};
                User.findOne(query, function(err, user){
                    if(err){
                        console.log(err);
                    }
                    if(!user){
                        return done(null, false, {message: "No user found"});
                    }
                    bcrypt.compare(password, user.password, function(err, isMatch){
                        if(err){
                            console.log(err);
                        }
                        if(isMatch){
                            return done(null, user);
                        } else {
                            return done(null, false, {message: "Wrong password"});
                        }
                    });
                });
            })
        );
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
    passport.deserializeUser(function(id, done) {
        User.findOne(id, function(err, user){
            if(err){
                done(null, false, {error: err});
            }
            done(err, user);
        });
    });
};