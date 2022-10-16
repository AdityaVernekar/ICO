const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });

const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;

async function main() {
  const cryptoDevsTokenContract = await ethers.getContractFactory("CryptoDevToken");

  const cryptoDevsToken = await cryptoDevsTokenContract.deploy(NFT_CONTRACT_ADDRESS);

  await cryptoDevsToken.deployed();

  console.log("CryptoDevsToken deployed to:", cryptoDevsToken.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// deployed to 0x92879E8A15857c062ED7BD63b0Ce94166A1b260c
