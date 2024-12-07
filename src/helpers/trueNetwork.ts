import { U32, U64 } from '@truenetworkio/sdk'
// import { gameWhaleReputationSchema } from '../../true-network/true.config'
import { getTrueNetworkInstance,gameWhaleReputationSchema } from '../true-network/true.config'

export const attestGameWhaleReputationToUser = async (address:string,score:number) => {
  const api = await getTrueNetworkInstance()

  const attestation = await gameWhaleReputationSchema.getAttestation(api, address)

  const output = await gameWhaleReputationSchema.attest(api, address, {
    score: attestation.score + score,
  })

  // Output is usually the transaction hash for verification on-chain.
  console.log(output)

  // Make sure to disconnect the network after operation(s) is done.
  await api.network.disconnect()
}

// attestGamePlayToUser()