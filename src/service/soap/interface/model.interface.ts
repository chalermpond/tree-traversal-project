export interface ISoap {
    getHeader(): any

    setHeader(input: any): void

    getBody(): any

    setBody(input: any): void

    getUrl(): string

    setUrl(input: string): void
}
