const express = require('express');
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const robot = require("robotjs");


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


const config = {
    port: 8080,
    ip: getIPAddress()
}

app.use('/', express.static('public'));


server.listen(config.port, function() {
    console.log("listening : ", config.ip, config.port)
});








let calibration;

// Degree max : 70 (si alpha = 70, mouseX = screenWidth / si alpha = -70, mouseX = 0)


let maxDegreeAlpha = 70;
let maxDegreeBeta = 40; 

let screenWidth = 1680;
let screenHeight = 1024;

let distanceX = screenWidth / Math.tan(maxDegreeAlpha * Math.PI/180);
let distanceY = screenHeight / Math.tan(maxDegreeBeta * Math.PI/180);

let posX = 0;
let posY = 0;

/**
 * Get current gyroscope angle based on calibration > 0 is center
 */
_getAngleFromOrientation = function(orientation, calibration) {
    
    var angle = orientation - calibration;

    angle = (angle % 360) * -1;

    if (angle > 180) {
        angle -= 360
    }

    return angle;
};

/**
 * Get mouse position from angle
 *  angle: -180 to 180
 *  calibration: current calibrate for 0
 *  type : "x" or "y"
 */
_getMousePositionFromAngle = function(angle, calibration, type) {
    let distance = 0;
    let position;

    switch(type) {
        case "x":
            position = (Math.tan(angle * Math.PI / 180) * distanceX) + (screenWidth / 2);

            if (position > screenWidth) {
                position = screenWidth;
            } else if (position < 0) {
                position = 0;
            }
            break;

        case "y":
            position = (Math.tan((angle) * Math.PI / 180) * distanceY) + (screenHeight / 2);

            if (position > screenHeight) {
                position = screenHeight;
            } else if (position < 0) {
                position = 0;
            }
            break;
    }

    position = parseInt(position);

    return position;
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
   if (calibration === undefined || data.alpha === 0) {
       return;
   }

   console.log(data.alpha);

   var angleX = _getAngleFromOrientation(data.alpha, calibration.alpha);
   var angleY = _getAngleFromOrientation(data.beta, calibration.beta);

   var newPosX = _getMousePositionFromAngle(angleX, calibration.alpha, "x");
   var newPosY = _getMousePositionFromAngle(angleY, calibration.beta, "y");

    /*if (newPosX > posX) {
       newPosX += (newPosX - posX) / 2;
    } else {
       newPosX -= (posX - newPosX) / 2;
    }
    if (newPosY > posY) {
       newPosY += (newPosY - posY) / 2;
    } else {
       newPosY -= (posY - newPosY) / 2;
    }*/

   robot.moveMouse(newPosX, newPosY);
   //robot.moveMouse(newPosX, newPosY);
}



io.on("connection", function(socket) {
    socket.on("calibrate", calibrate);
    socket.on("position", setMousePosition);
});

