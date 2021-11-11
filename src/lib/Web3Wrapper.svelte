<script lang="ts">
   export let fetchLibrary: (provider: any) => any
   
   import { onMount } from 'svelte';
   import { svelteWeb3 } from '$lib/svelteWeb3'

   onMount(async () => {
      window.global = window;
      window.Buffer = window.Buffer || await (await import('buffer')).Buffer;

      const { setFetchLibraryFunc } = svelteWeb3()

      setFetchLibraryFunc(fetchLibrary)
   })
</script>

<slot />
