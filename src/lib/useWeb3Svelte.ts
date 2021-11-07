import { writable } from "svelte/store"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _provider = writable<any>(null)
const _chainId = writable<number>(0)
const _account = writable<string>(undefined)


const useWeb3Svelte = () => {

    

    return {
        provider: _provider,
        chainId: _chainId,
        account: _account
    }
}

export default useWeb3Svelte