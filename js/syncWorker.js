var inprogress = new Array();
/**
 * loads all courses
 */
function loadCourses()
{
    if(inprogress["courses"]==undefined || !inprogress["courses"])
    {
        inprogress["courses"]=true;
        DaoLoadCourses(function(courses){
            localStorage.setItem("Courses",JSON.stringify(courses));
            var courseids=[];
            courses.forEach(function(course)
            {
               courseids.push(course.id);
            });
            loadAllAssignments(courseids);
            inprogress["courses"]=false;
        });
    }
}
/**
 * loads assignments for the given course
 * @param course
 */
function loadAllAssignments(courseids)
{
    if(inprogress["assignments"]==undefined||!inprogress["assignments"])
    {
        inprogress["assignments"]=true;
        DaoLoadAllAssignments(courseids,function(assignments)
        {
            var courseAssigments = {};
            assignments.forEach(function(assignment){
               if(courseAssigments[assignment.courseid]==undefined||courseAssigments[assignment.courseid]==null){
                   courseAssigments[assignment.courseid]=[];
               }
               courseAssigments[assignment.courseid].push(assignment);
            });
            for(var key in courseAssigments)
            {
                localStorage.setItem("assignments_"+key,JSON.stringify(courseAssigments[key]));
                loadGrades(key,courseAssigments[key]);
            }
            inprogress["assignments"]=false;
        });
    }
}
/**
 * loads grade for the given assignment
 * @param courseid
 * @param assignments
 */
function loadGrades(courseid,assignments)
{
    var inProgressId = "grades_"+courseid;
    if(inprogress[inProgressId]==undefined||!inprogress[inProgressId])
    {
        inprogress[inProgressId]=true;
        DaoLoadGrades(courseid,assignments,function(grades)
        {
            grades.forEach(function(grade)
            {
                localStorage.setItem("grade_found_"+courseid+"_"+grade.name,JSON.stringify(grade.found));
                if(found)
                {
                    localStorage.setItem("grade_"+courseid+"_"+grade.name,JSON.stringify(grade));
                }
            });
            inprogress[inProgressId]=false;
        });
    }
}
/**
 * Cyclic data load function
 */
function loadData()
{
    loadCourses();
    setTimeout(loadData,10000);
}
