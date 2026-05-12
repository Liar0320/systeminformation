const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const networkPath = path.join(__dirname, '../lib/network.js');
const source = `${fs.readFileSync(networkPath, 'utf8')}\nmodule.exports.__test = { isEthernetInterfaceConnected };`;
const moduleStub = {exports: {}};
const context = {
  console,
  process,
  Buffer,
  setTimeout,
  clearTimeout,
  module: moduleStub,
  exports: moduleStub.exports,
  require: (request) => {
    if (request === './util') {
      return require('../lib/util.js');
    }
    return require(request);
  },
};

vm.runInNewContext(source, context, {filename: networkPath});

const {isEthernetInterfaceConnected} = moduleStub.exports.__test;

assert.equal(
  isEthernetInterfaceConnected({
    iface: 'lo0',
    ifaceName: 'lo0',
    type: 'wired',
    operstate: 'unknown',
    ip4: '127.0.0.1',
    internal: true,
    virtual: false,
  }),
  false,
);

assert.equal(
  isEthernetInterfaceConnected({
    iface: 'utun8',
    ifaceName: 'utun8',
    type: 'wired',
    operstate: 'unknown',
    ip4: '198.18.0.1',
    internal: false,
    virtual: false,
  }),
  false,
);

assert.equal(
  isEthernetInterfaceConnected({
    iface: 'en7',
    ifaceName: 'USB 10/100/1000 LAN',
    type: 'wired',
    operstate: 'up',
    ip4: '192.168.1.42',
    internal: false,
    virtual: false,
  }),
  true,
);
