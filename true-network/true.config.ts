
import { TrueApi, testnet } from '@truenetworkio/sdk'
import { TrueConfig } from '@truenetworkio/sdk/dist/utils/cli-config'

// If you are not in a NodeJS environment, please comment the code following code:
import dotenv from 'dotenv'
dotenv.config()

export const getTrueNetworkInstance = async (): Promise<TrueApi> => {
  const trueApi = await TrueApi.create(config.account.secret)

  await trueApi.setIssuer(config.issuer.hash)

  return trueApi;
}

export const config: TrueConfig = {
  network: testnet,
  account: {
    address: 'mdanpktfZWRY6brvrSoJrewfJ3aDgUuDkUxpEAdSYDpH6N1',
    secret: process.env.TRUE_NETWORK_SECRET_KEY ?? ''
  },
  issuer: {
    name: 'based_eth_india',
    hash: '0xa9e1464364a6e3b60d1e0d00817147d092cabea14cb5c9def4ab24d1bd8c76a3'
  },
  algorithm: {
    id: undefined,
    path: undefined,
    schemas: []
  },
}
  