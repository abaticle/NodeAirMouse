
var socket =  io.connect(window.location.href);
var position = {};

gyro.frequency = 200;


calibrer = function() {
    socket.emit("calibrate", position);
};


testPos = function() {
    socket.emit("testPos", position);
}

gyro.startTracking(function(event) {
    position = event;

    var b = document.getElementById('content');
    

    b.innerHTML = 

        "<p> Alpha = " + event.alpha + "</p>" +
        "<p> Beta = " + event.beta + "</p>" +
        "<p> Gamma = " + event.gamma + "</p>";

    socket.emit("position", event);

    
});