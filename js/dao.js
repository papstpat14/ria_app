
var storage=false;

/**
 * Initializes local storage handler
 *
 */
function DaoInitStorage()
{
    if(typeof(Storage) !== "undefined") {
        storage=true;
        loadData();
    } else {
        storage=false;
        notify("Offline storage not supported, cache deactivated");
    }
}
/**
 * Gets all courses
 * @param callback callback to be called when all courses arrive
 *
 */
function DaoGetCourses(callback)
{
    if(!storage||localStorage.getItem("Courses")==null)
    {
        DaoLoadCourses(callback);
    }
    else {
        callback(JSON.parse(localStorage.getItem("Courses")));
    }
}
/**
 * Get all assignments for a course
 * @param courseid id of the course to get the assignments for
 * @param callback callback to be called when finished
 *
 */
function DaoGetAssignments(courseid,callback) {
    if (!storage || localStorage.getItem("assignments_" + courseid) == null) {
        DaoLoadAssigments(courseid, callback);
    }
    else {
        callback(JSON.parse(localStorage.getItem("assignments_" + courseid)));
    }
}
/**
 * Gets all assignments globally
 * @param callback callback to be called when all assignments arrive
 *
 */
function DaoGetAllAssignments(callback)
{
    DaoGetCourses(function(courses)
    {
        var numCourses=0;
        var assignmentList=[];
        var courseids=[];
        var allfound=true;
        courses.forEach(function(course)
        {
            courseids.push(course.id);
            var courseid=course.id;
            if (!storage || localStorage.getItem("assignments_" + courseid) == null) {
                allfound=false;
            }
            else {
                var assignments = JSON.parse(localStorage.getItem("assignments_" + courseid));
                assignments.forEach(function(assignment){
                    assignmentList.push(assignment);
                });
            }
        });
        if(allfound)
        {
            callback(assignmentList);
        }
        else
            DaoLoadAllAssignments(courseids,callback);
    });
}
/**
 * Gets the grade for the given assignment
 * @param courseid courseid of the assignment
 * @param assignmentname name of the assignment
 * @param callback callback to be called when the grade arrives
 *
 */
function DaoGetGrade(courseid, assignmentname,callback)
{
    if(!storage||localStorage.getItem("grade_found_"+courseid+"_"+assignmentname)==null)
    {
        DaoLoadGrade(course,assignmentname,callback);
    }
    else
    {
        if(JSON.parse(localStorage.getItem("grade_found_"+courseid+"_"+assignmentname)))
        {
            callback(JSON.parse(localStorage.getItem("grade_"+courseid+"_"+assignmentname)),true);
        }
        else {
            callback(null,false);
        }

    }
}
/**
 * Gets the grade for the given assignment
 * @param courseid courseid of the assignment
 * @param assignmentnames name of the assignment
 * @param callback callback to be called when the grade arrives
 *
 */
function DaoGetGrades(courseid, assignmentnames,callback)
{
    var grades=[];
    var foundAll=true;
    assignmentnames.forEach(function(assignmentame)
    {
        if(!storage||localStorage.getItem("grade_found_"+courseid+"_"+assignmentname)==null)
        {
            foundAll=false;
        }
        else {
            if(JSON.parse(localStorage.getItem("grade_found_"+courseid+"_"+assignmentname)))
            {
                grades.push(JSON.parse(localStorage.getItem("grade_"+courseid+"_"+assignmentname)));
            }
            else
                grades.push(new AssignmentGrade(courseid,assignmentame,false,null,null));
        }

    });
    if(foundAll)
        callback(grades);
    else
    {
        DaoLoadGrades(courseid,assignmentnames,callback);
    }
}
/**
 * loads all courses
 * @param callback
 *
 */
function DaoLoadCourses(callback)
{
    getAllCourses(function(returnvalue){
        if(returnvalue instanceof Error)
        {
            notify(returnvalue);
        }
        else
        {
            callback(returnvalue);
        }
    });
}
/**
 * loads all assignments for the given course
 * @param courseid
 * @param callback
 *
 */
function DaoLoadAssigments(courseid, callback)
{
    getCourseAssignments([courseid],function(assignment)
    {
       if(assignment instanceof Error)
       {
           notify(assignment);
       }
       else
       {
           callback(assignment);
       }
    });
}

/**
 * Loads all assignments for the list of courses
 * @param courseids
 * @param callback
 */
function DaoLoadAllAssignments(courseids,callback)
{
    getCourseAssignments(courseids,function(assignments) {
        if(assignments instanceof Error)
        {
            notify(assignments);
        }
        else
        {
            callback(assignments);
        }
    });
}
/**
 * Loads grade for the given assignment
 * @param courseid
 * @param assignmentname
 * @param callback
 *
 */
function DaoLoadGrade(courseid,assignmentname,callback)
{
    getCourseAssignmentGrade(courseid,[assignmentname],function(grades)
    {
       if(grades instanceof Error)
       {
           notify(grade);
       }
       else {
           if(grades.length>0)
            callback(grades[0]);
           else
            callback(new AssignmentGrade(courseid,assignmentname,false,null,null));
       }
    });
}

/**
 * Loads grade for the given assignment
 * @param courseid
 * @param assignmentnames list of assignments to get the grade for
 * @param callback
 *
 */
function DaoLoadGrades(courseid,assignmentnames,callback)
{
    getCourseAssignmentGrade(courseid,assignmentnames,function(grades)
    {
        if(grades instanceof Error)
        {
            notify(grade);
        }
        else {
            assignmentnames.forEach(function(assignmentName){
                var found=false;
                grades.forEach(function(grade)
                {
                   if(grade.courseid==courseid && grade.name==assignmentName)
                   {
                       grades.push(new AssignmentGrade(courseid,assignmentName,false,null,null));
                   }
                });
            });
            callback(grades);
        }
    });
}