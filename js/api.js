const TOKEN = "token=";
const USERNAME = "username=";

//TODO replace console logs with actual logic
/*
test methods (temporary)
 */
function testLogin() {
    var username = $("#username").val();
    var password = $("#password").val();
    login(username, password, function (data) {
        console.log(data);
    });
}
function testGetAllCourses() {
    getAllCourses(function(data) {
        console.log(data);
    });
}
function testGetCourseDetails() {
    var courseId = 1148;
    getCourseDetails(courseId, function(data) {
        console.log(data);
    });
}
function testGetCourseAssignments() {
    var courseId = 1148;
    getCourseAssignments(courseId, function(data) {
        console.log(data);
    });
}
function testGetCourseAssignmentGrade() {
    var courseId = 1148;
    var assignmentName = "P03 Final Product (before Feb, 4th, 2016)";
    getCourseAssignmentGrade(courseId, assignmentName, function(data) {
        console.log(data);
    });
}
//#####################################################################################################################

/**
 * tries to login in a user on moodle elearn
 * @param username
 * @param password
 * @param callback
 */
function login(username, password, callback) {
    if (username && password) {
        var url = "https://elearning.fh-joanneum.at/login/token.php?username=" + username +
            "&password=" + password + "&service=moodle_mobile_app";
        $.get(url, function (data, status) {
            if (data.token != null) {
                document.cookie = TOKEN + data.token + "; Path=/;";
                document.cookie = USERNAME + username + "; Path=/;";
                callback("successfully logged-in");
            }
            else if (data.error != null)
                callback(new Error("error: " + data.error));
            else
                callback(new Error("other error"));
        }).fail(function () {
            callback(new Error("network error"));
        });
    }
}

/**
 * logs out the user whilst deleting the token cookie
 */
function logout() {
    document.cookie = TOKEN + "; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    document.cookie = USERNAME + "; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}
/**
 * Checks if the user is logged in
 * @returns {boolean} whether or not the user is logged in
 */
function isLoggedIn(){
    return getCookieByName(TOKEN)!=null && getCookieByName(TOKEN)!=undefined;
}

/**
 * gets all subscribed courses for the current user
 * @param callback
 */
function getAllCourses(callback) {
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
                            // sorts course name alphabetically
                            courses.sort(function(a, b) {
                                return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);
                            });
                        });
                        callback(courses);
                    }).fail(function() {
                        callback(new Error("network error"));
                    });
                }
                else
                    callback(new Error("invalid session error"));
            }
            else
                callback(new Error("other error"));

        }).fail(function() {
            callback(new Error("network error"));
        });
    }
    else
        callback(new Error("invalid session error"));
}

/**
 * gets all resources from a course
 *  - section with modules array which includes the resources
 * @param courseId
 * @param callback
 */
function getCourseDetails(courseId, callback) {
    var url = createUrl("core_course_get_contents", {"courseid": courseId});
    if (url != null) {
        $.get(url, function (data, status) {
            callback(data);
        }).fail(function () {
            callback(new Error("network error"));
        });
    }
    else
        callback(new Error("invalid session error"));
}

/**
 * gets all assignment details for a specific course
 * @param courseId
 * @param callback
 */
function getCourseAssignments(courseId, callback) {
    var url = createUrl("mod_assign_get_assignments", {"courseids[0]": courseId});
    if(url != null) {
        $.get(url, function(data, status) {
            var assignments = [];
            data.courses[0].assignments.forEach(function(item) {
                // multiplied by 1000 so that the argument is in milliseconds, not seconds.
                var duedate = item.duedate ? new Date(item.duedate*1000) : null;
                var assign = new Assignment(item.name, item.intro, duedate);
                assignments.push(assign);
            });
            callback(assignments);
        }).fail(function() {
            callback(new Error("network error"));
        });
    }
    else
        callback(new Error("invalid session error"));
}

/**
 * gets the grade for a assignment with the given name in the specific course
 * @param courseId
 * @param assignmentName
 * @param callback
 */
function getCourseAssignmentGrade(courseId, assignmentName, callback) {
    var url = createUrl("core_user_get_users_by_field",  {"field":"username", "values[0]":getCookieByName(USERNAME)});
    if(url != null) {
        $.get(url, function(data, status) {
            if(data[0] != null && data[0].id != null) {
                var url = createUrl("gradereport_user_get_grades_table", {"userid":data[0].id, "courseid":courseId});
                if (url != null) {
                    $.get(url, function (data, status) {
                        var found=false;
                        var tabledata = data.tables[0].tabledata;
                        for(var i = 1; i < tabledata.length; i++) {
                            // searches for the name in the assignment
                            // unfortunately there is no other way to concatenate assignment with grade
                            if(tabledata[i].itemname.content.indexOf(assignmentName) != -1) {
                                var grade = new AssignmentGrade(
                                    tabledata[i].grade.content, tabledata[i].percentage.content);
                                callback(grade,true);
                                found=true;
                            }
                        }
                        if(!found)
                            callback(null,false);
                    }).fail(function () {
                        callback(new Error("network error"));
                    });
                }
                else
                    callback(new Error("invalid session error"));
            }
            else
                callback(new Error("other error"));

        }).fail(function() {
            callback(new Error("network error"));
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

// duedate is null, if there is no duedate for the assignment
function Assignment(name, desc, duedate) {
    this.name = name;
    this.desc = desc;
    this.duedate = duedate;
}

function AssignmentGrade(points, percentage) {
    this.points = points;
    this.percentage = percentage;
}