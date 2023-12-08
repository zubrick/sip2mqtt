# sip.js-udp-example

This is an example of how to use the official [SIP.js](https://github.com/onsip/sip.js/) library with UDP transport in NodeJS or Bun. 

## What's what?

#### index.js
The main entrypoint into the example. You can set the `port`, `bind` address and `host` for the URI's.

#### sip-client.js
This is the SIP class that consumes the [SIP.js](https://github.com/onsip/sip.js/) library, the Session Description Handler class and the UDP transport class.

#### sdp.js
This is where you handle the Session Description for your media.

#### udp-transport.js
This is an implementaion of the UDP transport protocol that implements SIP.js [transport](https://github.com/onsip/SIP.js/blob/main/docs/transport.md) class. 

## Getting started

#### NodeJS

Install packages:

```
npm install 
```

Run:

```
npm start
```

#### Bun

Install packages:

```
bun install
```

Run:

```
bun run start
```

## TODOs
- Complete the TODO's in `udp-transport.js`
- Add media to demo calling or messaging, etc.
- Create a TCP/TLS example repo or extend this repo  
