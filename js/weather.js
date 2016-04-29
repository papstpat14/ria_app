/**
 * Created by Patrick on 29.04.2016.
 */
window.onload=function(){
    var x =document.getElementById('motivation').innerText;
    var y = getWeatherMotivation();
    x.innerText=y;
}