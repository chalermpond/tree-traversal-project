import {
    HttpException,
    HttpStatus,
} from '@nestjs/common'
import * as Soap from 'easy-soap-request'
import * as fs from 'fs'
import * as handlebars from 'handlebars'
import * as _ from 'lodash'
import {
    from,
    Observable,
} from 'rxjs'
import {
    catchError,
    map,
    tap,
} from 'rxjs/operators'
import * as XML from 'xml2json'
import { IConfig } from '../common/interface/config.interface'
import { IPolicyAdapter } from './interface/adapter.interface'
import { IPolicyAdapterSchema } from './interface/schema.interface'

enum SearchMethod {
    REF = 'REF',
    POLICY_NO = 'POLICYNO',
}

interface ITemplateData {
    value: string,
    search: SearchMethod
}

export class ThaiPaiboonPolicyAdapter implements IPolicyAdapter {
    private readonly _compXml: string
    private readonly _refAgent: string
    private readonly _authCode: string
    private readonly _endpoint: string
    private readonly _headers: object
    private readonly _parserOptions: object

    constructor(
        _config: IConfig,
    ) {
        this._compXml = fs.readFileSync('./vendor/xml/GetPolicyComp.xml', 'utf-8')
        this._refAgent = _config.tpb.soapAssign.agent
        this._authCode = _config.tpb.soapAssign.auth
        this._headers = _config.tpb.soapHeader
        this._endpoint = _config.tpb.soapUrl
        this._parserOptions = {
            object: true,
            reversible: false,
            coerce: false,
            sanitize: false,
            trim: true,
            arrayNotation: false,
            alternateTextNode: false,
        }
    }

    public getByTransactionId(transaction: string): Observable<{ schema: IPolicyAdapterSchema; resp: string }> {
        const data = {
            value: transaction,
            search: SearchMethod.REF,
        }
        const body = this.parseXmlContent(data)
        return this._requestAndTransform(body).pipe(
            map((raw: any) => {
                const info = raw.body.GetPolicyCompResponse.policyCompResponse
                return {
                    resp: raw.resp,
                    schema: this._createAdapterSchema(info, transaction),
                }
            }),
        )
    }

    public getByPolicyNumber(policyNo: string): Observable<{ schema: IPolicyAdapterSchema, resp: string }> {
        const data = {
            value: policyNo,
            search: SearchMethod.POLICY_NO,
        }
        const body = this.parseXmlContent(data)
        return this._requestAndTransform(body).pipe(
            map((raw: any) => {
                const info = raw.body.GetPolicyCompResponse.policyCompResponse
                return {
                    resp: raw.resp,
                    schema: this._createAdapterSchema(info),
                }
            }),
        )
    }

    private _isPolicyFound(body: any): boolean {
        const info = body.GetPolicyCompResponse.brokerResponse
        return _.get(info, 'isSuccess', false) === 'true'
    }

    private parseXmlContent(data: ITemplateData): string {
        _.assign(data, {
            agent: this._refAgent,
            auth: this._authCode,
        })
        const template = handlebars.compile(this._compXml)
        return template(data)
    }

    private _createAdapterSchema(compResponse: any, transaction: string = ''): IPolicyAdapterSchema {
        return {
            name: `${compResponse.title} ${compResponse.name} ${compResponse.surname}`,
            policy: compResponse.policyNo,
            citizen: compResponse.citizenId,
            license: `${compResponse.VEH_NBR1}${compResponse.VEH_NBR2}`,
            province: compResponse.VEHICLE_PROV,
            create: new Date(),
            address: `${compResponse.address} ${compResponse.aumphur} ${compResponse.tambol} ${compResponse.postcode}`,
            brand: compResponse.VEHICLE_BRAND,
            model: compResponse.VEHICLE_MODEL,
            chassis: compResponse.CHASSIS_NBR,
            doc: compResponse.policyShortUrl,
            start: compResponse.StartDate,
            expire: compResponse.EndDate,
            birth: compResponse.birthDate,
            age: compResponse.age,
            career: compResponse.occupacation,
            email: compResponse.email,
            mobile: compResponse.mobile,
            seat: compResponse.SEAT,
            weight: compResponse.WEIGHT,
            disp: compResponse.DISP,
            transaction,
        }
    }

    private _requestAndTransform(requestBody: string): Observable<{ resp: string, body: any }> {
        const soapPromise = Soap(
            this._endpoint,
            this._headers,
            requestBody,
        )
        console.log(requestBody)
        return from(soapPromise).pipe(
            catchError(err => {
                throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR)
            }),
            map((resp: any) => {
                const raw = resp.response.body
                const soapBody = XML.toJson(raw, this._parserOptions)
                return {
                    resp,
                    body: soapBody['soap:Envelope']['soap:Body'],
                }
            }),
            tap(raw => {
                console.error(raw)
                if (!this._isPolicyFound(raw.body)) {
                    throw new HttpException(
                        `Policy not found on remote server`,
                        HttpStatus.NOT_FOUND,
                    )
                }
            }),
        )
    }

}
