import React, { useEffect } from 'react';
import {
  useConnect,
  useAccount,
  useNetwork,
  useContract,
  useContractWrite,
} from 'wagmi';
import { NFTABI } from '../../contracts/NFTABI';

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

  const [
    {
      data: transactionResponseData,
      error: contractError,
      loading: contractLoading,
    },
    write,
  ] = useContractWrite(
    {
      addressOrName: '0xCa93F983864bc015f9792a7B4D4898959471d97D',
      contractInterface: NFTABI,
    },
    'safeMint',
    {
      args: ['0xF39963D2A64Fb7Bb9FC38B34A942678152E5180F'],
    }
  );

  useEffect(() => {
    console.log(transactionResponseData);
  }, [transactionResponseData]);

  const WalletButton = () => {
    console.log(accountData);
    if (accountData) {
      if (networkData.chain?.id !== networkData.chains[0].id) {
        return (
          <button
            className='bg-gray-700 text-white p-2 rounded-md mt-4'
            key={networkData.chains[0].id}
            onClick={() => switchNetwork(networkData.chains[0].id)}
          >
            Switch to Harmony Testnet
          </button>
        );
      } else {
        return (
          <button
            className='bg-gray-700 text-white p-2 rounded-md mt-4'
            onClick={() => write()}
          >
            Mint NFT
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

  return (
    <div className='container flex p-4 mx-auto min-h-screen'>
      <main className='w-full'>
        <div className='text-center text-3xl font-mono'>Athletia</div>
        <div className='grid grid-cols-3 mt-8'>
          <div className='border-2 rounded-lg w-5/6 p-2'>
            <div className='text-2xl font-semibold text-center'>
              I. Mint an NFT
            </div>
            <div className='flex flex-col justify-between items-center'>
              <div className='mt-4'>ZKU Supporter Token</div>
              <div className='mt-4'>
                <img src='images/zku_logo.png' alt='Picture of the author' />
              </div>
              <div className='mt-4'>5/1000 minted so far</div>
              <WalletButton />
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
                reputation is determined by fact if you own the ZKU Supporter
                token or not.
              </div>
              <div className='mt-4'>Last Update: </div>
              <div className='mt-4 text-center'>
                Your NFT ownership is included in the Merkle Tree.
              </div>
            </div>
          </div>
          <div className='border-2 rounded-lg w-5/6 p-2'>
            <div className='text-2xl font-semibold text-center'>
              III. Register in Semaphore Group
            </div>

            <div className='flex flex-col justify-between items-center w-3/4 mx-auto'>
              <div className='mt-4 text-center'>
                In the last step you generate a ZKP proving that you are part of
                the Merkle, i.e. proving that you own an NFT. Now you are part
                of the Semaphore group which allows you to login on websites
                which use the membership in the Semaphore as a login method.
              </div>
              <div className='mt-4'>
                <button className='bg-gray-700 text-white p-2 rounded-md'>
                  Register in Semaphore
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className='mt-16'>Supported websites:</div>
        <div>What to learn more what's happening behind the scenes?</div>
      </main>
    </div>
  );
}
