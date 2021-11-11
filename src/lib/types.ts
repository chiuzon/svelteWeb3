/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AbstractConnector } from "@web3-react/abstract-connector";

export type FetchLibrarySignature = (provider: any) => any

export interface ConnectorUpdate<T = number | string> {
    provider?: any
    chainId?: T
    account?: null | string
}

export interface IWeb3Store<T = any>  {
    connector?: AbstractConnector,
    library?: T,
    chainId?: number,
    account?: null | string,

    active: boolean,
    error: Error
}