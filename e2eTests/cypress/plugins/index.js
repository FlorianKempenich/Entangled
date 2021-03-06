/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */

const mqtt = require("mqtt");

class MqttClient {
  mqttClient = null;
  msgListeners;

  constructor() {
    this.topic = "entangled";
    this.msgListeners = [];
  }

  connectAndSubscribe(channel) {
    if (this.isConnected()) this.disconnect();

    const url = "mqtt://localhost";
    const options = {
      username: "entangled",
      password: "hello",
    };

    this.mqttClient = mqtt.connect(url, options);
    this.mqttClient.on("connect", () => {
      this.mqttClient.subscribe(channel);
    });
    this.mqttClient.on("message", (_topic, messageBuffer) => {
      this.notifyAllListeners(messageBuffer.toString());
    });
  }

  isConnected() {
    return this.mqttClient !== null;
  }

  disconnect() {
    if (!this.isConnected()) return;

    this.mqttClient.end();
    this.mqttClient = null;
  }

  notifyAllListeners(newMessage) {
    for (const listener of this.msgListeners) {
      listener(newMessage);
    }
  }

  registerMsgListener(listener) {
    this.msgListeners.push(listener);
  }

  send(message) {
    this.mqttClient.publish(this.topic, message);
  }
}

const mqttClient = new MqttClient();
let waitingForMsgPromise;

module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  on("task", {
    mqttInit(channel) {
      mqttClient.connectAndSubscribe(channel);
      return null;
    },

    mqttListenForMsg() {
      waitingForMsgPromise = new Promise((resolve) => {
        mqttClient.registerMsgListener(resolve);
      });
      return null;
    },

    mqttOnMsg() {
      if (waitingForMsgPromise == null) {
        throw new Error("Call 'mqttListenForMsg' before calling 'mqttOnMsg'");
      }

      const pendingWaitingForMsgPromise = waitingForMsgPromise;
      waitingForMsgPromise = null;
      return pendingWaitingForMsgPromise;
    },

    mqttSend(msg) {
      mqttClient.send(JSON.stringify(msg))
      return null;
    },

    mqttDestroy() {
      mqttClient.disconnect();
      return null;
    },
  });
};
