import React, { useEffect } from 'react';
import {
  useConnect,
  useAccount,
  useNetwork,
  useBalance,
  useProvider,
} from 'wagmi';

export const useIsMounted = () => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return mounted;
};

export default function Home() {
  const [{ data, error }, connect] = useConnect();
  const [{ data: accountData }, disconnect] = useAccount();
  const [{ data: balanceData, error: balanceError, loading: balanceLoading }] =
    useBalance({
      addressOrName: '0xF39963D2A64Fb7Bb9FC38B34A942678152E5180F',
    });
  const [{ data: networkData, error: networkError, loading }, switchNetwork] =
    useNetwork();
  const isMounted = useIsMounted();

  if (accountData) {
    return (
      <div>
        <img src={accountData.ens?.avatar} alt='ENS Avatar' />
        <div>
          {accountData.ens?.name
            ? `${accountData.ens?.name} (${accountData.address})`
            : accountData.address}
        </div>
        <div>Connected to {accountData.connector.name}</div>
        <button onClick={disconnect}>Disconnect</button>
        <div>
          {networkData.chain?.name ?? networkData.chain?.id}{' '}
          {networkData.chain?.unsupported && '(unsupported)'}
        </div>
        {balanceLoading && <div>Fetching balance…</div>}
        {balanceError && <div>Error fetching balance</div>}
        <div>
          {balanceData?.formatted}{' '}
          {networkData.chains[0]?.nativeCurrency.symbol}
        </div>

        {switchNetwork &&
          networkData.chains.map((x) =>
            x.id === networkData.chain?.id ? null : (
              <button key={x.id} onClick={() => switchNetwork(x.id)}>
                Switch to {x.name}
              </button>
            )
          )}

        {error && <div>{error?.message}</div>}
      </div>
    );
  }

  return (
    <div className='container flex items-center p-4 mx-auto min-h-screen justify-center'>
      <main>
        <div>
          {data.connectors.map((connector) => {
            console.log('connector: ', connector);
            console.log('connector ready: ', connector.ready);
            return (
              <button
                className='bg-blue-700 text-white p-4'
                disabled={isMounted ? !connector.ready : false}
                key={connector.id}
                onClick={() => connect(connector)}
              >
                {isMounted
                  ? connector.name
                  : connector.id === 'injected'
                  ? connector.id
                  : connector.name}
                {!connector.ready && '(unsupported)'}
              </button>
            );
          })}

          {error && <div>{error?.message ?? 'Failed to connect'}</div>}
        </div>
      </main>
    </div>
  );
}
