$(function() {
    var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
    if (width > 1023){
        $('div.map_div#map').removeClass("#map");
    }
});