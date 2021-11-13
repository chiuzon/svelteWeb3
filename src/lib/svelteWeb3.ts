// eslint-disable-next-line @typescript-eslint/no-explicit-any
import type { AbstractConnector } from '@web3-react/abstract-connector'
import type { ConnectorUpdate } from '@web3-react/types'

import { ConnectorEvent } from '@web3-react/types'
import { get } from "svelte/store"
import { UnsupportedChainIdError } from "$lib/errors";
import web3Store from '$lib/web3Store'
import libraryStore from '$lib/libraryStore'
import { parseUpdate, normalizeChainId } from '$lib/utils'

const fetchLibraryStore = libraryStore()
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
            
            const fetchLibraryFunc = get(fetchLibraryStore)

            if(!fetchLibraryFunc){
                onError(new Error("fetchLibrary isn't set"))
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
        setFetchLibraryFunc: fetchLibraryStore.setLibrary,
        
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
                prev.library = get(fetchLibraryStore)(parsedUpdate.provider)
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

export { svelteWeb3 }