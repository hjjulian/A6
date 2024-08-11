require('pg');
const Sequelize = require('sequelize');
var sequelize = new Sequelize('A6', 'A6_owner', 'rGO1Cw9jXYgu', {     
    host: 'ep-jolly-dawn-a5afftek.us-east-2.aws.neon.tech',     
    dialect: 'postgres',     
    port: 5432,     
    dialectOptions: { 
        ssl: { 
            rejectUnauthorized: false 
        } 
    }, 
    query: { raw: true } 
});

// Defining the Course model
const Course = sequelize.define('Course', {
    courseId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    courseCode: Sequelize.STRING,
    courseDescription: Sequelize.STRING
}, {
    tableName: 'courses',
    timestamps: false
});

// Defining the Student model
const Student = sequelize.define('Student', {
    studentNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressProvince: Sequelize.STRING,
    TA: Sequelize.BOOLEAN,
    status: Sequelize.STRING,
    course: {
        type: Sequelize.INTEGER,
        references: {
            model: Course,
            key: 'courseId'
        }
    }
}, {
    tableName: 'students',
    timestamps: false
});

// Define the relationship between Student and Course
Course.hasMany(Student, { foreignKey: 'course' });
Student.belongsTo(Course, { foreignKey: 'course' });

// Function to initialize the data collection by syncing the Sequelize models
function initialize() {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => {
                resolve();
            })
            .catch(err => {
                reject("Unable to sync the database: " + err);
            });
    });
}

// Function to get all students from the database
function getAllStudents() {
    return new Promise((resolve, reject) => {
        Student.findAll()
            .then(data => {
                resolve(data);
            })
            .catch(err => {
                reject("no results returned");
            });
    });
}

// Function to get all courses from the database
function getCourses() {
    return new Promise((resolve, reject) => {
        Course.findAll()
            .then(data => {
                resolve(data);
            })
            .catch(err => {
                reject("Error fetching courses: " + err);
            });
    });
}

// Function to get students by course from the database
function getStudentsByCourse(course) {
    return new Promise((resolve, reject) => {
        Student.findAll({ where: { course: course } })
            .then(data => {
                if (data.length > 0) {
                    resolve(data);
                } else {
                    reject("no results returned");
                }
            })
            .catch(err => {
                reject("no results returned");
            });
    });
}

// Function to get a student by student number from the database
function getStudentByNum(num) {
    return new Promise((resolve, reject) => {
        Student.findOne({ where: { studentNum: num } })
            .then(data => {
                if (data) {
                    resolve(data);
                } else {
                    reject("no results returned");
                }
            })
            .catch(err => {
                reject("no results returned");
            });
    });
}

// Function to add a student to the database
function addStudent(studentData) {
    return new Promise((resolve, reject) => {
        studentData.TA = (studentData.TA) ? true : false;
        
        for (let prop in studentData) {
            if (studentData[prop] === "") {
                studentData[prop] = null;
            }
        }

        Student.create(studentData)
            .then(() => {
                resolve();
            })
            .catch(err => {
                reject("unable to create student");
            });
    });
}

// Function to get a course by course ID from the database
function getCourseById(id) {
    return new Promise((resolve, reject) => {
        Course.findOne({ where: { courseId: id } })
            .then(data => {
                if (data) {
                    resolve(data);
                } else {
                    reject("no results returned");
                }
            })
            .catch(err => {
                reject("no results returned");
            });
    });
}

// Function to update a student in the database
function updateStudent(studentData) {
    return new Promise((resolve, reject) => {
        studentData.TA = (studentData.TA) ? true : false;

        for (let prop in studentData) {
            if (studentData[prop] === "") {
                studentData[prop] = null;
            }
        }

        Student.update(studentData, {
            where: { studentNum: studentData.studentNum }
        })
            .then(() => {
                resolve();
            })
            .catch(err => {
                reject("unable to update student");
            });
    });
}

// Function to add a course to the database
function addCourse(courseData) {
    return new Promise((resolve, reject) => {
        // Ensure any blank values in courseData are set to null
        for (let prop in courseData) {
            if (courseData[prop] === "") {
                courseData[prop] = null;
            }
        }

        Course.create(courseData)
            .then(() => {
                resolve();
            })
            .catch(err => {
                reject("unable to create course");
            });
    });
}

// Function to update a course in the database
function updateCourse(courseData) {
    return new Promise((resolve, reject) => {
        // Ensure any blank values in courseData are set to null
        for (let prop in courseData) {
            if (courseData[prop] === "") {
                courseData[prop] = null;
            }
        }

        Course.update(courseData, {
            where: { courseId: courseData.courseId }
        })
            .then(() => {
                resolve();
            })
            .catch(err => {
                reject("unable to update course");
            });
    });
}

// Function to delete a course by ID from the database
function deleteCourseById(id) {
    return new Promise((resolve, reject) => {
        Course.destroy({
            where: { courseId: id }
        })
            .then(() => {
                resolve();
            })
            .catch(err => {
                reject("unable to delete course");
            });
    });
}

function deleteStudentByNum(studentNum) {
    return new Promise((resolve, reject) => {
        Student.destroy({
            where: {
                studentNum: studentNum
            }
        })
        .then(() => resolve())
        .catch((err) => reject("Unable to delete student / Student not found"));
    });
}

module.exports = {
    initialize,
    getAllStudents,
    getCourses,
    getStudentsByCourse,
    getStudentByNum,
    addStudent,
    getCourseById,
    updateStudent,
    addCourse,
    updateCourse,
    deleteCourseById,
    deleteStudentByNum
};
