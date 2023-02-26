const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const movie = require('../models/movie');

let Movie = require('../models/movie');
let User = require('../models/user');

let genres = [
    "Action",
    "Adventure",
    "Animation",
    "Biography",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Family",
    "Fantasy",
    "Film-Noir",
    "Game-Show",
    "History",
    "Horror",
    "Music",
    "Musical",
    "Mystery",
    "News",
    "Reality-TV",
    "Romance",
    "Sci-Fi",
    "Sport",
    "Talk-Show",
    "Thriller",
    "War",
    "Western"
];

router
    .route("/add")
    .get(ensureAuthenticated, (req, res) => {
        res.render("add_movie", {
            title: "Add Movie",
            genres: genres
        });
    })
    .post(ensureAuthenticated, async(req, res) => {
        await check("name", "Name is required").notEmpty().run(req);
        await check("description", "Description is required").notEmpty().run(req);
        await check("year", "Year is required").notEmpty().run(req);
        await check("genres", "Genres is required").notEmpty().run(req);
        await check("rating", "Rating is required").notEmpty().run(req);

        const errors = validationResult(req);
        if(errors.isEmpty()){
            let movie = new Movie();
            movie.name = req.body.name;
            movie.description = req.body.description;
            movie.year = req.body.year;
            movie.genres = req.body.genres;
            movie.rating = req.body.rating;
            movie.posted_by = req.user.id;

            movie.save(function(err){
                if(err){
                    console.log(err);
                    return;
                }else{
                    req.flash("success", "Movie Added");
                    res.redirect("/");
                }
            });
        }else{
            res.render("add_movie",{
                errors: errors.array(),
                genres: genres,
            });
        }
        });
router
    route("/:id")
    .get((req, res) => {
        Movie.findById(req.params.id, function(err, movie){
            User.findById(movie.posted_by, function(err, user){
                if(err){
                    console.log(err);
                }
                res.render("movie", {
                    movie: movie,
                    posted_by: user.name
            });
        });
    });
})
    .delete((req, res) => {
        if(!req.user._id){
            res.status(500).send();
        }
        let query = {_id: req.params.id};
        Movie.findById(req.params.id, function(err, movie){
            if(movie.posted_by != req.user._id){
                res.status(500).send();
            }else{
                Movie.deleteOne(query, function(err){
                    if(err){
                        console.log(err);
                    }
                    res.send("Success");
                });
            }
        });
    });
router
    .route("/edit/:id")
    .get(ensureAuthenticated, (req, res) => {
        Movie.findById(req.params.id, function(err, movie){
            if(movie.posted_by != req.user._id){
                req.flash("danger", "Not Authorized");
                res.redirect("/");
            }
            res.render("edit_movie", {
                title: "Edit Movie",
                movie: movie,
                genres: genres
            });
        });
    })
    .post(ensureAuthenticated, async(req, res) => {
        let movie = {};
        movie.name = req.body.name;
        movie.description = req.body.description;
        movie.year = req.body.year;
        movie.genres = req.body.genres;
        movie.rating = req.body.rating;
        let query = {_id: req.params.id};

        Movie.findById(req.params.id, function(err, movie_db){
            if(movie_db.posted_by != req.user._id){
                req.flash("danger", "Not Authorized");
                res.redirect("/");
            }else{
                Movie.updateOne(query, movie, function(err){
                    if(err){
                        console.log(err);
                        return;
                    }else{
                        req.flash("success", "Movie Updated");
                        res.redirect("/");
                    }
                });
            }
        });
    });

function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }else{
        req.flash("danger", "Please login");
        res.redirect("/users/login");
    }
}

module.exports = router;