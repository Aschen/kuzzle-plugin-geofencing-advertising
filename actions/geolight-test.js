const
  EventEmitter = require('events'),
  net = require('net');

const lat = parseFloat(process.argv[2] || '10')
const lng = parseFloat(process.argv[3] || '10')
const count = parseInt(process.argv[4]) || 2000
const host = process.argv[5] || 'localhost'


class GeolightClient extends EventEmitter {
  constructor () {
    this.socket = new net.Socket();

    this.packetCount = 0;
  }

  sendPacket (packet) {

  }

  makePacket (...data) {
    return new Buffer(JSON.stringify([this.packetCount++, ...data]));
  }
}

function sendPacket (socket, packet) {
  return new Promise((resolve, reject) => {
    socket.write(packet, () => {
      resolve();
    });
  });
}

const sendTestPackets = async (socket) => {
  for (let i = 0; i < 10; i++) {
    const testPacket = new Buffer(JSON.stringify([i, 1, lat, lng]))
    console.log(`Send packet ${i}`)
    await sendPacket(socket, testPacket)
  }
  console.log('Finish')
}

socket.on('data', async buffer => {
  const data = JSON.parse(buffer.toString())

  if (data[1] && data[1].jwt) {
    console.log("Connected")
    await sendTestPackets(socket)
  } else {
    console.log(data)
  }
})

socket.connect({ host, port: 4242 }, async () => {
  const loginPacket = new Buffer(JSON.stringify([2, "aschen", "aschen"]))

  await sendPacket(socket, loginPacket);
})
