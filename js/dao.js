
var storage=false;

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
