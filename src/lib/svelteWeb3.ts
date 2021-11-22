// eslint-disable-next-line @typescript-eslint/no-explicit-any
import type { AbstractConnector } from '@web3-react/abstract-connector'
import type { ConnectorUpdate } from '@web3-react/types'
import type { FetchLibrarySignature } from './types';

import { get } from "svelte/store"
import { ConnectorEvent } from '@web3-react/types'

import web3Store from '$lib/web3Store'
import libraryFunc from '$lib/_libraryStore'

export class UnsupportedChainIdError extends Error {
    public constructor(unsupportedChainId: number, supportedChainIds?: readonly number[]) {
      super()
      this.name = this.constructor.name
      this.message = `Unsupported chain id: ${unsupportedChainId}. Supported chain ids are: ${supportedChainIds}.`
    }
}

// https://github.com/NoahZinsmeister/web3-react/blob/v6/packages/core/src/normalizers.ts
export function normalizeChainId(chainId: string | number): number {
    if (typeof chainId === 'string') {
        // Temporary fix until the next version of Metamask Mobile gets released.
        // In the current version (0.2.13), the chainId starts with “Ox” rather
        // than “0x”. Fix: https://github.com/MetaMask/metamask-mobile/pull/1275
        chainId = chainId.replace(/^Ox/, '0x')
  
        const parsedChainId = Number.parseInt(chainId, chainId.trim().substring(0, 2) === '0x' ? 16 : 10)
      
        Number.isNaN(parsedChainId) && ( () => { throw Error(`chainId ${chainId} is not an integer`) })()
  
        return parsedChainId
    } else {
        !Number.isInteger(chainId) && ( () => { throw Error(`chainId ${chainId} is not an integer`) })()

        return chainId
    }
}

//https://github.com/NoahZinsmeister/web3-react/blob/v6/packages/core/src/manager.ts#L96
export async function parseUpdate(
    connector: AbstractConnector,
    update: ConnectorUpdate
): Promise<ConnectorUpdate<number>> {
    const provider = update.provider === undefined ? await connector.getProvider() : update.provider
    const [_chainId, _account] = (await Promise.all([
      update.chainId === undefined ? connector.getChainId() : update.chainId,
      update.account === undefined ? connector.getAccount() : update.account
    ])) as [Required<ConnectorUpdate>['chainId'], Required<ConnectorUpdate>['account']]
  
    const chainId = normalizeChainId(_chainId)
    if (!!connector.supportedChainIds && !connector.supportedChainIds.includes(chainId)) {
      throw new UnsupportedChainIdError(chainId, connector.supportedChainIds)
    }
    const account = _account
  
    return { provider, chainId, account }
}

const svelteWeb3Store = web3Store({
    connector: undefined, 
    library: undefined, 
    chainId: undefined, 
    account: undefined, 
    active: undefined,
    error: undefined
})

function svelteWeb3() {

    async function activate(
        web3Connector: AbstractConnector, 
        onError?: (error: Error) => void,
        throwErrors = false   
    ): Promise<void> {
        let activated = false

        try {
            const connectorUpdate = await web3Connector.activate().then((update) => {
                activated = true
                return update
            })

            const parsedUpdate = await parseUpdate(web3Connector, connectorUpdate)
            
            const fetchLibraryFunc = get(libraryFunc)

            if(!fetchLibraryFunc){
                const error = new Error("fetchLibrary isn't set")
                onError && onError(error)
            }

            svelteWeb3Store.set({
                connector: web3Connector,
                library: fetchLibraryFunc(parsedUpdate.provider),
                chainId: parsedUpdate.chainId,
                account: parsedUpdate.account,
                active: web3Connector !== undefined && parsedUpdate !== undefined && parsedUpdate.account !== undefined,
                error: null
            })
        } catch(error) {
            if(onError){
                activated && web3Connector.deactivate()
                onError(error)
            }else if(throwErrors){
                activated && web3Connector.deactivate()
                throw error
            }else{
                svelteWeb3Store.clear()
            }
        }   
    }

    function deactivate() {
        svelteWeb3Store.clear()
    }

    return { 
        connector: svelteWeb3Store.connector,
        library: svelteWeb3Store.library,
        account: svelteWeb3Store.account,
        chainId: svelteWeb3Store.chainId,
        active: svelteWeb3Store.active,
        error: svelteWeb3Store.error,
        
        activate,
        deactivate
    }
}

function onDeactivate() {
    svelteWeb3Store.clear()
}


function onError(error: Error) {
    svelteWeb3Store.update((prev) => {
        prev.error = error
        return prev
    })
}

async function onUpdate(update: ConnectorUpdate) {
  
    if(!get(svelteWeb3Store.error)){
        const chainId = update.chainId === undefined ? undefined : normalizeChainId(update.chainId)

        if (chainId !== undefined && 
            !!get(svelteWeb3Store.connector).supportedChainIds && 
            !get(svelteWeb3Store.connector).supportedChainIds.includes(chainId)
        ) {
            const error = new UnsupportedChainIdError(chainId, get(svelteWeb3Store.connector).supportedChainIds)
            onError(error)

            svelteWeb3Store.update((prev) => {
                prev.account = undefined
                return prev;
            })
        } else {
            // const account = typeof update.account === 'string' ? normalizeAccount(update.account) : update.account
            const parsedUpdate = await parseUpdate(get(svelteWeb3Store.connector), update)

            svelteWeb3Store.update((prev) => {
                prev.chainId = parsedUpdate.chainId
                prev.account = parsedUpdate.account
                return prev;
            })
        }
    }else{
        try {
            const parsedUpdate = await parseUpdate(get(svelteWeb3Store.connector), update)

            svelteWeb3Store.update((prev) => {
                prev.library = get(libraryFunc)(parsedUpdate.provider)
                prev.chainId = parsedUpdate.chainId
                prev.account = parsedUpdate.account
                prev.error = undefined
                return prev;
            })

        } catch (error){
            onError(error)
        }
    }
}

svelteWeb3Store.connector.subscribe((self) => {
    if(self){
        self.eventNames().includes(ConnectorEvent.Update) && self.off(ConnectorEvent.Update, onUpdate)
        self.eventNames().includes(ConnectorEvent.Deactivate) && self.off(ConnectorEvent.Deactivate, onDeactivate)
        self.eventNames().includes(ConnectorEvent.Error) && self.off(ConnectorEvent.Error, onError)           
    }
        
    if(self){
        self.on(ConnectorEvent.Update, onUpdate)
        self.on(ConnectorEvent.Deactivate, onDeactivate)
        self.on(ConnectorEvent.Error, onError)
    }
})

async function initSvelteWeb3(fetchLibrary: FetchLibrarySignature, useFixers = true): Promise<void> {
    if(useFixers){
        !(window as any)['global'] && ((window as any)['global'] = window)
        !window.Buffer && (window.Buffer = window.Buffer || await (await import('buffer')).Buffer)
    }

    libraryFunc.setLibrary(fetchLibrary)
}

export { svelteWeb3, initSvelteWeb3 }