const express = require('express');
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const robot = require("robotjs");


const config = {
    port: 8080,
    ip: getIPAddress()
}

app.use('/', express.static('public'));


server.listen(config.port, function() {
    console.log("listening : ", config.ip, config.port)
});


/**
 * Get current IP adress
 */
getIPAddress = function () {
    var interfaces = require('os').networkInterfaces();

    for (var devName in interfaces) {
        var iface = interfaces[devName];

        for (var i = 0; i < iface.length; i++) {
        var alias = iface[i];
        if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
            return alias.address;
        }
    }  
    return '0.0.0.0';
}






let calibration;

// Degree max : 70 (si alpha = 70, mouseX = screenWidth / si alpha = -70, mouseX = 0)


let maxDegreeAlpha = 70;
let maxDegreeBeta = 70;
let distance = 900 / Math.tan(70 * Math.PI/180); 

let screenWidth = 1680;
let screenHeight = 1024;


/**
 * Get current gyroscope angle based on calibration > 0 is center
 */
_getAngleFromOrientation = function(orientation, calibration) {
    
    var angle = orientation - calibration;

    angle = parseInt(angle % 360) * -1;

    if (angle > 180) {
        angle -= 360
    }

    return angle;
};


_getMousePositionFromAngle = function(angle, calibration, type) {

}


/**
 * Update current screen calibration
 */
calibrate = function(data) {
    calibration = data;

    console.log("Calibration:");
    console.log(data);
}


/**
 * update mouse position 
 */
setMousePosition = function(data) {

}


testPosition = function(data) {
    console.log("Test X : ", _getAngleFromOrientation(data.alpha, calibration.alpha))
}



io.on("connection", function(socket) {
    socket.on("calibrate", calibrate);
    socket.on("position", setMousePosition);
    socket.on("testPos", testPosition);
});

