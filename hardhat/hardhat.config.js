require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env" });

const privateKey = process.env.PRIVATE_KEY;
const QUICKNODE_HTTP_URL = process.env.QUICKNODE_HTTP_URL;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.10",
  networks: {
    goerli: {
      url: QUICKNODE_HTTP_URL,
      accounts: [privateKey],
    },
  },
};
