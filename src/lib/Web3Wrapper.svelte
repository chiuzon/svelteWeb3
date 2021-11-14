<script lang="ts">
   import type { FetchLibrarySignature } from '$lib/types'
   import { onMount } from 'svelte';
   import libraryFunc from '$lib/_libraryStore'
   import { initSvelteWeb3 } from '$lib/svelteWeb3';

   export let fetchLibrary: FetchLibrarySignature

   onMount(async () => {
      if(!fetchLibrary){
         console.error("fetchLibrary isn't set")
         return
      }

      initSvelteWeb3(fetchLibrary)
   })

   $: fetchLibrary && libraryFunc.setLibrary(fetchLibrary)
</script>

<slot />
