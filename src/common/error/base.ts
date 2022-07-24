export class BaseError extends Error {
    constructor(message) {
        super(message)
    }
}

export class ServerError extends BaseError {
    constructor(message) {
        super(message)
    }
}

export class ClientError extends BaseError {
    constructor(message) {
        super(message)
    }
}
