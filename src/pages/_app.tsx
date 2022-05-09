import { providers } from 'ethers';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { InjectedConnector, Provider } from 'wagmi';

import '../styles/index.css';

// const provider = new ApiHarmonyProvider('https://a.api.s0.t.hmny.io/');
// const provider = new providers.PocketProvider('harmonymainnet');
// const provider = new providers.Web3Provider(web3.currentProvider);

const PROVIDER_URL = process.env.NEXT_PUBLIC_PROVIDER_URL;
const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID);

const provider = new providers.JsonRpcProvider(PROVIDER_URL, CHAIN_ID);

// Chains for connectors to support
const chains = [
  {
    id: 1666700000,
    name: 'Harmony testnet Shard 0',
    rpcUrls: ['https://api.s0.b.hmny.io'],
    nativeCurrency: { name: 'ONE', symbol: 'ONE', decimals: 18 as 18 }, // eslint-disable-line
    blockExplorers: [
      {
        name: 'Harmony Block Explorer',
        url: 'https://explorer.harmony.one',
        standard: 'EIP3091',
      },
    ],
    testnet: false,
  },
  {
    id: 1666600000,
    name: 'Harmony mainnet Shard 0',
    rpcUrls: ['https://api.harmony.one'],
    nativeCurrency: { name: 'ONE', symbol: 'ONE', decimals: 18 as 18 }, // eslint-disable-line
    blockExplorers: [
      {
        name: 'Harmony Block Explorer',
        url: 'https://explorer.harmony.one',
        standard: 'EIP3091',
      },
    ],
    testnet: false,
  },
];

// blockExplorers: [{…}]
// id: 1
// name: "Mainnet"
// nativeCurrency: {name: 'Ether', symbol: 'ETH', decimals: 18}
// rpcUrls: ['https://mainnet.infura.io/v3']

// Set up connectors
const connectors = () => {
  return [
    new InjectedConnector({
      chains,
      options: { shimDisconnect: true },
    }),
  ];
};

function MyApp({ Component, pageProps }: AppProps) {
  return (
    // <Provider provider={provider}>
    <Provider connectors={connectors} provider={provider}>
      <Head>
        <title>Aletheia - anonymous login</title>
        <meta name='viewport' content='initial-scale=1.0, width=device-width' />
      </Head>
      <Component {...pageProps} />
    </Provider>
  );
}

export default MyApp;
