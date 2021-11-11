import { writable } from "svelte/store"
import type { FetchLibrarySignature } from "$lib/types"

function libraryStore(){
    const {set, subscribe} = writable<FetchLibrarySignature>(null)

    function setLibrary(func: FetchLibrarySignature) {
        set(func)
    }

    return {
        subscribe,
        setLibrary
    }
}


export default libraryStore