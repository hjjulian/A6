/*********************************************************************************
*  WEB700 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Hannah Joy Julian Student ID: hjjulian - 152589230 Date: August 11, 2024
*Vercel Link: https://a6-xi.vercel.app/
*Github Link: https://github.com/hjjulian/A6
********************************************************************************/ 


var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var exphbs = require('express-handlebars');
var path = require("path");
const { initialize } = require("./modules/collegeData");
var collegeData = require("./modules/collegeData");

var app = express();

// Serve static files from the "public" directory
app.use(express.static('public'));
app.use(express.static(__dirname + "/public/"));
app.set('views', path.join(__dirname, 'views'));

// Setup Handlebars with custom helpers
const hbs = exphbs.create({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') + 
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');


// This is a middleware function to set the activeRoute property in app.locals
app.use(function(req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    next();
});


// Add body-parser middleware
app.use(express.urlencoded({ extended: true }));

// GET /students
app.get("/students", (req, res) => {
    if (req.query.course) {
        collegeData.getStudentsByCourse(req.query.course)
            .then(data => {
                if (data.length > 0) {
                    res.render("students", { students: data });
                } else {
                    res.render("students", { message: "no results" });
                }
            })
            .catch(err => {
                res.render("students", { message: "no results" });
            });
    } else {
        collegeData.getAllStudents()
            .then(data => {
                if (data.length > 0) {
                    res.render("students", { students: data });
                } else {
                    res.render("students", { message: "no results" });
                }
            })
            .catch(err => {
                res.render("students", { message: "no results" });
            });
    }
});

// GET /courses
app.get("/courses", (req, res) => {
    collegeData.getCourses()
        .then(data => {
            if (data.length > 0) {
                res.render("courses", { courses: data });
            } else {
                res.render("courses", { message: "no results" });
            }
        })
        .catch(err => {
            res.render("courses", { message: "no results" });
        });
});

// GET /
app.get("/", (req, res) => {
    res.render('home');
});

// GET /about
app.get("/about", (req, res) => {
    res.render('about');
});

// GET /htmlDemo
app.get("/htmlDemo", (req, res) => {
    res.render('htmlDemo');
});

// GET /students/add
app.get("/students/add", (req, res) => {
    collegeData.getCourses()
        .then((data) => {
            res.render("addStudent", { courses: data });
        })
        .catch((err) => {
            res.render("addStudent", { courses: [] });
        });
});


// POST /students/add
app.post("/students/add", (req, res) => {
    collegeData.addStudent(req.body)
        .then(() => {
            res.redirect("/students");
        })
        .catch(err => {
            res.status(500).send("Unable to add student");
        });
});

// GET /course/:id
app.get("/course/:id", (req, res) => {
    collegeData.getCourseById(req.params.id)
        .then(data => {
            res.render("course", { course: data });
        })
        .catch(err => {
            res.status(404).send("Course not found");
        });
});

// GET /student/:studentNum
app.get("/student/:studentNum", (req, res) => {
    // Initialize an empty object to store the values
    let viewData = {};

    collegeData.getStudentByNum(req.params.studentNum)
        .then((studentData) => {
            if (studentData) {
                viewData.student = studentData; // Store student data in the "viewData" object as "student"
            } else {
                viewData.student = null; // Set student to null if none were returned
            }
        })
        .catch((err) => {
            viewData.student = null; // Set student to null if there was an error
        })
        .then(() => {
            return collegeData.getCourses();
        })
        .then((courseData) => {
            viewData.courses = courseData; // Store course data in the "viewData" object as "courses"

            // Loop through viewData.courses and once we have found the courseId that matches
            // the student's "course" value, add a "selected" property to the matching
            // viewData.courses object
            for (let i = 0; i < viewData.courses.length; i++) {
                if (viewData.courses[i].courseId == viewData.student.course) {
                    viewData.courses[i].selected = true;
                }
            }
        })
        .catch((err) => {
            viewData.courses = []; // Set courses to empty if there was an error
        })
        .then(() => {
            if (viewData.student == null) { // If no student, return an error
                res.status(404).send("Student Not Found");
            } else {
                res.render("student", { viewData: viewData }); // Render the "student" view
            }
        });
});


// POST /student/update
app.post("/student/update", (req, res) => {
    collegeData.updateStudent(req.body)
        .then(() => {
            res.redirect("/students");
        })
        .catch(err => {
            res.status(500).send("Unable to update student");
        });
});

// GET /courses/add
app.get("/courses/add", (req, res) => {
    res.render("addCourse");
});

// POST /courses/add
app.post("/courses/add", (req, res) => {
    collegeData.addCourse(req.body)
        .then(() => {
            res.redirect("/courses");
        })
        .catch(err => {
            res.status(500).send("Unable to add course");
        });
});

// POST /course/update
app.post("/course/update", (req, res) => {
    collegeData.updateCourse(req.body)
        .then(() => {
            res.redirect("/courses");
        })
        .catch(err => {
            res.status(500).send("Unable to update course");
        });
});

// GET /course/delete/:id
app.get("/course/delete/:id", (req, res) => {
    collegeData.deleteCourseById(req.params.id)
        .then(() => {
            res.redirect("/courses");
        })
        .catch(err => {
            res.status(500).send("Unable to Remove Course / Course not found");
        });
});

// GET /student/delete/:studentNum
app.get("/student/delete/:studentNum", (req, res) => {
    collegeData.deleteStudentByNum(req.params.studentNum)
        .then(() => {
            res.redirect("/students");
        })
        .catch(err => {
            res.status(500).send("Unable to Remove Student / Student not found");
        });
});

// 404 Error
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "/views/404.html"));
});

// Initialize and start the server
collegeData.initialize()
    .then(() => {
        app.listen(HTTP_PORT, () => {
            console.log("server listening on port: " + HTTP_PORT);
        });
    })
    .catch((err) => {
        console.log("Unable to start server: " + err);
    });

module.exports = app;
