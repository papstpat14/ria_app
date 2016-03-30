const TOKEN = "token=";
const USERNAME = "username=";

//TODO replace console logs
function login() {
    var username = $("#username").val();
    var password = $("#password").val();
    if(username && password) {
        var url = "https://elearning.fh-joanneum.at/login/token.php?username=" + username +
            "&password=" + password + "&service=moodle_mobile_app";
        $.get(url, function(data, status) {
            if(data.token != null) {
                document.cookie = TOKEN + data.token;
                document.cookie = USERNAME + username;
            }
            else if(data.error != null)
                console.log("error: " + data.error);
            else
                console.log("other error");
        }).fail(function() {
            console.log("network error");
        });
    }
}

function logout() {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

//TODO replace console logs and alerts
function getAllCourses() {
    var url = createUrl("core_user_get_users_by_field",  {"field":"username", "values[0]":getCookieByName(USERNAME)});
    if(url != null) {
        $.get(url, function(data, status) {
            if(data[0] != null && data[0].id != null) {
                url = createUrl("core_enrol_get_users_courses", {"userid":data[0].id});
                if(url != null) {
                    $.get(url, function(data, status) {
                        console.log(data);
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

//TODO replace console logs and alerts
//TODO replace default values
//TODO algorithm for sections and different material types
function getCourseDetails() {
    var url = createUrl("core_course_get_contents", {"courseid":"1149"});
    if(url != null) {
        $.get(url, function(data, status) {
            console.log(data);
        }).fail(function() {
            console.log("network error");
        });
    }
    else
        alert("invalid session error");
}

//TODO replace console logs and alerts
//TODO replace default values
function getCourseAssignments() {
    var url = createUrl("mod_assign_get_assignments", {"courseids[0]":"1052"});
    if(url != null) {
        $.get(url, function(data, status) {
            console.log(data.courses[0].assignments);
        }).fail(function() {
            console.log("network error");
        });
    }
    else
        alert("invalid session error");
}

//TODO replace console logs and alerts
//TODO replace default values
function getCourseAssignmentGrades() {
    var url = createUrl("gradereport_user_get_grades_table", {"userid":"60", "courseid":"1329"});
    if(url != null) {
        $.get(url, function(data, status) {
            console.log(data);
        }).fail(function() {
            console.log("network error");
        });
    }
    else
        alert("invalid session error");
}

/*function getCourseAssignmentGrades() {
    var url = createUrl("mod_assign_get_grades", {"assignmentids[0]":"238"});
    if(url != null) {
        $.get(url, function(data, status) {
            console.log(data);
        }).fail(function() {
            console.log("network error");
        });
    }
    else
        alert("invalid session error");
}*/

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