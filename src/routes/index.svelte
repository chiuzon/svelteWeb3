<script lang="ts">
import { InjectedConnector } from '$lib/connectors/injectedConnector';

    import { svelteWeb3 } from '$lib/svelteWeb3'

    const { account, activate, error, chainId } = svelteWeb3

    const injectedConnector = new InjectedConnector([1, 2])

    const login = async () => {
       await activate(injectedConnector, async (error) => {
           console.log(error)
       })
    }
</script>

{$error}
{$account}
{$chainId}

<button on:click={login}>
    Connect
</button>
