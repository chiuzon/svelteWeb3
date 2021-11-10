

export interface IConnectorUpdate <T = number | string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    provider?: any,
    chainId?: T,
    account?: null | string
}

export enum ConnectorEvent {
    Update = 'SvelteWeb3Update',
    Error = 'SvelteWeb3Error',
    Deactivate = 'SvelteWeb3Deactivate'
}