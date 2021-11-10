<script lang="ts">
   export let fetchLibrary: (provider: any) => any
   
   import { onMount } from 'svelte';
   import { setFetchLibraryFunc } from '$lib/svelteWeb3'

   onMount(() => {
      setFetchLibraryFunc(fetchLibrary)
   })
</script>

<slot />
