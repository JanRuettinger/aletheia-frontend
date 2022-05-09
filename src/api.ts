import axios from 'axios';

import { TokenMetaData } from './types';

const chainID = process.env.NEXT_PUBLIC_CHAIN_ID;
const apiKey = process.env.NEXT_PUBLIC_COVALENT_API_KEY;
const relayerURL = process.env.NEXT_PUBLIC_RELAYER_URL;

export async function getTokenIDsFromContract(
  contractAddress: string
): Promise<TokenMetaData[]> {
  const params = new URLSearchParams();
  params.append('quote-currency', 'USD');
  params.append('format', 'JSON');
  params.append('key', apiKey);
  const response = await axios.get(
    `https://api.covalenthq.com/v1/${chainID}/tokens/${contractAddress}/nft_token_ids/`,
    { params }
  );
  return response.data.data.items;
}

export async function sendICToRelayer(identityCommitment: string) {
  try {
    const reponse = await axios.post(
      relayerURL + 'identitycommitments',
      {
        identityCommitment: identityCommitment,
      },
      {
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      }
    );
    console.log('response: ', reponse);
    return true;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function requestTokensFromRelayer(address: string) {
  console.log('in request tokens');
  try {
    const response = await axios.post(
      relayerURL + 'tokens',
      {
        address: address,
      },
      {
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      }
    );
    console.log('response: ', response);
    return response.data.status;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function requestLatestUpdateTimestamp() {
  try {
    const reponse = await axios.get(relayerURL + 'update', {
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    });
    console.log('response: ', reponse);
    return true;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
