# `svelteWeb3`

A simple, dependency minimized package for building modern dApps with Svelte

## ⚠️ Warning 0.3.0
After 0.3.0 version we don't do any polyfills for the `web3-react` connectors, the `injected-connector` works without any polyfills but packages like `walletconnect-connector` might require `buffer` polyfill.\

For some connectors you might be required to disable `ssr`

### Projects using `svelteWeb3`

`Open a PR to add your project to the list!`


## Instalation

`pnpm install @chiuzon/svelteweb3`

## Usage

```js
//store.js
import { createWeb3Store } from '@chiuzon/svelteweb3'

//You can have any number of Web3Store
export const web3Store = createWeb3Store((provider) => {
  return new ethers.providers.Web3Provider(provider)
})
```

```svelte
//index.svelte
<script>
  import { web3Store } from './store.js'
  import { InjectedConnector } from '@web3-react/injected-connector'

  const injectedConnector = new InjectedConnector({supportedChainIds: [1]})

  const {account, activate} = web3Store

  async function onConnectHandle() {
    await activate(injectedConnector, (error) => {
      console.error(error)
    })
  }
</script>

Account Address: {$account}

<button on:click={() => {
  onConnectHandle()
}}>Connect</button>
```

## Local Development

- Clone repo\
`https://github.com/chiuzon/svelteWeb3`

- Install dependencies\
`pnpm install`

- Build and watch for changes\
`pnpm dev`