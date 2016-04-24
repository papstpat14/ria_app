/*
 Creator: Kainz
 */
"use strict"
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
            courses.forEach(function(course)
            {
                loadDetails(course.id);
            });
            inprogress["courses"]=false;
        });
    }
}
/**
 * loads course details into cache
 * @param courseid
 */
function loadDetails(courseid)
{
    if(inprogress["details_"+courseid]==undefined||!inprogress["details_"+courseid])
    {
        inprogress["details_"+courseid]=true;
        DaoLoadDetails(courseid,function(details)
        {
           localStorage.setItem("details_"+courseid,JSON.stringify(details));
           inprogress["details_"+courseid]=false;
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
        var assignmentNames=[];
        assignments.forEach(function(assignment)
        {
           assignmentNames.push(assignment.name);
        });
        DaoLoadGrades(courseid,assignmentNames,function(grades)
        {
            grades.forEach(function(grade)
            {
                localStorage.setItem("grade_found_"+courseid+"_"+grade.assignmentName,JSON.stringify(grade.found));
                if(grade.found)
                {
                    localStorage.setItem("grade_"+courseid+"_"+grade.assignmentName,JSON.stringify(grade));
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
