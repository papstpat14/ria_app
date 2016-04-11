//TODO replace console logs with actual logic
/*
 test methods (temporary)
 */
function testGetWeatherMotivation() {
    getWeatherMotivation(function (data) {
        console.log(data);
    })
}
//#####################################################################################################################

/**
 * gets the motivation for learning due to the current weather for the current position of the client
 * @param callback
 */
function getWeatherMotivation(callback) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var url = createWeatherUrl(position.coords.latitude, position.coords.longitude);
            $.get(url, function (data, status) {
                if(status === "success") {
                    var mot = getMotivation(data.weather[0].icon, data.weather[0].description);
                    callback(mot);
                }
                else
                    callback(new Error("openweather is unfortunately offline"));
            }).fail(function () {
                callback(new Error("network error"));
            });
        });
    }
    else
        callback(new Error("Geolocation is not supported by your browser!"))
}

/**
 * creates the weather url
 * @param lat
 * @param lon
 * @returns {string}
 */
function createWeatherUrl(lat, lon) {
    const APIKEY = "360e8517a629dfa1ba6a9cbfc17f3117";
    var url = "http://api.openweathermap.org/data/2.5/weather?lat=";
    url += lat + "&lon=" + lon;
    url += "&lang=de";
    url += "&appid=" + APIKEY;
    return url;
}

/**
 * gets the motivation according http://openweathermap.org/weather-conditions
 * @param icon: the icon name
 * @param desc: description of weather
 * @returns {string}
 */
function getMotivation(icon, desc) {
    var mot = desc + " - ";
    if(icon.indexOf("01") != -1)
        mot += "Geh ins Freie für die FH lernen :]";
    else if(icon.indexOf("02") != -1)
        mot += "Man kann draußen für die FH lernen ;)";
    else if(icon.indexOf("03") != -1 || icon.indexOf("04") != -1)
        mot += "Hackathon im Büro! :]";
    else if(icon.indexOf("09") != -1 || icon.indexOf("10") != -1)
        mot += "Perfekte Zeit zum Lernen";
    else if(icon.indexOf("11") != -1)
        mot += "Perfekte Zeit zum Lernen";
    else if(icon.indexOf("13") != -1)
        mot += "Zeit zum Schneemann bauen ;]";
    else if(icon.indexOf("50") != -1)
        mot += "Lernverderber";
    else
        mot += "unbekannte Motivation";
    return mot;
}