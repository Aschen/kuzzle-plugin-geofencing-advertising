const
  net = require('net');

class GeolightProtocol {

  constructor () {
    this.context = null;
    this.entryPoint = null;
    this.name = 'geolight';

    this.connections = new Map();
    this.jwts = new Map();
    this.connectionsById = {};
  }

  init (entryPoint, context) {
    this.entryPoint = entryPoint;
    this.context = context;

    this.config = Object.assign({
      default: 'value'
    }, entryPoint.config[this.name] || {});

    this.server = net.createServer(socket => {
      this.onClientConnect(socket);
      socket.on('close', () => this.onClientDisconnect(socket));
      socket.on('data', data => this.onClientData(socket, data));
    }).listen(4242);
  }

  /*
   This function is only an example showing how to interact with
   clients and with Kuzzle. It does not implement any actual protocol.

   The way a protocol plugins handles clients closely depends on the
   implemented protocol.
   */
  onClientConnect (socket) {
    try {
      const connection = new this.context.ClientConnection(
        this.name,
        [socket.remoteAddress]
      );
      this.entryPoint.newConnection(connection);

      this.connections.set(socket, connection);
      this.connectionsById[connection.id] = socket;
    } catch (e) {
      this.context.log.error('[geolight-protocol] Unable to register new connection\n%s', e.stack);
      socket.destroy(e);
    }
    // // when a client sends a request
    // this.on('onClientRequest', (client, data) => {
    //   // Instantiates a Request object to be passed to Kuzzle
    //   const
    //     connection = this.connections[client.id],
    //     request = new this.context.Request(data, this.connections[client.id]);

    //   this.entryPoint.execute(request, response => {
    //     // forward the response to the client
    //   });
    // });
  }

  // Protocol
  // action geofence/test : | n | 1 | lat | lng |
  // action auth/login : | n | 2 | username | password |
  onClientData (socket, data) {
//    const serializer = new BufferSerializer();

    try {
      console.log(data.toString())
      const packet = JSON.parse(data.toString());
      console.log(packet)

      if (packet[0] === 1) {
        this._geofenceTest(socket, packet[1], packet[2])
      } else if (packet[0] === 2) {
        this._login(socket, packet[1], packet[2])
      } else {
        this.context.log.error(`[geolight-protocol] Unknown action ${action}`);
      }
    } catch (e) {
      this.context.log.error(`[geolight-protocol] Can not read data ${e.message}`);
    }
  }

  onClientDisconnect (socket) {
    const connection = this.connections.get(socket);
    this.entryPoint.removeConnection(connection.id);

    this.connections.delete(socket);
    this.jwts.delete(socket);
    delete this.connectionsById[connection.id];
  }

  _geofenceTest (socket, lat, lng) {
    const
      connection = this.connections.get(socket),
      jwt = this.jwts.get(socket),
      request = new this.context.Request({
        controller: 'geofencing-marketing/geofence',
        action: 'test',
        jwt,
        lat,
        lng
      }, { connection });

    this.entryPoint.execute(request, response => {
      let buffer;

      if (response.status === 200) {
        buffer = new Buffer(JSON.stringify([200, response.content.result]));
      } else {
        buffer = new Buffer(JSON.stringify([response.status]));
      }

      socket.write(buffer);
    });
  }

  _login (socket, username, password) {
    const
    connection = this.connections.get(socket),
    request = new this.context.Request({
      controller: 'auth',
      action: 'login',
      strategy: 'local',
      body: {
        username,
        password
      }
    }, { connection });

    this.entryPoint.execute(request, response => {
      let buffer;

      if (response.status === 200) {
        buffer = new Buffer(JSON.stringify([200, response.content.result]));
        this.jwts.set(socket, response.content.result.jwt);
      } else {
        buffer = new Buffer(JSON.stringify([response.status]));
      }

      socket.write(buffer);
    });
  }

  /*
   Invoked by Kuzzle when a "data.payload" payload needs to be
   broadcasted
  */
  broadcast (channels, payload) {
    for (const channel of channels) {
      // send the payload to all connections having subscribed
      // to that channel
    }
  }

  /*
   Invoked by Kuzzle when a payload needs to be sent to
   a single connection
  */
  notify (channels, connectionId, payload) {
    for (const channel of channels) {
      // send the payload to the connection
    }
  }

  /*
    Invoked by Kuzzle when a connection has subscribed to a channel
   */
  joinChannel (channel, connectionId) {
     // ...
  }

  /*
    Invoked by Kuzzle when a connection leaves a channel
   */
  leaveChannel (channel, connectionId) {
    // ...
  }

  /*
    Invoked by Kuzzle when it needs to force-close a client connection
   */
  disconnect (connectionId) {
    const client = this.clients[connectionId];
    // close the client connection
  }
}

module.exports = GeolightProtocol;
