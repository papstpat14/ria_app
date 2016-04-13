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
            courses.forEach(function(course)
            {
               loadAssignments(course);
            });
            inprogress["courses"]=false;
        });
    }
}
/**
 * loads assignments for the given course
 * @param course
 */
function loadAssignments(course)
{
    if(inprogress["assignment_"+course.id]==undefined||!inprogress["assignment_"+course.id])
    {
        inprogress["assignment_"+course.id]=true;
        DaoLoadAssigments(course.id,function(assignments)
        {
            localStorage.setItem("assignments_"+course.id,JSON.stringify(assignments));
            assignments.forEach(function(assignment)
            {
               loadGrade(course,assignment);
            });
            inprogress["assignment_"+course.id]=false;
        });
    }
}
/**
 * loads grade for the given assignment
 * @param course
 * @param assignment
 */
function loadGrade(course,assignment)
{
    var inProgressId = "grade_"+course.id+"_"+assignment.name;
    if(inprogress[inProgressId]==undefined||!inprogress[inProgressId])
    {
        inprogress[inProgressId]=true;
        DaoLoadGrade(course.id,assignment.name,function(grade,found)
        {
            localStorage.setItem("grade_found_"+course.id+"_"+assignment.name,JSON.stringify(found));
            if(found)
            {
                localStorage.setItem("grade_"+course.id+"_"+assignment.name,JSON.stringify(grade));
            }
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
    setTimeout(loadData,100);
}
