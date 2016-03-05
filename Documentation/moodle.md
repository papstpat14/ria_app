##Moodle Documentation

#E.g.: How to access the moodle web service (show list of lectures) in three steps:
    Replace YOUR_USERNAME, YOUR_PASSWORD, YOUR_TOKEN and YOUR_USERID with your own values.

    # Get the user token (for mobile version, the administrator has to create a new service if he wants to restrict access etc. to it)
    https://elearning.fh-joanneum.at/login/token.php?username=YOUR_USERNAME&password=YOUR_PASSWORD&service=moodle_mobile_app


    # Get some user information (including the users id)
    https://elearning.fh-joanneum.at/webservice/rest/server.php?moodlewsrestformat=json&wsfunction=core_user_get_users_by_field&wstoken=YOUR_TOKEN&field=username&values[0]=YOUR_USERNAME


    # Get all the courses that the user is enrolled in
    https://elearning.fh-joanneum.at/webservice/rest/server.php?moodlewsrestformat=json&wsfunction=core_enrol_get_users_courses&wstoken=YOUR_TOKEN&userid=YOUR_USERID

#see also:

    - Moodle Function API doc over REST: http://stackoverflow.com/questions/19903456/moodle-function-api-doc-over-rest StackOverflow hat hierzu zwei interessante Antworten
    - Überblick von verfügbaren Web servicehttps://docs.moodle.org/dev/Web_service_API_functions#Core_web_service_functions
    - Der Source von den Webservices: https://github.com/moodle/moodle/tree/master/webservice
    - PHP-REST Client: https://github.com/moodlehq/sample-ws-clients/tree/master/PHP-REST
    - z.b. URL zum Webservice vom elearning Moodle: https://elearning.fh-joanneum.at/webservice/rest/server.php

