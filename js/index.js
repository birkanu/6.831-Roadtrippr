$(document).ready(function() {

    // Click listener for "Find a Trip" button, shows search window
    $("#btn_find_trip").click(function(e) {
        $("#search_window").css("visibility", "visible");
    });

    $(function () {
        $('#datetimepicker_start').datetimepicker();
    });    
});