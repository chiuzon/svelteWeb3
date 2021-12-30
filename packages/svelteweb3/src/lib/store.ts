import { UnsupportedChainIdError } from '$lib/errors';
import { InvalidGetLibraryFunctionError } from './errors';
import { derived, get, writable } from 'svelte/store';
import { ConnectorEvent, ConnectorUpdate } from '@web3-react/types';
import { parseChainId, parseUpdate } from './parsers';

import type { Readable } from 'svelte/store'
import type { AbstractConnector } from '@web3-react/abstract-connector';
import type { GetLibSig, IWeb3Store } from './types';
import type { Web3Provider } from '@ethersproject/providers';

export const createWeb3Store = (getLibraryFunc: GetLibSig): {
  activate: (connector: AbstractConnector, onError?: (error: Error) => void, throwErrors?: boolean) => Promise<void>,
  deactivate: () => void,
  connector: Readable<AbstractConnector>,
  library: Readable<Web3Provider>,
  account: Readable<string>,
  chainId: Readable<number>,
  active: Readable<boolean>,
  error: Readable<Error>
} => {
  if(!getLibraryFunc){
    throw new InvalidGetLibraryFunctionError();
  }

  const initialValues = (): IWeb3Store => {
    return {
      connector: undefined,
      libraryFunc: getLibraryFunc,
      library: undefined,
      account: null,
      chainId: 0,
      active: false,
      error: null
    }
  }

  const store = writable<IWeb3Store>(initialValues());
  const {set, update} = store

  const connector = derived(store, ($store) => $store.connector);
  const library = derived(store, ($store) => $store.library);
  const account = derived(store, ($store) => $store.account);
  const chainId = derived(store, ($store) => $store.chainId);
  const active = derived(store, ($store) => $store.active);
  const error = derived(store, ($store) => $store.error)
  
  const activate = async (
    connector: AbstractConnector,
    onError?: (error: Error) => void,
    throwErrors = false
  ) => {
    let activated = false

    try {
      const connectorUpdate = await connector.activate().then((update) => {
        activated = true
        return update
      })

      const parsedUpdate = await parseUpdate(connector, connectorUpdate)

      update((self) => {
        self.connector = connector
        self.library = self.libraryFunc(parsedUpdate.provider)
        self.chainId = parsedUpdate.chainId
        self.account = parsedUpdate.account
        self.active = connector !== undefined && parsedUpdate !== undefined && parsedUpdate.account !== undefined || null
        self.error = null
        return self
      })
    }catch(error){
      if(onError){
        activated && connector.deactivate()
        onError(error)
      }else if(throwErrors){
        activated && connector.deactivate()
        throw error
      }else{
        set(initialValues())
      }
    }
  }

  const deactivate = () => { 
    get(store).connector?.deactivate()
    set(initialValues())
  }

  const onError = (error: Error) => update((prev) => {
    prev.error = error
    return prev
  })

  const onUpdate = async (update: ConnectorUpdate) => {

    if(!get(store).error){
        const chainId = update.chainId === undefined ? undefined : parseChainId(update.chainId)

        const connector = get(store).connector

        if(chainId !== undefined && 
          !!connector.supportedChainIds && 
          !connector.supportedChainIds.includes(chainId) 
        ){
          const error = new UnsupportedChainIdError(chainId, connector.supportedChainIds)
          
         onError(error)
        }else{
          try {
            const parsedUpdate = await parseUpdate(connector, update)

            store.update((prev) => {
              prev.chainId = parsedUpdate.chainId
              prev.account = parsedUpdate.account
              return prev
            })
          }catch(e){
            onError(e)
          }
        }
      }else{
        try {
          const parsedUpdate = await parseUpdate(get(store).connector, update)

          store.update((prev) => {
            prev.library = prev.libraryFunc(parsedUpdate.provider)
            prev.chainId = parsedUpdate.chainId
            prev.account = parsedUpdate.account
            prev.error = null
            return prev
          })
        } catch(e){
          onError(e)
        }
      }
  }

  const onDeactivate = () => set(initialValues())

  store.subscribe(({connector}) => {
    if(connector){
      connector.eventNames().includes(ConnectorEvent.Update) && connector.off(ConnectorEvent.Update, onUpdate)
      connector.eventNames().includes(ConnectorEvent.Deactivate) && connector.off(ConnectorEvent.Deactivate, onDeactivate)
      connector.eventNames().includes(ConnectorEvent.Error) && connector.off(ConnectorEvent.Error, onError)           
    }
      
    if(connector){
      connector.on(ConnectorEvent.Update, onUpdate)
      connector.on(ConnectorEvent.Deactivate, onDeactivate)
      connector.on(ConnectorEvent.Error, onError)
    }
  })

  return {
    activate, deactivate,
    connector, library, account, chainId, active, error,
  }
}
