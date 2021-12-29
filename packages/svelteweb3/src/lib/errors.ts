export class UnsupportedChainIdError extends Error {
  public constructor(unsupportedChainId: number, supportedChainIds?: readonly number[]) {
    super()
    this.name = this.constructor.name
    this.message = `Unsupported chain id: ${unsupportedChainId}. Supported chain ids are: ${supportedChainIds}.`
  }
}

export class InvalidGetLibraryFunctionError extends Error {
  public constructor() {
    super()
    this.name = this.constructor.name
    this.message = `getLibrary() is invalid!`
  }
}