import { ICipher } from './interface/cipher.interface'
import { IConfig } from './interface/config.interface'
import * as Crypto from 'crypto'
import { readFileSync } from 'fs'

export class Cipher implements ICipher {

    private readonly _privateKey: Buffer
    private readonly _cipherAlgorithm: string = 'aes-192-cbc'
    private readonly _cipherPassword: string = 'cipherpassword'
    private readonly _scryptKey: Buffer

    constructor(
        private readonly _config: IConfig,
    ) {
        this._privateKey = readFileSync(this._config.auth.private)
        this._scryptKey = Crypto.scryptSync(this._cipherPassword, 'salt', 24)
    }

    public decrypt(encrypted: string): string {
        const decipher = this._createNewDecipher()
        let decrypted = decipher.update(encrypted, 'hex', 'utf8')
        decrypted += decipher.final('utf8')
        return decrypted
    }

    public encrypt(data: string): string {
        const cipher = this._createNewCipher()
        let encrypted = cipher.update(data, 'utf8', 'hex')
        encrypted += cipher.final('hex')
        return encrypted
    }

    private _createNewCipher() {
        return Crypto.createCipheriv(this._cipherAlgorithm, this._scryptKey, Buffer.alloc(16, 0))
    }

    private _createNewDecipher() {
        return Crypto.createDecipheriv(this._cipherAlgorithm, this._scryptKey, Buffer.alloc(16, 0))
    }

}
