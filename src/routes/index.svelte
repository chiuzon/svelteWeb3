<script lang="ts">
    import { InjectedConnector } from '@web3-react/injected-connector'
    import { WalletConnectConnector } from '@web3-react/walletconnect-connector'

    import { svelteWeb3 } from '$lib/svelteWeb3'
    import { onMount } from 'svelte';

    const { account, activate, error, chainId, library } = svelteWeb3()

    const injectedConnector = new InjectedConnector({
        supportedChainIds: [1,3]
    })


    let walletconnect

    walletconnect = new WalletConnectConnector({
            rpc: { 1: "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161" },
            qrcode: true
    })

    onMount(async () => {
       
    })

    const login = async () => {
       await activate(injectedConnector, async (error) => {
            window.location.reload()
       })
    }

</script>
{$error}
{$account}

<!-- {$error}
{$account}
{$chainId}
-->

<button on:click={login}>
    Connect
</button>
