export interface IConfig {
    application: {
        port: number,
    }
    mongodb: IMongoDB,
    auth: IAuth,
    authAdmin: IAdminAuth
    email: {
        user: string,
        pass: string,
        host: string
        port: number,
        secure: boolean,
    },
    static: {
        thailand: string,
    },
    links: {
        registerDomain: string,
    },
    node: {
        dp: number,
        rp: number,
    },
    tpb: {
        soapUrl: string,
        soapHeader: any,
        soapAssign: {
            agent: string,
            auth: string,
            value: string,
            search: string,
        },
    }
}

export interface IMongoDB {
    servers: string
    port: number
    dbName: string
    username?: string
    password?: string
    authSource?: string
}

export interface IAuth {
    ignoreExpiration: boolean
    public: string
    private: string
}

export interface IAdminAuth {
    ignoreExpiration: boolean
    public: string
    private: string
}
