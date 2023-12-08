import SipClient from './sip-client.js';
import mqttClient from "mqtt";
import config from './config.js';

const sipClient = new SipClient({
  port: config.sipPort,
  bind: config.sipBind,
  host: config.sipServer,
  user: config. sipUser,
  pass: config.sipPass,
  telnum: config. telNum,
  localhost: config.localHost
});


const mqtt = mqttClient.connect(config.mqttUri);

function notify(num, dialog) {
  const numdialog = dialog.length;
  console.log(num, 'status is', dialog[numdialog-1].state[0]);
  let state = dialog[numdialog-1].state[0];
  if (typeof state === 'string') {
    mqtt.publish('sipstatus/'+num, state, {retain: true}, (err) => {
      console.error(err);
    });
  }
}

await sipClient.start();

// Example: Make a call
for (var i = 0; i < config.extensions.length; i++) {
  await sipClient.subscribe(config.extensions[i], notify);
}
