/*
 Creator: Kainz
 */
"use strict"
var widthSmartphone=760;
var widthTablet=1000;

/**
 * Alternative notification via altert when notify is not supported
 * @param text notification
 * @param error error returned from notification api
 */
function alertNotify(text,error)
{
    alert(text+"\n"+"You are receiving this alert because: "+error);
}

/**
 * Notifies the user
 * @param text
 */

function notify(text) {
    if(text instanceof Error)
        vibrate();
    if (!("Notification" in window)) {
        alertNotify(text,"Notifications not supported");
    }
    else if (Notification.permission === "granted") {
        new Notification(text);
    }
    else if (Notification.permission !== 'denied') {
        Notification.requestPermission(function (permission) {
            if (permission === "granted") {
                new Notification(text);
                document.getElementById("notifications").innerHTML="Notifications supported and granted"
            }
            else
            {
               alertNotify(text,"No permission to send notifications");
            }
        });
    }
}

/**
 * Hide element
 * @param element element to be hidden
 */
function hide(element)
{
    if(element.selector != undefined)
        element.each(function(subelement){
           hide(element[subelement]);
        });
    else
        if(!element.classList.contains("hidden"))
            element.classList.add("hidden");
}

/**
 * Shows element
 * @param element element to be shown
 */
function show(element)
{
    if(element.selector != undefined)
        element.each(function(subelement){
            show(element[subelement]);
        });
    else
        if(element.classList.contains("hidden"))
            element.classList.remove("hidden");
}

/**
 * Shows the given page, and hides the others
 * @param page page to be shown
 * @param withCalendar show calendar as well
 * @param withNav show navigation menu as well
 * @param className class of pages this page belongs to (other pages in that class will be hidden)
 */
function showPage(page,withCalendar,withNav,className)
{
    if(className==null||className==undefined)
        className="page";
    var pages = document.getElementsByClassName(className);
    for(var i = 0;i<pages.length;i++)
        hide(pages.item(i));
    show($("#"+page));
    if(withCalendar)
        show($("#calendar"));
    else
        hide($("#calendar"));
    if(withNav)
        show($(".courselink"));
    else
        hide($(".courselink"));
    var phonenav = document.getElementsByClassName("phonenav");
    for(i = 0;i<phonenav.length;i++)
        if(withNav)
            show(phonenav.item(i));
        else
            hide(phonenav.item(i));

    document.getElementById("show-menu").checked=false;
    adjustNav();
}

/**
 * adjusts the size of main depending on the size of the navigation menu
 */
function adjustNav()
{
    $(".bodyheight").each(function(index,value)
    {
        var navHeight=0;
        $("nav").each(function(index,value)
        {
           navHeight=value.clientHeight;
        });
        value.setAttribute("style","min-height:calc(100vh - "+(201+navHeight)+"px)");
    });
}

/**
 * Handles resize events to correctly handle the ui
 */
window.onresize=function()
{
    if(window.innerWidth>widthSmartphone)
        if(!document.getElementById("calendarpage").classList.contains("hidden"))
            showPage("main",true);
    if(window.innerWidth<=widthTablet)
    {
        if(!document.getElementById("files").classList.contains("hidden"))
            hide($("#grades"));
    }
    else
    {
        show($("#files"));
        show($("#grades"));
    }
    adjustNav();
};
/**
 * Initializes course page, sets up pages
 */
function initCourse()
{
    if(window.innerWidth<=widthTablet)
        showPage("files",true,true,"secondarypage");
}
/**
 * hides or shows the menu
 * @param hidden whether or not to hide or show
 */
function hideMenu(hidden)
{
    if(hidden) {
        hide($("#show-menu"));
        hide($("#menu"));
        hide($("#menu-button"));
    }
    else
    {
        show($("#show-menu"));
        show($("#menu"));
        show($("#menu-button"));
    }
}
/**
 * Shows the login page
 */
function showLogin()
{
    showPage('login',false);
    hideMenu(true);
    $("#backlink").click(showLogin);
    hide($("#logout"));
}
/**
 * shows the main page
 */
function showMain()
{
    showPage('main',true);
    hideMenu(false);
    $("#backlink").click(showMain);
    DaoGetCourses(coursesLoaded);
    showAllAssignments();
    show($("#logout"));
    testGetWeatherMotivation();
}
/**
 * shows the course page
 */
function showCourse()
{
    showPage('coursepage',true,true);
    initCourse();
    hideMenu(false);
}
/**
 * shows the calendar page
 */
function showCalendar()
{
    showPage('calendarpage',false);
    hideMenu(false);
    showAllAssignments();
}
/**
 * shows the file page
 */
function showFiles()
{
    showPage('files',true,true,'secondarypage');
    hideMenu(false);
}
/**
 * shows the grades page
 */
function showGrades()
{
    showPage('grades',true,true,'secondarypage');
    hideMenu(false);
}

/**
 * Called when login returns
 * @param result whether or not login was successfull
 */
function loggedIn(result)
{
    if(result instanceof Error)
    {
        notify(result);
    }
    else
    {
        notify("Login successfull");
        showMain();
    }
}
/**
 * Shows all assignments
 */
function showAllAssignments()
{
    DaoGetAllAssignments(calendarLoaded);
    registerCalendarFunction(showAllAssignments);
}

/**
 * login handler function
 */
function handleLogin()
{
    var username=$("#username").val();
    var password=$("#password").val();
    if(username==null||username==undefined||password==null||password==undefined||password.length==0||username.length==0)
        notify("Please enter username and password");
    else
    {
        login(username,password,loggedIn);
    }
}
/**
 * Handles click on an event
 * @param appointment event that was clicked
 * @returns {Function} handler function
 */
function handleEvent(appointment)
{
    return function()
    {
        DaoGetGrade(appointment.courseid,appointment.name,function(grade)
        {
            notify(appointment.name+"\n"
                  +appointment.desc+"\n"
                  +"Abzugeben am: "+appointment.duedate+"\n"
                  +(grade==null||(grade.points=="-"&&grade.percentage=="-")?"Keine Note bis jetzt":("Note"+grade.points!=null?grade.points:grade.percentage)));
        });
    }
}

/**
 * Setup vibration api
 */
function setupVibration()
{
    // enable vibration support
    navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
}

/**
 * Vibrate 1 second if possible
 */
function vibrate()
{
    if (navigator.vibrate) {
        navigator.vibrate(1000);
    }
}

/**
 * window initialization function
 */
window.onload=function()
{
    DaoInitStorage();

    if(isLoggedIn())
        showMain();
    else
        showLogin();

    $("#calendarlink").click(showCalendar);
    $("#logoutlink").click(handleLogout);
    $("#logoutmenulink").click(handleLogout);
    $("#gradelink").click(showGrades);
    $("#gradesec").click(showGrades);
    $("#filelink").click(showFiles);
    $("#filesec").click(showFiles);
    $("#btLogin").click(handleLogin);
    setupVibration();
    notify("Moodle is now ready");
};

/**
 * logout for user
 */
function handleLogout()
{
    logout();
    showLogin();
}

/**
 * Registers the given function to the calendar
 * @param func function to be registered
 */
function registerCalendarFunction(func)
{
    $(".calendarframe").each(function(index,calendar) {
        var iframeDocument = calendar.contentDocument || iframe.contentWindow.document;
        if (iframeDocument) {
            calendar.contentWindow.setResetFunction(func);
        }
    });
}

/**
 * Handle press on course button
 * @param course course to be loaded
 * @returns {Function} function to be executed on press
 */
function handleCourse(course)
{
    return function()
    {
        $("#courseHeading").html(course.name);
        DaoGetAssignments(course.id, function(assignments)
        {
            calendarLoaded(assignments);
            var assignmentNames=[];
            assignments.forEach(function(assignment)
            {
                assignmentNames.push(assignment.name);
            });
            DaoGetGrades(course.id,assignmentNames,function(grades){
                var visibleGrades=[];
                grades.forEach(function(grade)
                {
                   if(grade.found&&(grade.points!="-"||grade.percentage!="-"))
                   {
                       grade.grade=grade.points=="-"?grade.percentage:grade.points;
                       visibleGrades.push(grade);
                   }
                });
                $("#gradetable").html(renderTemplate("grade-template",{grades:visibleGrades}));
            });
        });
        DaoGetDetails(course.id,function(details)
        {
            var files = [];
            details.forEach(function(detail)
            {
               detail.modules.forEach(function(module)
               {
                  if(module.modname=="resource")
                  {
                      files.push(module);
                  }
               });
            });
            $("#ulFiles").html(renderTemplate("file-template",{files:files}));
        });
        showCourse();
    };
}

/**
 * Renders handlebars template
 * @param id id of template
 * @param context context to render
 * @returns {*} rendered text
 */
function renderTemplate(id,context)
{
    var source=$("#"+id).html();
    var template = Handlebars.compile(source);
    return template(context);
}
/**
 * Called when the courses are loaded
 * @param courses courses to be shown
 */
function coursesLoaded(courses)
{
    $("#courses").html(renderTemplate("course-template",{courses:courses}));
    courses.forEach(function(course)
    {
       $("#course"+course.id).click(handleCourse(course));
    });
}
/**
 * Called when the appointments are loaded
 * @param assignments assignments to be shown in calendar and assignment list
 */
function calendarLoaded(assignments)
{
    var visibleAssignments = [];
    assignments.forEach(function(assignment)
    {
       assignment.duedate=new Date(assignment.duedate);
       if(assignment.duedate>=new Date())
       {
           visibleAssignments.push(assignment);
       }
    });
    visibleAssignments.sort(function(a,b)
    {
        if(a.duedate==null&& b.duedate==null)
            return 0;
        if(a.duedate==null)
            return 1;
        if(b.duedate==null)
            return -1;
        return a.duedate.getTime()- b.duedate.getTime();
    });
    $(".assignments").each(function(index,assignment){
       assignment.innerHTML=renderTemplate("assignment-template",{assignments:visibleAssignments});
    });
    $(".calendarframe").each(function(index,calendar){
        var iframeDocument = calendar.contentDocument || iframe.contentWindow.document;
        if(iframeDocument)
        {
            var days = iframeDocument.getElementsByClassName("calendarday");
            for(var i = 0;i<days.length;i++)
            {
                var day = days.item(i);
                day.onclick=null;
                if(day.classList.contains("event"))
                    day.classList.remove("event");
            }

            assignments.forEach(function(appointment)
            {
                var today=new Date(appointment.duedate);
                var day = iframeDocument.getElementById(today.getFullYear()+"_"+(today.getMonth())+"_"+today.getDate());
                if(day!=null&&day!=undefined)
                {
                    day.classList.add("event");
                        day.onclick=handleEvent(appointment);
                }
            });
        }
    });
}
