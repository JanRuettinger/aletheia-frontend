import Head from 'next/head';
import { AppProps } from 'next/app';
import { InjectedConnector, Provider, chain, defaultChains } from 'wagmi';
import { providers } from 'ethers';
import '../styles/index.css';

const PROVIDER_URL = process.env.NEXT_PUBLIC_PROVIDER_URL;
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID;

const provider = new providers.JsonRpcProvider(PROVIDER_URL, CHAIN_ID);

// Chains for connectors to support
const chains = [
  {
    id: 1666700000,
    name: 'Harmony Testnet Shard 0',
    rpcUrls: ['https://api.s0.b.hmny.io'],
    nativeCurrency: { name: 'ONE', symbol: 'ONE', decimals: 18 as 18 },
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
