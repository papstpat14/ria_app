
var storage=false;

/**
 * Initializes local storage handler
 *
 */
function DaoInitStorage()
{
    if(typeof(Storage) !== "undefined") {
        storage=true;
        setTimeout(loadData,100);
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
        courses.forEach(function(course)
        {
           DaoGetAssignments(course.id,function(assignments)
           {
               assignments.forEach(function(assignment)
               {
                  assignment.courseid=course.id;
                  assignmentList.push(assignment);
               });
               numCourses++;
               if(numCourses>=courses.length)
               {
                   callback(assignmentList);
               }
           });
        });
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
    getCourseAssignments(courseid,function(assignment)
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
 * Loads grade for the given assignment
 * @param courseid
 * @param assignmentname
 * @param callback
 *
 */
function DaoLoadGrade(courseid,assignmentname,callback)
{
    getCourseAssignmentGrade(courseid,assignmentname,function(grade,found)
    {
       if(grade instanceof Error)
       {
           notify(grade);
       }
       else {
           if(found)
            callback(grade,true);
           else
            callback(null,false);
       }
    });
}