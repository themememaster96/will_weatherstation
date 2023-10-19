var http = require('http');
var fs = require('fs');

var index = fs.readFileSync('index.html');

const SerialPort = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

const parsers = SerialPort.parsers;
const parser = new ReadlineParser({ delimiter: "\r\n" });

const SERIAL_PORT_PATH = '/dev/cu.usbserial-10';
const BAUD_RATE = 115200;
const DATA_BITS = 8;
const PARITY = 'none';
const STOP_BITS = 1;


const port = new SerialPort.SerialPort({
  path: SERIAL_PORT_PATH,
  baudRate: BAUD_RATE,
  dataBits: DATA_BITS,
  parity: PARITY,
  stopBits: STOP_BITS,
});

port.pipe(parser);

var app = require('http').createServer(function(req, res){
  res.writeHead(200,{'Content-Type': 'text/html'});
  res.end(index);
});

var io = require('socket.io')(app);

parser.on("data", (data) => {
  console.log(data);
  const dataArray = data.split(",");
  if (dataArray.length === 2) {
    const humidity = dataArray[0];
    const temperature = dataArray[1];
    io.emit('data', { humidity, temperature });
  }
});

app.listen(3000);