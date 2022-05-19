import { poseidon } from 'circomlibjs'; // v0.0.8
import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import {
  useAccount,
  useConnect,
  useContract,
  useContractWrite,
  useNetwork,
  useProvider,
} from 'wagmi';

import { requestTokensFromRelayer, sendICToRelayer } from '../api';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import { AlethieiaABI } from '../../contracts/AlethieiaABI';
import { OrcaNFTABI } from '../../contracts/OrcaNFTABI';
import { ZkuNFTABI } from '../../contracts/ZKUNFTABI';

export const useIsMounted = () => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return mounted;
};

export default function Home() {
  const [{ data, error }, connect] = useConnect();
  const MetaMaskConnector = data.connectors[0];
  const [{ data: accountData }, disconnect] = useAccount();
  const [{ data: networkData, error: networkError, loading }, switchNetwork] =
    useNetwork();
  const isMounted = useIsMounted();
  const [numMintedZKUNFTs, setNumMintedZKUNFTs] = useState(0);
  const [numMintedORCANFTs, setNumMintedORCANFTs] = useState(0);
  const [ZKUNFTMaxSupply, setZKUNFTMaxSupply] = useState(0);
  const [ORCANFTMaxSupply, setORCANFTMaxSupply] = useState(0);
  const [userSecret, setUserSecret] = useState('');
  const [latestMerkleTreeUpdate, setLatestMerkleTreeUpdate] = useState(0);
  const provider = useProvider();
  const [isLoading, setIsLoading] = useState(false);
  const [alertText, setAlertText] = useState('');
  const [alertType, setAlertType] = useState('');
  const [alertHidden, setAlertHidden] = useState(true);
  const [receivedTokens, setReceivedTokens] = useState(false);

  const ZKUNFTContractAddress = process.env.NEXT_PUBLIC_NFT_1_CONTRACT_ADDRESS;
  const ORCANFTContractAddress = process.env.NEXT_PUBLIC_NFT_2_CONTRACT_ADDRESS;
  const MerkleTreeContractAddress =
    process.env.NEXT_PUBLIC_ALETHEIA_CONTRACT_ADDRESS;

  const STARTBLOCK = parseInt(process.env.NEXT_PUBLIC_STARTBLOCK);

  const CHAIN_INDEX =
    process.env.NEXT_PUBLIC_VERCEL_ENV == 'production' ? 1 : 0;

  const onSubmitSemaphore = async () => {
    // generate identity and send it to backend api
    // const identity = new ZkIdentity();
    // Hash public key + secret
    setIsLoading(true);
    const pubAddr = accountData.address.toLowerCase();
    if (userSecret == '') {
      return;
    }
    const secret = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(userSecret));
    const identityCommitment = poseidon([pubAddr, secret]);
    // const identityCommitment = poseidon([pubAddr, userSecret]);
    try {
      const resp = await sendICToRelayer(identityCommitment.toString());
      if (resp == true) {
        setAlertText('Successfully added your identity.');
        setAlertType('success');
        setAlertHidden(false);
      }
    } catch (error) {
      setAlertText('An error occured while adding your identity.');
      setAlertType('error');
      setAlertHidden(false);
    } finally {
      setTimeout(() => setAlertHidden(true), 2000);
      setIsLoading(false);
    }
  };

  const contractZKUNFT = useContract({
    addressOrName: ZKUNFTContractAddress,
    contractInterface: ZkuNFTABI,
    signerOrProvider: provider,
  });

  const [, safeMintZKU] = useContractWrite(
    {
      addressOrName: ZKUNFTContractAddress,
      contractInterface: ZkuNFTABI,
    },
    'safeMint'
  );

  const contractORCANFT = useContract({
    addressOrName: ORCANFTContractAddress,
    contractInterface: OrcaNFTABI,
    signerOrProvider: provider,
  });

  // contractWriteORCANFT
  const [, safeMintORCA] = useContractWrite(
    {
      addressOrName: ORCANFTContractAddress,
      contractInterface: OrcaNFTABI,
    },
    'safeMint'
  );

  const contractMerkleTree = useContract({
    addressOrName: MerkleTreeContractAddress,
    contractInterface: AlethieiaABI,
    signerOrProvider: provider,
  });

  async function getNumMintedNFTs() {
    contractZKUNFT.totalSupply().then((elm) => {
      setNumMintedZKUNFTs(elm.toString());
    });

    contractORCANFT.totalSupply().then((elm) => {
      setNumMintedORCANFTs(elm.toString());
    });
  }

  async function getTotalSupply() {
    contractZKUNFT.maxSupply().then((elm) => {
      setZKUNFTMaxSupply(elm.toString());
    });
    contractORCANFT.maxSupply().then((elm) => {
      setORCANFTMaxSupply(elm.toString());
    });
  }

  async function getLatestEvent() {
    const eventFilter = {
      address: process.env.NEXT_PUBLIC_ALETHEIA_CONTRACT_ADDRESS,
      topics: [ethers.utils.id('AttestationRootChanged(string,string)')],
    };

    const endBlock = await provider.getBlockNumber();
    let allEvents = [];

    for (let i = STARTBLOCK; i < endBlock; i += 1000) {
      const _startBlock = i;
      const _endBlock = Math.min(endBlock, i + 1000);
      const events = await contractMerkleTree.queryFilter(
        eventFilter,
        _startBlock,
        _endBlock
      );
      allEvents = [...allEvents, ...events];
    }
    if (allEvents.length > 0) {
      const blockHash = allEvents[allEvents.length - 1].blockHash;
      provider.getBlock(blockHash).then((block) => {
        setLatestMerkleTreeUpdate(block.timestamp);
      });
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      await getNumMintedNFTs();
      await getTotalSupply();
      await getLatestEvent();
    };
    fetchData();
    provider;
  }, []);

  useEffect(() => {
    const filter = {
      address: process.env.NEXT_PUBLIC_ALETHEIA_CONTRACT_ADDRESS,
      topics: [ethers.utils.id('AttestationRootChanged(string,string)')],
    };
    provider.on(filter, (log) => {
      const blockHash = log.blockHash;
      provider.getBlock(blockHash).then((block) => {
        setLatestMerkleTreeUpdate(block.timestamp);
      });
    });

    provider.on('block', (block) => {
      getNumMintedNFTs();
    });

    const unsubscribe = () => {
      provider.removeAllListeners();
    };

    return unsubscribe;
  }, [getNumMintedNFTs, provider]);

  const formatTimeStamp = (timestamp) => {
    const date = new Date(timestamp * 1000);
    if (timestamp == 0) {
      return 'not updated since last refresh';
    }
    return date.toLocaleDateString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const WalletButton = () => {
    if (accountData) {
      if (networkData.chain?.id !== networkData.chains[CHAIN_INDEX].id) {
        return (
          <button
            className='bg-gray-700 text-white p-2 rounded-md mt-4'
            key={networkData.chains[CHAIN_INDEX].id}
            onClick={() => {
              switchNetwork(networkData.chains[CHAIN_INDEX].id);
            }}
          >
            Switch to Harmony{' '}
            {process.env.NEXT_PUBLIC_VERCEL_ENV == 'production'
              ? 'Mainnet'
              : 'Testnet'}
          </button>
        );
      } else {
        return (
          <button
            className={`${
              receivedTokens ? 'bg-gray-300' : 'bg-gray-700'
            } text-white p-2 rounded-md mt-4`}
            onClick={async () => {
              setIsLoading(true);
              const resp = await requestTokensFromRelayer(accountData.address);
              setIsLoading(false);
              if (resp == 1) {
                setReceivedTokens(true);
                setAlertText('You just received 0.01 ONE.');
                setAlertType('success');
                setAlertHidden(false);
              } else if (resp == 2) {
                setReceivedTokens(true);
                setAlertText(
                  "Your balance is high enough you don't need tokens."
                );
                setAlertType('warning');
                setAlertHidden(false);
              } else {
                setAlertText('Something went wrong');
                setAlertType('error');
                setAlertHidden(false);
              }
              setTimeout(() => setAlertHidden(true), 3000);
            }}
            disabled={receivedTokens}
          >
            Request Harmony Tokens
          </button>
        );
      }
    } else {
      return (
        <button
          className='bg-gray-700 text-white p-2 rounded-md mt-4'
          disabled={isMounted ? !MetaMaskConnector.ready : false}
          key={MetaMaskConnector.id}
          onClick={() => connect(MetaMaskConnector)}
        >
          {isMounted
            ? 'Connect with MetaMask'
            : MetaMaskConnector.id === 'injected'
            ? MetaMaskConnector.id
            : MetaMaskConnector.name}
          {!MetaMaskConnector.ready && '(unsupported)'}
        </button>
      );
    }
  };

  const MintButton = (props) => {
    if (props.NFTname == 'ZKU') {
      return (
        <button
          className='bg-gray-700 text-white p-2 rounded-md mt-4'
          disabled={isMounted ? !accountData : false}
          key={MetaMaskConnector.id}
          onClick={() =>
            safeMintZKU({
              args: [accountData?.address],
            })
          }
        >
          Mint NFT
        </button>
      );
    } else {
      return (
        <button
          className='bg-gray-700 text-white p-2 rounded-md mt-4'
          disabled={isMounted ? !accountData : false}
          key={MetaMaskConnector.id}
          onClick={() => {
            safeMintORCA({
              args: [accountData?.address],
            });
          }}
        >
          Mint NFT
        </button>
      );
    }
  };

  return (
    <div className='container flex p-4 mx-auto min-h-screen'>
      {isLoading ? <LoadingSpinner /> : null}
      <main className='w-full'>
        <div className='text-center text-3xl font-mono'>Aletheia</div>
        <Alert
          alertType={alertType}
          alertText={alertText}
          alertHidden={alertHidden}
        />
        <div className='flex flex-row justify-center'>
          <div className=''>
            <WalletButton />
          </div>
        </div>
        <div className='grid grid-cols-3 mt-8'>
          <div className='border-2 rounded-lg w-5/6 p-2 flex flex-col'>
            <div className='text-2xl font-semibold text-center'>
              I. Mint an NFT
            </div>
            <div className='flex flex-row justify-center'>
              <div className='flex flex-col justify-between items-center'>
                <div className='mt-4'>ZKU Supporter Token</div>
                <div className='mt-4'>
                  <img src='images/zku_logo.png' alt='Picture of the author' />
                </div>
                <div className='mt-4'>
                  {numMintedZKUNFTs}/{ZKUNFTMaxSupply} minted so far
                </div>
                <MintButton NFTname='ZKU' />
              </div>
              <div className='flex flex-col justify-between items-center'>
                <div className='mt-4'>Orca Token</div>
                <div className='mt-4'>
                  <img src='images/orca.png' alt='Picture of the author' />
                </div>
                <div className='mt-4'>
                  {numMintedORCANFTs}/{ORCANFTMaxSupply} minted so far
                </div>
                <MintButton NFTname='Orca' />
              </div>
            </div>
          </div>
          <div className='border-2 rounded-lg w-5/6 p-2'>
            <div className='text-2xl font-semibold text-center'>
              II. Wait for Merkle Tree Update
            </div>
            <div className='flex flex-col justify-between items-center w-3/4 mx-auto'>
              <div className='mt-4 text-center'>
                A Merkle Tree whose root is stored on chain keeps track of which
                wallet has the right on chain reputation. In this case the
                reputation is determined by fact if you are a proud owner of a
                ZKU Support NFT or an ORCA NFT.
              </div>
              <div className='mt-4'>
                Last Update: {formatTimeStamp(latestMerkleTreeUpdate)}{' '}
              </div>
            </div>
          </div>
          <div className='border-2 rounded-lg w-5/6 p-2'>
            <div className='text-2xl font-semibold text-center'>
              III. Register Password
            </div>

            <div className='flex flex-col justify-between items-center w-3/4 mx-auto'>
              <div className='mt-4 text-center'>
                In the last step you define a global password. You can use this
                password on all supporting websites.
              </div>
              <div className='mt-4 flex flex-col'>
                <div className='border-gray-700 text-gray-700  border-2 p-2 rounded-md'>
                  <input
                    type='password'
                    placeholder='password'
                    onChange={(e) => setUserSecret(e.target.value)}
                  />
                </div>
                <button
                  className='bg-gray-700 text-white p-2 rounded-md mt-2'
                  onClick={() => onSubmitSemaphore()}
                  disabled={accountData ? false : true}
                >
                  Register Password
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className='mt-16'>Supported websites:</div>
        <div>What to learn more what&apos;s happening behind the scenes?</div>
      </main>
    </div>
  );
}
