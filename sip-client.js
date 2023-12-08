import { UserAgent, Subscriber, Registerer, Notification } from 'sip.js';
import udpTransport from './udp-transport.js';
import { parseString } from "xml2js";

class SIP {

  constructor(conf){

    this.userAgent = new UserAgent({
      transportConstructor: udpTransport,
      transportOptions: {
        port: conf.port,
        host: conf.bind
      },
      contactName: conf.telnum,
      contactParams: {
        transport: 'udp'
      },
      viaHost: conf.localhost,
      uri: UserAgent.makeURI(`sip:${conf.telnum}@${conf.host}`),
      authorizationUsername:  conf.user,
      authorizationPassword: conf.pass,
      register: true
    });
    this.conf = conf;
  }

  async start() {
    const resp = await this.userAgent.start();
    this.registerer = new Registerer(this.userAgent);
    const reg = await this.registerer.register({params: {uri: `sip:${this.telnum}@${this.conf.host}`}});
    console.log('SIP service started');
  }


  async subscribe(to, cb) {
    const target = UserAgent.makeURI(`sip:${to}@${this.conf.host}`);
    const fromUri = UserAgent.makeURI(`sip:${this.conf.telnum}@${this.conf.host}`);
    if (!target) {
      throw new Error("Failed to create target URI.");
    }

    const subscriber = new Subscriber(this.userAgent, target, 'dialog', {extraHeaders: ['Allow-Events: aastra-xml, vdp-session, talk, hold, conference, LocalModeStatus', 'Accept: application/sdp,application/dtmf-relay,text/plain', 'Supported: path, gruu'], expires: 3600});

    subscriber.delegate = {
      onNotify: (notification) => {
        //console.log(notification.incomingNotifyRequest.message.body);
        parseString(notification.incomingNotifyRequest.message.body, function (err, results) {
          //console.log(results['dialog-info'].dialog);
          cb(to, results['dialog-info'].dialog);
        });

        // send a response
        notification.accept();
        // handle notification here
      }
    };

    subscriber.stateChange.addListener((state) => {

      console.log(`Call state changed to ${state}`);
      let sdh = null;

      switch (state) {
      case "Initial":
        break;
      case "Establishing":
        break;
      case "Subscribed":
        //console.log(sdh);
        // a reference to this inviters session description handler to get media details if needed

        break;
      case "Terminating":
        break;
      case "Terminated":
        break;
      default:
        // throw new Error("Unknown state.");
        console.log("Unknown state.", state);
      }
    });

    await subscriber.subscribe();
  }

}

export default SIP;
