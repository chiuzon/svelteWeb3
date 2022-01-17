import {createWeb3Store} from "@chiuzon/svelteweb3/package"
import {ethers} from "ethers"

export const web3Store = createWeb3Store((provider) => {
  return new ethers.providers.Web3Provider(provider as any)
})
