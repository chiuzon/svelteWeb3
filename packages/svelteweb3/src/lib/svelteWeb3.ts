import { GetLibSig } from './types';
import { writable, get } from 'svelte/store';
import { createWeb3Store } from './store';
import { AbstractConnector } from '@web3-react/abstract-connector';

const web3Store = createWeb3Store()
const getLibraryStore = writable<GetLibSig>(null)

const svelteWeb3 = () => {
  async function activate(
    connector: AbstractConnector,
    onError?: (error: Error) => void,
    throwErrors = false
  ) {

  }

  async function deactivate() {
    get(web3Store.connector) && get(web3Store.connector).deactivate();
    !get(web3Store.connector) && web3Store.clear()
  }

  return {
    activate, deactivate
  }
}

function init(getLibrary: GetLibSig): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  !(window as any)['global'] && ((window as any)['global'] = window)
  !window.Buffer && (async () => {
    window.Buffer = window.Buffer || (await import('buffer')).Buffer   
  })()

  getLibraryStore.set(getLibrary)
}

export {init, svelteWeb3, web3Store}


