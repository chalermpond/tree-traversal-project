import { BaseError } from './base'

export enum RepositoryErrorType {
    InsertError = 'insert-error',
    UpdateError = 'update-error',
}

export class RepositoryError extends BaseError {
    public readonly type: RepositoryErrorType

    constructor(type: RepositoryErrorType, message: string) {
        super(message)
        this.type = type
    }
}
