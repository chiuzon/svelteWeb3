/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IConnectorUpdate } from './types'
import { ConnectorEvent } from './types'
import { EventEmitter } from 'events'

export abstract class AbstractConnector extends EventEmitter {
    public readonly supportedChainIds?: number[]

    constructor(supportedChainIds: number[]){
        super({})
        this.supportedChainIds = supportedChainIds
    }

    public abstract activate(): Promise<IConnectorUpdate>
    public abstract getProvider(): Promise<any>
    public abstract getChainId(): Promise<number | string>
    public abstract getAccount(): Promise<number | null>
    public abstract deactivate(): void

    protected emitUpdate(update: IConnectorUpdate): void {
        console.log(`Emitting ${ConnectorEvent.Update} with payload`, update)

        this.emit(ConnectorEvent.Update, update)
    }

    protected emitError(error: Error): void {
        console.log(`Emitting ${ConnectorEvent.Error} with payload`, error)

        this.emit(ConnectorEvent.Error, error)
    }

    protected emitDeactivate(): void {
        console.log(`Emitting '${ConnectorEvent.Deactivate}'`)

        this.emit(ConnectorEvent.Deactivate)
    }
}