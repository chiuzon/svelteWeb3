import { writable } from "svelte/store"
import type { FetchLibrarySignature } from "$lib/types"

function libraryFuncStore(){
    const {set, subscribe} = writable<FetchLibrarySignature>(null)

    function setLibrary(func: FetchLibrarySignature) {
        set(func)
    }

    return {
        subscribe,
        setLibrary
    }
}

const libraryFunc = libraryFuncStore()

export default libraryFunc