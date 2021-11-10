// eslint-disable-next-line @typescript-eslint/no-explicit-any
import type { AbstractConnector } from "$lib/connectors/abstractConnector"
import { ConnectorEvent } from "$lib/connectors/types"
import type { ConnectorUpdate, IWeb3State } from "./types"
import { derived, get, writable } from "svelte/store"

import { normalizeAccount, normalizeChainId } from "$lib/normalizers"

export class UnsupportedChainIdError extends Error {
    public constructor(unsupportedChainId: number, supportedChainIds?: readonly number[]) {
      super()
      this.name = this.constructor.name
      this.message = `Unsupported chain id: ${unsupportedChainId}. Supported chain ids are: ${supportedChainIds}.`
    }
}

//https://github.com/NoahZinsmeister/web3-react/blob/v6/packages/core/src/manager.ts#L96
async function parseUpdate(
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
    const account = _account === null ? _account : normalizeAccount(_account)
  
    return { provider, chainId, account }
}

function createWeb3Store() {
    const web3Store = writable<IWeb3State>({
        connector: undefined,
        library: undefined,
        chainId: undefined,
        account: undefined,
        active: undefined,
        error: undefined
    })

    const connector = derived(web3Store, $state => $state.connector)
    const library = derived(web3Store, $state => $state.library)
    const chainId = derived(web3Store, $state => $state.chainId)
    const account = derived(web3Store, $state => $state.account)
    const active = derived(web3Store, $state => $state.active)
    const error = derived(web3Store, $state => $state.error)
    
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

        console.log(parsedUpdate)

        web3Store.set({
            connector: web3Connector,
            library: get(fetchLibraryFunc)(parsedUpdate.provider),
            chainId: parsedUpdate.chainId,
            account: parsedUpdate.account,
            active: web3Connector !== undefined && parsedUpdate !== undefined && parsedUpdate.account !== undefined,
            error: null
        })

        }catch(error) {
            if(onError){
                activated && web3Connector.deactivate()
                onError(error)
            }else if(throwErrors){
                activated && web3Connector.deactivate()
                throw error
            }else{
                clear()
            }
        }
}

    function clear() {
        web3Store.set({
            connector: null,
            library: null,
            chainId: null,
            account: null,
            active: null,
            error: null
        })
    }

    return {
        clear,
        activate,

        connector,
        library,
        chainId,
        account,
        active,
        error,

        ...web3Store
    }
}

const fetchLibraryFunc = writable<(provider: any) => any>()
const svelteWeb3 = createWeb3Store()

function setFetchLibraryFunc (libraryFunc: (provider: any) => any): void {
    fetchLibraryFunc.set(libraryFunc)
}

async function handleUpdate(update: ConnectorUpdate): Promise<void> {
    
    svelteWeb3.update((prev) => {
        prev.error = null
        return prev
    })

    try {
        const _chainId = update.chainId !== get(svelteWeb3.chainId) ? update.chainId : get(svelteWeb3.chainId)
        const chainId = _chainId === undefined ? undefined : normalizeChainId(_chainId)

        if(
            chainId !== undefined &&
            !!get(svelteWeb3.connector).supportedChainIds && 
            !get(svelteWeb3.connector).supportedChainIds.includes(chainId)
        ){
            const error = new UnsupportedChainIdError(chainId, get(svelteWeb3).connector.supportedChainIds)

            svelteWeb3.update((prev) => {
                prev.chainId = -1
                prev.error = error
                return prev
            })
        } else {
            if(update.account){
                const _account = update.account !== get(svelteWeb3.account) ? update.account : get(svelteWeb3.account)
                const account = typeof _account === 'string' ? _account : normalizeAccount(update.account)

                svelteWeb3.update((prev) => {
                    prev.account = account
                    return prev
                })
            }

            if(chainId){
                svelteWeb3.update((prev) => {
                    prev.chainId = chainId
                    return prev
                })
            }
        }
    }catch(e){
        console.error(e)
    }
}

function handleDeactivate() {
    svelteWeb3.clear()
}

function handleError(error: Error) {
    svelteWeb3.update((prev) => {
        prev.error = error
        return prev
    })
}

svelteWeb3.connector.subscribe((self) => {
    if(self){
       self.eventNames().includes(ConnectorEvent.Update) && self.off(ConnectorEvent.Update, handleUpdate)
       self.eventNames().includes(ConnectorEvent.Deactivate) && self.off(ConnectorEvent.Deactivate, handleDeactivate)
       self.eventNames().includes(ConnectorEvent.Error) && self.off(ConnectorEvent.Error, handleError)
        
    }

    if(self){
        self.on(ConnectorEvent.Update, handleUpdate)
        self.on(ConnectorEvent.Deactivate, handleDeactivate)
        self.on(ConnectorEvent.Error, handleError)
    }
})

export { svelteWeb3, setFetchLibraryFunc }