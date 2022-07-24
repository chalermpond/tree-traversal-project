import { ISoap } from './interface'

export class ISoapModelValidator {
    soapUrl: string
    soapHeader: any
    soapBody: string
}

export class SoapModel implements ISoap {
    private _header
    private _body
    private _url

    getBody(): any {
        return this._body
    }

    getHeader(): any {
        return this._header
    }

    setBody(input: any): void {
        this._body = input
    }

    setHeader(input: any): void {
        this._header = input
    }

    getUrl(): string {
        return this._url
    }

    setUrl(input: string): void {
        this._url = input
    }

}
