const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');

let User = require('../models/user');

router
    .route("/register")
    .get((req, res) => {
        res.render("register", {
            title: "Register"
        });
    })
    .post(async(req, res) => {
        await check("name", "Name is required").notEmpty().run(req);
        await check("email", "Email is required").notEmpty().run(req);
        await check("email", "Email is not valid").isEmail().run(req);
        await check("password", "Password is required").notEmpty().run(req);
        await check("confirm_password", "Confirm password is required")
        .notEmpty()
        .run(req);
      await check(
        "confirm_password",
        "Password and confirm password do not match"
      )
        .equals(req.body.password)
        .run(req);

    const errors = validationResult(req);
    if(errors.isEmpty()){
        let user = new User();
        user.name = req.body.name;
        user.email = req.body.email;
        user.password = req.body.password;

        bcrypt.genSalt(10, function(err, salt){
            bcrypt.hash(user.password, salt, function(err, hash){
                if(err){
                    console.log(err);
                }
                user.password = hash;
                user.save(function(err){
                    if(err){
                        console.log(err);
                        return;
                    }else{
                        req.flash("success", "You are now registered and can log in");
                        res.redirect("/users/login");
                    }
                });
            });
        });
    }else{
        res.render("register", {
            errors: errors.array()
        });
    }
});

router
    .route("/login")
    .get((req, res) => {
        res.render("login", {
            title: "Login"
        });
    })
    .post(async (req, res, next) => {
        await check("email", "Email is required").notEmpty().run(req);
        await check("email", "Email is not valid").isEmail().run(req);
        await check("password", "Password is required").notEmpty().run(req);

        const errors = validationResult(req);
        if(errors.isEmpty()){
            passport.authenticate("local", {
                successRedirect: "/",
                failureRedirect: "/users/login",
                failureFlash: true
            })(req, res, next);
        }else{
            res.render("login", {
                errors: errors.array()
            });
        }
    });
    
router.get("/logout", (req, res) => {
    req.logout(function(err){
        if(err){
            return next(err);
        }
        req.flash("success", "You are logged out");
        res.redirect("/users/login");
    });
});

module.exports = router;