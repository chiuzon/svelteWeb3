import { derived, writable } from "svelte/store"
import type { IWeb3Store } from './types';

export const createWeb3Store = () => {
  const initialValues: IWeb3Store = {
    connector: undefined,
    library: undefined,
    account: null,
    chainId: 0,
    active: false,
    error: null
  };

  const store = writable<IWeb3Store>(initialValues);
  const connector = derived(store, ($store) => $store.connector);
  const library = derived(store, ($store) => $store.library);
  const account = derived(store, ($store) => $store.account);
  const chainId = derived(store, ($store) => $store.chainId);
  const active = derived(store, ($store) => $store.active);
  const error = derived(store, ($store) => $store.error)
  
  const {set, update} = store

  function clear() {
    store.set(initialValues);
  }

  return {
    set, update,
    connector, library, account, chainId, active, error,
    clear
  }
}