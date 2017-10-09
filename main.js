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


function getIPAddress() {
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

server.listen(config.port, function() {
    console.log("listening : ", config.ip, config.port)
});






io.on("connection", function(socket) {

    let calibration = {};
    let distance = 10;


    getAngleFromOrientation = function(orientation, calibration) {

        var angle = orientation - calibration;


        angle = parseInt(angle % 360) * -1;

        if (angle > 180) {
            angle -= 360
        }

        return angle;

    };


    socket.on("calibrate", function(data) {
        calibration = data;

        console.log("Calibration:");
        console.log(data);
    });

    socket.on("position", function(data) {
        
    });

    //Alpha = x, beta = y
    socket.on("testPos", function(data) {

        console.log("Test X : ", getAngleFromOrientation(data.alpha, calibration.alpha))
        
    });
});

