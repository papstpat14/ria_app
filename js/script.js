const TOKEN = "token=";
const USERNAME = "username=";

//TODO replace console logs
/*
test methods (temporary)
 */
function testLogin() {
    var username = $("#username").val();
    var password = $("#password").val();
    login(username, password);
}
function testGetCourseDetails() {
    var courseId = 1148;
    getCourseDetails(courseId);
}
function testGetCourseAssignments() {
    var courseId = 1148;
    getCourseAssignments(courseId);
}
function testGetCourseAssignmentGrades() {
    var courseId = 1148;
    var assignmentName = "P03 Final Product (before Feb, 4th, 2016)";
    getCourseAssignmentGrades(courseId, assignmentName);
}
//#####################################################################################################################

/**
 * tries to login in a user on moodle elearn
 * @param username
 * @param password
 */
function login(username, password) {
    if (username && password) {
        var url = "https://elearning.fh-joanneum.at/login/token.php?username=" + username +
            "&password=" + password + "&service=moodle_mobile_app";
        $.get(url, function (data, status) {
            if (data.token != null) {
                document.cookie = TOKEN + data.token;
                document.cookie = USERNAME + username;
                console.log("successfully logged-in");
            }
            else if (data.error != null)
                console.log("error: " + data.error);
            else
                console.log("other error");
        }).fail(function () {
            console.log("network error");
        });
    }
}

/**
 * logs out the user whilst deleting the token cookie
 */
function logout() {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

/**
 * gets all subscribed courses for the current user
 */
function getAllCourses() {
    var url = createUrl("core_user_get_users_by_field",  {"field":"username", "values[0]":getCookieByName(USERNAME)});
    if(url != null) {
        $.get(url, function(data, status) {
            if(data[0] != null && data[0].id != null) {
                url = createUrl("core_enrol_get_users_courses", {"userid":data[0].id});
                if(url != null) {
                    $.get(url, function(data, status) {
                        var courses = [];
                        data.forEach(function(item) {
                            var course = new Course(item.id, item.fullname);
                            courses.push(course);
                        });
                        console.log(courses);
                    }).fail(function() {
                        console.log("network error");
                    });
                }
                else
                    alert("invalid session error");
            }
            else
                console.log("other error");

        }).fail(function() {
            console.log("network error");
        });
    }
    else
        alert("invalid session error");
}

/**
 * gets all resources from a course
 *  - section with modules array which includes the resources
 * @param courseId
 */
function getCourseDetails(courseId) {
    var url = createUrl("core_course_get_contents", {"courseid": courseId});
    if (url != null) {
        $.get(url, function (data, status) {
            console.log(data);
        }).fail(function () {
            console.log("network error");
        });
    }
    else
        alert("invalid session error");
}

/**
 * gets all assignment details for a specific course
 * @param courseId
 */
function getCourseAssignments(courseId) {
    var url = createUrl("mod_assign_get_assignments", {"courseids[0]": courseId});
    if(url != null) {
        $.get(url, function(data, status) {
            var assignments = [];
            data.courses[0].assignments.forEach(function(item) {
                // multiplied by 1000 so that the argument is in milliseconds, not seconds.
                var duedate = new Date(item.duedate*1000);
                var assign = new Assignment(item.name, item.intro, duedate);
                assignments.push(assign);
            });
            console.log(data.courses[0].assignments);
        }).fail(function() {
            console.log("network error");
        });
    }
    else
        alert("invalid session error");
}

/**
 * gets the grade for a assignment with the given name in the specific course
 * @param courseId
 * @param assignmentName
 */
function getCourseAssignmentGrades(courseId, assignmentName) {
    var url = createUrl("core_user_get_users_by_field",  {"field":"username", "values[0]":getCookieByName(USERNAME)});
    if(url != null) {
        $.get(url, function(data, status) {
            if(data[0] != null && data[0].id != null) {
                var url = createUrl("gradereport_user_get_grades_table", {"userid":data[0].id, "courseid":courseId});
                if (url != null) {
                    $.get(url, function (data, status) {
                        var tabledata = data.tables[0].tabledata;
                        for(var i = 1; i < tabledata.length; i++) {
                            // searches for the name in the assignment
                            // unfortunately there is no other way to concatenate assignment with grade
                            if(tabledata[i].itemname.content.indexOf(assignmentName) != -1) {
                                var grade = new AssignmentGrade(
                                    tabledata[i].grade.content, tabledata[i].percentage.content);
                                console.log(grade);
                            }
                        }
                    }).fail(function () {
                        console.log("network error");
                    });
                }
                else
                    alert("invalid session error");
            }
            else
                console.log("other error");

        }).fail(function() {
            console.log("network error");
        });
    }
}

/**
 * concatenates the string for the REST API call
 * @param fname: the name of the function which should be called
 * @param params: the params which should be added to the function
 * @returns the concatenated string for the REST API on moodle
 *          or null if the token is unspecified
 */
function createUrl(fname, params) {
    var url = "https://elearning.fh-joanneum.at/webservice/rest/server.php?moodlewsrestformat=json&wsfunction=";
    url += fname;
    url += "&wstoken=";
    var token = getCookieByName(TOKEN);
    if(token == null)
        return null;
    url += token;
    for (var key in params) {
        if (params.hasOwnProperty(key))
            url += "&" + key + "=" + params[key];
    }
    return url;
}

/**
 * gets a cookie by name
 * @param name: the name of the cookie
 * @returns the cookie with the specified name or null if not found
 */
function getCookieByName(name) {
    var cookies = document.cookie.split(';');
    for(var i = 0; i < cookies.length; i++) {
        var c = cookies[i];
        while (c.charAt(0) == ' ')
            c = c.substring(1);
        if (c.indexOf(name) == 0)
            return c.substring(name.length,c.length);
    }
    return null;
}

function Course(id, name) {
    this.id = id;
    this.name = name;
}

function Assignment(name, desc, duedate) {
    this.name = name;
    this.desc = desc;
    this.duedate = duedate;
}

function AssignmentGrade(points, percentage) {
    this.points = points;
    this.percentage = percentage;
}