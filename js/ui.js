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
        showMain();
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
    $("#logoutlink").click(logout);
    $("#logoutmenulink").click(logout);
    $("#gradelink").click(showGrades);
    $("#filelink").click(showFiles);
    $("#btLogin").click(handleLogin);

    notify("Moodle is now ready");
};

function renderTemplate(id,context)
{
    var source=$("#"+id).html();
    var template = Handlebars.compile(source);
    return template(context);
}

function coursesLoaded(courses)
{
    $("#courses").html(renderTemplate("course-template",{courses:courses}));
}