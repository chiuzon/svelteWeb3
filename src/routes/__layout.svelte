
<script lang="ts">
    import Web3Wrapper from "$lib/Web3Wrapper.svelte";
    import {ethers} from 'ethers'
    import { onMount } from "svelte";

    const fetchLibrary = (provider) => {
        const _provider = new ethers.providers.Web3Provider(provider)
        _provider.pollingInterval = 1000
        return _provider
    }

</script>

<svelte:head>
 
</svelte:head>

<Web3Wrapper fetchLibrary={fetchLibrary}>
    <slot />
</Web3Wrapper>