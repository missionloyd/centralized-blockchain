import * as crypto from 'crypto'; 
import chalk from 'chalk';
const mongoose = require("mongoose");
import { shasumGenesis } from './genesis/shasumGenesis';

const blockChainModel = mongoose.model("BlockChain");

// Transfer of funds between two wallets
export class Transaction {
  constructor(
    public amount: number, 
    public payer: string, // public key
    public payee: string // public key
  ) {}

  toString() {
    return JSON.stringify(this);
  }
}

// Individual block on the chain
export class Block {

  public nonce = Math.round(Math.random() * 999999999);

  constructor(
    public index: number,
    public hash: string,
    public prevHash: string, 
    public transaction: Transaction, 
    public ts = Date.now()
  ) {}

  get getHash() {
    const str = JSON.stringify(this);
    const hash = crypto.createHash('SHA256');
    hash.update(str).end();
    return hash.digest('hex');
  }
}


// The blockchain
export class Chain {
  // Singleton instance
  public static instance = new Chain();

  chain: Block[];

  constructor() {
    this.chain = [
      // Genesis block
      new Block(0, shasumGenesis, shasumGenesis, new Transaction(100, 'genesis', 'satoshi')) // money printer
    ];
  }

  // Most recent block
  // get lastBlock() {
  //   return this.chain[this.chain.length - 1];
  // }

  // Most recent block
  getLastBlock(callback: any) {
    return new Promise(resolve => {
      const block = blockChainModel.findOne({}, null, { sort: { _id: -1 }, limit: 1 }, (err: any, block: any) => {
        if(err) return console.error("Cannot find last block");
        return callback(block);
      });
    });
  }

  

  // Proof of work system
  mine(nonce: number) {
    let solution = 1;
    console.log('⛏️  mining...')

    while(true) {

      const hash = crypto.createHash('MD5');
      hash.update((nonce + solution).toString()).end();

      const attempt = hash.digest('hex');

      if(attempt.substr(0,4) === '0000'){
        console.log(`Solved: ${solution}`);
        return solution;
      }

      solution += 1;
    }
  }

  // Add a new block to the chain if valid signature & proof of work is complete
  addBlock(transaction: Transaction, senderPublicKey: string, signature: Buffer) {
    const verify = crypto.createVerify('SHA256');
    verify.update(transaction.toString());

    const isValid = verify.verify(senderPublicKey, signature);

    if (isValid) {

      // get last block
      this.getLastBlock((lastBlock: any) => {
        if(lastBlock) {
          let newBlock = new Block(lastBlock.index + 1, '', lastBlock.hash, transaction);
          newBlock.hash = newBlock.getHash;
          this.mine(newBlock.nonce);
          this.chain.push(newBlock);

          // save block to db
          const testBlock = new blockChainModel(newBlock);
          // testBlock.save((err: any) => {
          //   if(err) return console.log(chalk.red("Cannont save Block to DB! ", err.message));
          //   console.log(chalk.green("Block Saved to DB!"));
          // });
          testBlock.save().then(function(savedData: any) {
            console.log(chalk.green("Block Saved to DB!"));
          }).catch(function (err: any) {
            console.log(chalk.red("Cannont save Block to DB! ", err.message));
          })
        }
      });
    }
  }
}

// Wallet gives a user a public/private keypair
export class Wallet {
  public publicKey: string;
  public privateKey: string;

  constructor() {
    const keypair = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    this.privateKey = keypair.privateKey;
    this.publicKey = keypair.publicKey;
  }

  sendMoney(amount: number, payeePublicKey: string) {
    const transaction = new Transaction(amount, this.publicKey, payeePublicKey);

    const sign = crypto.createSign('SHA256');
    sign.update(transaction.toString()).end();

    const signature = sign.sign(this.privateKey); 
    Chain.instance.addBlock(transaction, this.publicKey, signature);
  }
}
