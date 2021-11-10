/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AbstractConnector } from "$lib/connectors/abstractConnector";

export interface ConnectorUpdate<T = number | string> {
    provider?: any
    chainId?: T
    account?: null | string
}

export interface IWeb3State<T = any>  {
    connector?: AbstractConnector,
    library?: T,
    chainId?: number,
    account?: null | string,

    active: boolean,
    error: Error
}