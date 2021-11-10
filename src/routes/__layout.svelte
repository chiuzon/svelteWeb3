<script>
    import Web3Wrapper from "$lib/Web3Wrapper.svelte";
    import {ethers} from 'ethers'

    const fetchLibrary = (provider) => {
        const _provider = new ethers.providers.Web3Provider(provider)
        _provider.pollingInterval = 1000
        return _provider
    }
</script>


<Web3Wrapper fetchLibrary={fetchLibrary}>
    <slot />
</Web3Wrapper>