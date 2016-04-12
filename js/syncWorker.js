var inprogress = new Array();

function loadCourses()
{
    if(inprogress["courses"]==undefined || !inprogress["courses"])
    {
        inprogress["courses"]=true;
        DaoLoadCourses(function(courses){
            localStorage.setItem("Courses",JSON.stringify(courses));
        });
    }
}

function loadData()
{
    loadCourses();
    setTimeout(loadData,100);
}
