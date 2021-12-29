import type { AbstractConnector } from "@web3-react/abstract-connector";
import type { Web3Provider } from "@ethersproject/providers"

export type GetLibSig = (provider: unknown) => Web3Provider

export interface IWeb3Store {
  connector: AbstractConnector,
  library: Web3Provider,
  libraryFunc: GetLibSig,
  chainId: number,
  account: null | string,
  active: boolean,
  error: Error
}