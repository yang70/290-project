// Add the 'active' class for the nav item for the given route
var selected = window.location.pathname.substring(1);
selected === "" ? $("#main").addClass("active") : $(`#${selected}`).addClass("active");