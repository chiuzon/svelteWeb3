/* eslint-disable @typescript-eslint/no-explicit-any */
//https://github.com/NoahZinsmeister/web3-react/blob/v6/packages/injected-connector/src/index.ts
import { AbstractConnector } from "$lib/connectors/abstractConnector";
import type { IConnectorUpdate } from "./types";

export class NoEthereumProviderError extends Error {
    public constructor() {
      super()
      this.name = this.constructor.name
      this.message = 'No ethereum provider was found on window.ethereum .'
    }
}

export class UserRejectedRequestError extends Error {
    public constructor() {
      super()
      this.name = this.constructor.name
      this.message = 'The user rejected the request.'
    }
  }

export class InjectedConnector extends AbstractConnector {

    constructor(supportedChainIds: number[]) {
        super(supportedChainIds)

        this.handleChainChanged = this.handleChainChanged.bind(this)
        this.handleNetworkChanged = this.handleNetworkChanged.bind(this)
        this.handleAccountsChanged = this.handleAccountsChanged.bind(this)
        this.handleClose = this.handleClose.bind(this)
    }

    private handleNetworkChanged(networkId: string | number): void {
        console.log("Handling 'networkChanged' event with payload", networkId)

        this.emitUpdate({ chainId: networkId, provider: window['ethereum'] })
    }

    private handleChainChanged(chainId: string | number): void {
        console.log("Handling 'chainChanged' event with payload", chainId)

        this.emitUpdate({ chainId: chainId, provider: window['ethereum']})
    }

    private handleAccountsChanged(accounts: string[]): void {
        console.log("Handling 'accountsChanged' event with payload", accounts)
        
        accounts.length === 0 ? this.emitDeactivate() : this.emitUpdate({ account: accounts[0] })
    }

    private handleClose(code: number, reason: string): void { 
        console.log("Handling 'close' event with payload", code, reason)

        this.emitDeactivate()
    }

    public async getProvider(): Promise<any> {
        return window['ethereum']
    }

    public async activate(): Promise<IConnectorUpdate> {
        if(!window['ethereum']){
            throw new NoEthereumProviderError()
        }

        if(window['ethereum'].on){
            window['ethereum'].on('chainChanged', this.handleChainChanged)
            window['ethereum'].on('accountsChanged', this.handleAccountsChanged)
            window['ethereum'].on('networkChanged', this.handleNetworkChanged)
            window['ethereum'].on('close', this.handleClose)
        }

        if(window['ethereum'].isMetaMask) {
            window['ethereum'].autoRefreshOnNetworkChange = false
        }

        let account

        try {
            account = (await window['ethereum'].request({ method: 'eth_requestAccounts' }))[0]
        }catch(e){
            if ((e as any).code === 4001) {
                throw new UserRejectedRequestError()
            }

            console.warn('eth_requestAccounts was unsuccessful, falling back to enable')
        }

        if(!account){
            account = await window['ethereum'].enable().then((accounts) => account = accounts[0])
        }

        return {provider: window['ethereum'], ...(account ? {account} : {})}
    }
    
    public async getChainId(): Promise<string | number> {
        if(!window['ethereum']) {
            throw new NoEthereumProviderError
        }

        let chainId

        try {
            chainId = await window['ethereum'].request({ method: 'eth_chainId' }).then(chainId)
        } catch {
            console.warn('eth_chainId was unsuccessful, falling back to net_version')
        }

        if(!chainId) {
            try {
                chainId = await window['ethereum'].request({ method: 'net_version' }).then(chainId)
            } catch {
                console.warn('net_version was unsuccessful, falling back to net version v2')
            }
        }

        if(!chainId) {
            try {
                chainId = window['ethereum'].send({ method: 'net_version' }).result
            } catch {
                console.warn('net_version v2 was unsuccessful, falling back to manual matches and static properties')
            }
        }

        if(!chainId){
            if(window['ethereum'].isDapper){
                chainId = window['ethereum'].cachedResults.net_version
            }else{
                chainId = 
                    window['ethereum'].chainId ||
                    window['ethereum'].netVersion ||
                    window['ethereum'].networkVersion ||
                    window['ethereum']._chainId
            }
        }

        return chainId
    }

    public async getAccount(): Promise<number> {
       if(!window['ethereum']) {
           throw new NoEthereumProviderError
       }

       let account

       try {
        account = (await window['ethereum'].request({method: 'eth_accounts'}).then(accounts => account = accounts[0]))[0]
       } catch {
        console.warn(`eth_accounts was unsuccessful, falling back to enable`)
       }

       if(!account){
           try {
            account = await window['ethereum'].enable().then((accounts) => account = accounts[0])
           } catch {
            console.warn(`window['ethereum'].enable() was unsuccessful, falling back to enable`)
           }
       }

       if(!account){
           account = window['ethereum'].send({ method: 'eth_accounts' }).result[0]
       }

       return account
    }
    
    public deactivate(): void {
        if (window['ethereum'] && window['ethereum'].removeListener) {
            window['ethereum'].removeListener('chainChanged', this.handleChainChanged)
            window['ethereum'].removeListener('accountsChanged', this.handleAccountsChanged)
            window['ethereum'].removeListener('close', this.handleClose)
            window['ethereum'].removeListener('networkChanged', this.handleNetworkChanged)
        }
    }

    public async isAuthorized(): Promise<boolean> {
        if (!window['ethereum']) {
          return false
        }
    
        try {
          return await window['ethereum'].request({method: 'eth_accounts'}).then(accounts => {
            if(accounts.length > 0){
                return true
            } else{
                return false
            }
          })
        } catch {
          return false
        }
      }
}