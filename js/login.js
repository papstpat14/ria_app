$(document).ready(function() {
    $("#login").click(function() {
        var username = $("#username").val();
        var password = $("#password").val();
        if(username && password) {
            var url = "https://elearning.fh-joanneum.at/login/token.php?username=" + username +
                "&password=" + password + "&service=moodle_mobile_app";
            $.get(url, function (data, status) {
                if(data.token != null)
                    document.cookie = data.token;
                else if(data.error != null)
                    console.log("error: " + data.error);
                else
                    console.log("other error");
            }).fail(function() {
                console.log("network error");
            });
        }
    });
});

function getCookie(cname) {
    var name = cname + "=";
    var cookies = document.cookie.split(';');
    for(var i = 0; i < cookies.length; i++) {
        var c = cookies[i];
        while (c.charAt(0) == ' ')
            c = c.substring(1);
        if (c.indexOf(name) == 0)
            return c.substring(name.length,c.length);
    }
    return null;
}