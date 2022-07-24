export interface ICipher {
    encrypt(data: string): string
    decrypt(encrypted: string): string
}
