import Head from "next/head";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { providers, BigNumber, utils, Contract } from "ethers";
import {
  TOKEN_CONTRACT_ABI,
  NFT_CONTRACT_ABI,
  NFT_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ADDRESS,
} from "../constants";

export default function Home() {
  const zero = BigNumber.from(0);
  const [walletConnected, setWalletConnected] = useState(false);
  const [tokensMinted, setTokensMinted] = useState(zero);
  const [tokensOwned, setTokensOwned] = useState(zero);
  const [tokenAmount, setTokenAmount] = useState(zero);
  const [loading, setLoading] = useState(false);
  const [tokensToBeClaimed, setTokensToBeClaimed] = useState(0);

  const web3ModalRef = useRef();

  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Goerli network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 5) {
      window.alert("Change the network to Goerli");
      throw new Error("Change network to Goerli");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
      getBalanceOfCDTokens();
      getTotalSupplyOfCDTokens();
      getTokensToBeClaimed();
    }
  }, [walletConnected]);

  const mintTokens = async (amount) => {
    try {
      const signer = await getProviderOrSigner(true);

      const tokenContract = await new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, signer);

      const value = 0.001 * amount;

      setLoading(true);
      const tx = await tokenContract.mint(amount, {
        value: utils.parseEther(value.toString()),
      });

      await tx.wait();
      setLoading(false);
      window.alert("CD Tokens minted successfully");
      await getBalanceOfCDTokens();
      await getTotalSupplyOfCDTokens();
      await getTokensToBeClaimed();
    } catch (error) {
      console.log(error);
    }
  };

  const getBalanceOfCDTokens = async () => {
    try {
      const provider = await getProviderOrSigner();

      const tokenContract = await new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );

      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();

      const balance = await tokenContract.balanceOf(address);

      setTokensOwned(balance);
    } catch (error) {
      console.log(error);
    }
  };

  const getTotalSupplyOfCDTokens = async () => {
    try {
      const provider = await getProviderOrSigner();

      const tokenContract = await new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );

      const totalSupply = await tokenContract.totalSupply();

      setTokensMinted(totalSupply);
    } catch (err) {
      console.log(err);
    }
  };

  const getTokensToBeClaimed = async () => {
    try {
      const provider = await getProviderOrSigner();

      const nftContract = await new Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, provider);

      const tokenContract = await new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );

      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      console.log("address", address);

      const balance = await nftContract.balanceOf(address);

      if (balance === zero) {
        setTokensToBeClaimed(zero);
        return;
      } else {
        var amount = 0;
        for (var i = 0; i < balance; i++) {
          let tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
          let claimed = await tokenContract.tokenIdsClaimed(tokenId);

          if (!claimed) {
            amount++;
          }
        }
        setTokensToBeClaimed(BigNumber.from(amount));
      }
    } catch (error) {
      console.log(error);
      setTokensToBeClaimed(zero);
    }
  };

  const claimTokens = async () => {
    try {
      const signer = await getProviderOrSigner(true);

      const tokenContract = await new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, signer);

      const tx = await tokenContract.claim();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("CD Tokens claimed successfully");
      await getBalanceOfCDTokens();
      await getTotalSupplyOfCDTokens();
      await getTokensToBeClaimed();
    } catch (error) {
      console.log(error);
    }
  };

  const renderButton = () => {
    if (loading) {
      return <p>Loading.....</p>;
    }
    if (tokensToBeClaimed > 0) {
      return (
        <div className={styles.description}>
          <p>You have {tokensToBeClaimed * 10} tokens to be claimed</p>
          <button onClick={claimTokens} className={styles.button}>
            Claim Tokens
          </button>
        </div>
      );
    }

    return (
      <div className={styles.div}>
        <div>
          <input
            type="text"
            placeholder="Amount of tokens"
            className={styles.input}
            onChange={(e) => {
              setTokenAmount(BigNumber.from(e.target.value));
            }}
          />

          <button
            onClick={() => mintTokens(tokenAmount)}
            disabled={!(tokenAmount > 0)}
            className={styles.button}
          >
            Mint Tokens
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <Head>
        <title>Crypto Devs ICO</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.main}>
        <div className={styles.div}>
          <h1 className={styles.title}> Crypto Devs ICO</h1>
          <p className={styles.description}>Claim or mint CD tokens here</p>
          <div className={styles.description}>{utils.formatEther(tokensOwned)} CD tokens owned</div>

          <div>
            {!walletConnected ? (
              <button onClick={connectWallet} className={styles.button}>
                Connect wallet
              </button>
            ) : (
              <div>{utils.formatEther(tokensMinted)}/10000 CD tokens have been minted till now</div>
            )}
          </div>
          {renderButton()}
        </div>
        <div>
          <img src="./0.svg" alt="" className={styles.image} />
        </div>
      </div>
      <footer className={styles.footer}>Made with &#10084; by Crypto Devs</footer>
    </div>
  );
}
