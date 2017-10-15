var socket =  io.connect(window.location.href);
var position = {};
var emit = false;
var mouseY;
var initialMouseY;

roundPosition = function(position, precision) {
    return Math.round(position * precision) / precision;
}

/**
 * Start / End
 */
$("#switch").on("change", function(event) {
    var elements = $("#left, #right, #scroll, #double, #volumeDown, #volumeUp");

    if (this.checked) {
        elements.removeClass("disabled");
        elements.addClass("z-depth-2");
        emit = true;        
        socket.emit("start", position);
    } else {
        elements.addClass("disabled");
        elements.removeClass("z-depth-2");
        emit = false;        
        socket.emit("stop");
    }
})

/**
 * Scroll button
 */
$("#scroll").on("touchstart", function(event) {
    if (!emit) return;
    initialMouseY = event.touches[0].pageY;
    mouseY = 0;
    socket.emit("scrollStart", 0); 
});
$("#scroll").on("touchmove", function(event) {
    if (!emit) return;
    mouseY = parseInt(event.touches[0].pageY - initialMouseY);
    socket.emit("scrollMove", mouseY * -1); 
});
$("#scroll").on("touchend", function() {
    if (!emit) return;
    socket.emit("scrollEnd", 0); 
});
    
/**
 * Left button
 */    
$("#left").on("touchstart", function() {
    if (!emit) return;    
    socket.emit("leftMouseDown");
});
$("#left").on("touchend", function() {
    if (!emit) return;
    socket.emit("leftMouseUp");
    $("#click")[0].play();
});
$("#left").on("click", function() {
    $("#click")[0].play();
});

/**
 * Right button
 */    
$("#right").on("touchstart", function() {
    if (!emit) return;    
    socket.emit("rightMouseDown");
});
$("#right").on("touchend", function() {
    if (!emit) return;
    socket.emit("rightMouseUp");
    $("#click")[0].play();
});
$("#right").on("click", function() {
    $("#click")[0].play();
});

/**
 * Double click
 */
$("#double").on("click", function() {
    if (!emit) return;
    socket.emit("doubleClick");
    $("#click")[0].play();
});

/**
 * Volume
 */
$("#volumeDown").on("click", function() {
    if (!emit) return;
    socket.emit("volumeDown");
    $("#click")[0].play();
});
$("#volumeUp").on("click", function() {
    if (!emit) return;
    socket.emit("volumeUp");
    $("#click")[0].play();
});

/**
 * Gyroscope
 */
gyro.frequency = 30;

gyro.startTracking(function(event) {
    position = event;

    if (event.alpha != null && emit) {

        //event.alpha = roundPosition(event.alpha, 10000);
        //event.beta = roundPosition(event.beta, 10000);
        
        socket.emit("position", event); 
    }    
});