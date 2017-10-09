
var socket =  io.connect(window.location.href);
var position = {};

gyro.frequency = 80;



roundPosition = function(position) {
    var precision = 1000;
    var newPosition = position * precision;

    newPosition = Math.round(newPosition);
    newPosition = newPosition / precision;

    return newPosition;
}

calibrer = function() {
    socket.emit("calibrate", position);
};

gyro.startTracking(function(event) {
    position = event;

    var b = document.getElementById('content');
    
    event.alpha = roundPosition(event.alpha);
    event.beta = roundPosition(event.beta);


    b.innerHTML = 

        "<p> Alpha = " + event.alpha + "</p>" +
        "<p> Beta = " + event.beta + "</p>" +
        "<p> Gamma = " + event.gamma + "</p>";



    
    socket.emit("position", event);

    
});