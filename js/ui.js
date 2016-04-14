var widthSmartphone=760;
var widthTablet=1000;


function alertNotify(text,error)
{
    alert(text+"\n"+"You are receiving this alert because: "+error);
}

/**
 * Notifies the user
 * @param text
 */

function notify(text) {
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
        show($("#tablet-nav"));
    else
        hide($("#tablet-nav"));
    var phonenav = document.getElementsByClassName("phonenav");
    for(i = 0;i<phonenav.length;i++)
        if(withNav)
            show(phonenav.item(i));
        else
            hide(phonenav.item(i));

    document.getElementById("show-menu").checked=false;
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
    show('grades',true,true,'secondarypage');
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
    $("#filelink").click(showFiles);
    $("#btLogin").click(handleLogin);

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
}
/**
 * Called when the appointments are loaded
 * @param assignments assignments to be shown in calendar and assignment list
 */
function calendarLoaded(assignments)
{
    $(".assignments").each(function(index,assignment){
       assignment.innerHTML=renderTemplate("assignment-template",{assignments:assignments});
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
