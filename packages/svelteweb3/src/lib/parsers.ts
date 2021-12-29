import type { AbstractConnector } from '@web3-react/abstract-connector'
import type { ConnectorUpdate } from '@web3-react/types'
import { UnsupportedChainIdError } from '$lib/errors'

export function parseChainId(chainId: string | number): number {
  if (typeof chainId === 'string') {
      // Temporary fix until the next version of Metamask Mobile gets released.
      // In the current version (0.2.13), the chainId starts with “Ox” rather
      // than “0x”. Fix: https://github.com/MetaMask/metamask-mobile/pull/1275
      chainId = chainId.replace(/^Ox/, '0x')

      const parsedChainId = Number.parseInt(chainId, chainId.trim().substring(0, 2) === '0x' ? 16 : 10)
    
      Number.isNaN(parsedChainId) && ( () => { throw Error(`chainId ${chainId} is not an integer`) })()

      return parsedChainId
  } else {
      !Number.isInteger(chainId) && ( () => { throw Error(`chainId ${chainId} is not an integer`) })()

      return chainId
  }
}

export async function parseUpdate(
  connector: AbstractConnector,
  update: ConnectorUpdate
): Promise<ConnectorUpdate<number>> {
  const provider = update.provider === undefined ? await connector.getProvider() : update.provider
  const [_chainId, _account] = (await Promise.all([
    update.chainId === undefined ? connector.getChainId() : update.chainId,
    update.account === undefined ? connector.getAccount() : update.account
  ])) as [Required<ConnectorUpdate>['chainId'], Required<ConnectorUpdate>['account']]

  const chainId = parseChainId(_chainId)
  if (!!connector.supportedChainIds && !connector.supportedChainIds.includes(chainId)) {
    throw new UnsupportedChainIdError(chainId, connector.supportedChainIds)
  }
  const account = _account

  return { provider, chainId, account }
}