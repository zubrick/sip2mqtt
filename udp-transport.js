import * as udp from 'dgram';
import { Core } from 'sip.js';

class UDPTransport {
    constructor(logger, options) {
        this.logger = logger;
        this.port = options.port || 5060;
        this.server = options.server;
        this._protocol = 'UDP';
        this.client = null;
        this.listening = false;
    }
    connect() {
        this.client = udp.createSocket('udp4');

        this.client.on('error', (err) => {
            this.logger.warn("UDP socket closed unexpectedly");
            this.logger.log(err);
            this.client.close();
            this.listening = false;
        });

        this.client.on('message', (msg, rinfo) => {
            this.logMessage("received", msg);
            if (this.onMessage) {
                try {
                    this.onMessage(msg.toString('utf8'));
                }
                catch (e) {
                    this.logger.error(e);
                    this.logger.error("Exception thrown by onMessage callback");
                    throw e; // rethrow unhandled exception
                }
            }
        });

        this.client.on('listening', () => {
            const address = this.client.address();
            console.log(`UDP socket listening on ${address.address}:${address.port}`);
            this.listening = true;
        });

        return new Promise((resolve, reject) => {
            this.client.bind(this.port, this.server, (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    }

    get protocol() {
        return this._protocol;
    }

    logMessage(action, msg) {
        console.log(`Action: ${action}`)
        console.log(`Message: \n\n${msg}\n\n`);
    }

    isConnected() {
        return this.listening;
    }

    async disconnect() {
        return new Promise((resolve, reject) => {
            this.client.close();
            this.listening = false;
            resolve();
        });
    }

    async dispose() {
        return this.disconnect();
    }

    send(data) {
        this.logMessage("sending", data);
        return new Promise((resolve, reject) => {

            // Parse the message
            const message = Core.Parser.parseMessage(data);
            if (!message) {
                console.log('Could not parse message');
                reject('Could not parse message');
            } else {

                let host = null;
                let port = null;
                // TODO - if there is a route header, use that
                // 1. Use the route header
                // 2. Use the RURI
                // 3. Use the Via header
                // 4. Use the Contact header

                if (message.ruri && message.ruri.raw) {
                    // Get the host and port from the message RURI
                    host = message.ruri.raw.host;
                    port = message.ruri.raw.port || 5060;
                } else {
                    // Is there a Via header?
                    if (message.via && message.via.host) {
                        // Get the host and port from the Via header
                        host = message.via.host;
                        port = message.via.port || 5060;
                    } else {
                        // Is there a contact header?
                        //TODO
                    }
                }

                // send the message
                this.client.send(data, port, host, (err) => {

                    if (err) {

                        console.log('RECEVIED ERROR: ');
                        console.log(err);
                        reject(err);
                    } else {
                        resolve();
                    }
                })
            }
        });
    }
}

export default UDPTransport;