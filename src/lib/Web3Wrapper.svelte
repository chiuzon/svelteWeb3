<script lang="ts">
   import { onMount } from 'svelte';
   import libraryFunc from '$lib/_libraryStore'
   import type { FetchLibrarySignature } from '$lib/types'

   export let fetchLibrary: FetchLibrarySignature

   onMount(async () => {
      !(window as any)['global'] && ((window as any)['global'] = window)
      !window.Buffer && (window.Buffer = window.Buffer || await (await import('buffer')).Buffer)
      
      if(fetchLibrary){
         libraryFunc.setLibrary(fetchLibrary)
      }else{
         console.error("fetchLibrary isn't set")
      }
   })

   $: libraryFunc.setLibrary(fetchLibrary)
</script>

<slot />
