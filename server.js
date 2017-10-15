const express = require('express');
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const robot = require("robotjs");

let currentScroll = 0;
let functionScroll;
let port = 8080;
let calibration;
let updateMouse = false; 
let maxDegreeAlpha = 70;
let maxDegreeBeta = 40; 
let screenWidth = robot.getScreenSize().width;
let screenHeight = robot.getScreenSize().height;
let distanceX = screenWidth / Math.tan(maxDegreeAlpha * Math.PI/180);
let distanceY = screenHeight / Math.tan(maxDegreeBeta * Math.PI/180);
let posX = 0;
let posY = 0;

/**
 * Get current IP adress
 */
getIPAddress = function () {
    let interfaces = require('os').networkInterfaces();

    for (let devName in interfaces) {
        let iface = interfaces[devName];

        for (let i = 0; i < iface.length; i++) {
        let alias = iface[i];
        if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
            return alias.address;
        }
    }  
    return '0.0.0.0';
};

/**
 * Get current gyroscope angle based on calibration > 0 is center
 */
_getAngleFromOrientation = function(orientation, calibration) {    
    let angle = orientation - calibration;

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
};




/**
 * Mouse controls
 */
setMousePosition = function(data) {
   if (calibration === undefined || data.alpha === 0 || data == undefined) {
       return;
   }
   if (!updateMouse) {
       return;
   }
   if (data.alpha == null) {
       return;
   }

   var angleX = _getAngleFromOrientation(data.alpha, calibration.alpha);
   var angleY = _getAngleFromOrientation(data.beta, calibration.beta);

   var newPosX = _getMousePositionFromAngle(angleX, calibration.alpha, "x");
   var newPosY = _getMousePositionFromAngle(angleY, calibration.beta, "y");

   robot.moveMouse(newPosX, newPosY);
};
start = function(data) {
    calibration = data;
    updateMouse = true;

    console.log("Calibration:");
    console.log(data);
};
stop = function() {
    updateMouse = false;
};


/**
 * Left button :
 */
leftMouseDown = function() {
    robot.mouseToggle("down", "left");
};
leftMouseUp = function() {
    robot.mouseToggle("up", "left");
};
doubleClick = function() {
    robot.mouseClick("left", true);
};

/**
 * Right button :
 */
rightMouseDown = function() {
    robot.mouseToggle("down", "right");
};
rightMouseUp = function() {
    robot.mouseToggle("up", "right");
};

/**
 * Scroll
 */
scrollStart = function(mouseScrollY) {
    functionScroll = setInterval(function() {
        robot.scrollMouse(currentScroll, 0);      
    }, 100)
};
scrollMove = function(mouseScrollY) {    
    if (mouseScrollY < 20 && mouseScrollY > -20) {
        currentScroll = 0;
    } else {
        if (Math.abs(mouseScrollY) < 100) {
            currentScroll = 1 * Math.sign(mouseScrollY);
            //currentScroll = Math.round(mouseScrollY / 150);         
        } else if (Math.abs(mouseScrollY) < 300) {
            currentScroll = 2 * Math.sign(mouseScrollY);
        } else {
            currentScroll = 3 * Math.sign(mouseScrollY);
        }        
    }    
};
scrollEnd = function() {
    clearInterval(functionScroll);
};

/**
 *  Volume
 */
volumeDown = function() {
    robot.keyTap("audio_vol_down");
};
volumeUp = function() {
    robot.keyTap("audio_vol_up");    
};

/**
 * Socket.io connection
 */
io.on("connection", function(socket) {
    socket.on("start", start); 
    socket.on("position", setMousePosition);
    socket.on("stop", stop);
    socket.on("leftMouseDown", leftMouseDown);
    socket.on("leftMouseUp", leftMouseUp);
    socket.on("rightMouseDown", rightMouseDown);
    socket.on("rightMouseUp", rightMouseUp);
    socket.on("doubleClick", doubleClick);
    socket.on("scrollStart", scrollStart);
    socket.on("scrollMove", scrollMove);
    socket.on("scrollEnd", scrollEnd);
    socket.on("volumeDown", volumeDown);
    socket.on("volumeUp", volumeUp);
});

/**
 * Start express
 */
app.use('/', express.static(__dirname + '\\public'));

server.listen(port, function() {
    console.log("listening : ", port, getIPAddress())
});
