const database = require("./database");

database.onConnect(async () => {
  const { Wallet, Chain } = require("./blockchain");
  const satoshi = new Wallet();
  const bob = new Wallet();
  const alice = new Wallet();
  const luke = new Wallet();
  const charlie = new Wallet();

  satoshi.sendMoney(50, bob.publicKey);
  await simulateAsyncPause();

  bob.sendMoney(23, alice.publicKey);
  await simulateAsyncPause();

  alice.sendMoney(5, bob.publicKey);
  await simulateAsyncPause();

  luke.sendMoney(15, charlie.publicKey);
  await simulateAsyncPause();

  charlie.sendMoney(5, luke.publicKey);
  await simulateAsyncPause();
  
  console.log(Chain.instance);
});

const simulateAsyncPause = () =>
  new Promise(resolve => {
    setTimeout(() => resolve('ready'), 1000);
  });