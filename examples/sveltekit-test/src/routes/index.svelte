<script lang="ts">
  import { web3Store } from "$lib/store";
  import {InjectedConnector} from '@web3-react/injected-connector'

  const injectedConnector = new InjectedConnector({ supportedChainIds: [1]})

  const {active, account , activate, deactivate, error} = web3Store

  const connectButton = async () => {
    await activate(injectedConnector, (error) => {
      console.log(error)
    })
  }
</script>

<h1>Hello</h1>
{$error}

{#if $active}
  {$account}
{/if}

<button on:click={() => {
  deactivate()
}}>Deactivate</button>
<button on:click={connectButton}>Connect</button>
