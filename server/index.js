const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes, toHex } = require("ethereum-cryptography/utils");

app.use(cors());
app.use(express.json());

const balances = {
  "047031a9619a92728cca33856bb32ac82ad14771daf493fa94a2c8e5ccfc28dd4930a91c41682e994c5b06a3915ca410a6bb09612cffd3f82d68b8926c44495a81": 100,
  "04e65bfe0c7224b2c34b9e1f052dd39332333df61975d710170fafbae48425e65a080756278ef8c095554695c95c7b54bea788676cfac150f2cb14dcf88a50f8e5": 50,
  "04fe650c890006292828044c33e31956e58450db893b972a60907ddc90394840dcf7c72cb12b83ec9af443ac31af31bb74249588fac5d40ca61b25caef103fb8e7": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  //TODO: Get a signature from the client-side app
  //recover public address from the signature -> the sender is this one

  const { recipient, amount, signature, recBit} = req.body;
  const sig = new Uint8Array(Object.values(signature));
 
  const publicKey = secp.recoverPublicKey(keccak256(utf8ToBytes(recipient)), sig, parseInt(recBit));
  //console.log(toHex(publicKey));
  const sender = toHex(publicKey);

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
