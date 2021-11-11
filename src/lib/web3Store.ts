import { derived, writable } from "svelte/store"
import type { IWeb3Store } from "$lib/types"


function web3Store(value) {
    const web3Store = writable<IWeb3Store>(value)
    const connector = derived(web3Store, $state => $state.connector)
    const account = derived(web3Store, $state => $state.account)
    const chainId = derived(web3Store, $state => $state.chainId)
    const library = derived(web3Store, $state => $state.library)
    const active = derived(web3Store, $state => $state.active)
    const error = derived(web3Store, $state => $state.error)

    function clear() {
        web3Store.set({
            connector: undefined,
            library: undefined,
            chainId: undefined,
            account: undefined,
            active: undefined,
            error: undefined
        })
    }

    return {
        ...web3Store,

        connector,
        account,
        chainId,
        library,
        active,
        error,

        clear
    }
}

export default web3Store