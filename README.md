webLightSwitch.js
=================

This node application provides a web application that sends commands to an
INSTEON PowerLinc Modem (PLM) (2413U for USB, 2413S for Serial) available from
http://www.smarthome.com.

The node application "serialport" has been found to work with webLightSwitch.js
to communicate with the PLM.


Installing npm
--------------

    curl http://npmjs.org/install.sh | sh

"npm" is a package manager for node and used to install "serialport".


Install serialport
------------------

    npm install serialport


Configuration
-------------

There are some customization parameters that you can change in
webLightSwitch.js to make the program work in your environment.

### API_KEY

    var API_KEY = 'changeMe';

The `API_KEY` is an authentication token to provide a simplistic authenticated
web request. The web requests will require inclusion of the query parameter
`apiKey=[value]`. You should set the value to secret token.

### SERIAL_PORT_NAME

    var SERIAL_PORT_NAME = '/dev/ttyUSB0';

The serial port name should be set the value to communicate with the PLM. The
USB PLM can use the FTDI drivers built in to modern Linux kernels. You should
be able to plug in the USB PLM and the Linux kernel will create a device.
The device will have a name like `/dev/ttyUSB0`. You may be able to use
`dmsg` to see log messages describing the actions taken by the Linux kernel
to create the device when the USB PLM is plug in to a USB port.

### DEVICES

    var DEVICES = {
      // add devices to control to this object
      // the index should be unique
      // the following are examples
      0: {name: 'Nightstand', address: [0x01, 0x02, 0x03]},
      1: {name: 'Porch', address: [0x04, 0x05, 0x06]}
    };

The object `DEVICES` lists the INSTEON light devices that you can control. The
INSTEON devices should be paired with the PLM before use with
webLightSwitch.js. There are some example entries in the code to start from.
The index of each device should be unique. If you do add more entries, ensure
that each entry except the last end with a comma. The `name` attribute
is the name of the switch displayed in the interface. The `address`
attribute is the INSTEON three byte address of the device. You can typically
find the address in hex printed on the device itself.


Running
-------

To run the program:

    node webLightSwitch.js

This will start a web server listening on all IP address on port 8888. It will
also open the serial port to communicate with the PLM. Use a web browser to
access the web interface at:

    http://192.168.102.1:8888/?apiKey=changeMe

If all of the configuration is correct, you should see a screen listing each
named device with `on` and `off` buttons next to each device name. You can
click `on` or `off` and an associated INSTEON command will be sent from the PLM
to the addressed device.
