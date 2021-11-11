export class UnsupportedChainIdError extends Error {
    public constructor(unsupportedChainId: number, supportedChainIds?: readonly number[]) {
      super()
      this.name = this.constructor.name
      this.message = `Unsupported chain id: ${unsupportedChainId}. Supported chain ids are: ${supportedChainIds}.`
    }
}

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
