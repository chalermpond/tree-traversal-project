import { ISoapService } from './interface'
import * as SOAP from 'easy-soap-request'
import { ISoapModelValidator } from './soap.model'
import {
    from,
    Observable,
} from 'rxjs'
import {
    catchError,
    map,
    mergeMap,
} from 'rxjs/operators'
import * as XML from 'xml2json'
import { ProviderName } from '../../provider'
import {
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
} from '@nestjs/common'
import { IPolicyRepository } from '../policy/interface/repository.interface'
import { IPolicyValidator } from '../policy/interface'
import { PolicyModel } from '../policy/policy.model'

const {
    PolicyRepositoryProvider,
} = ProviderName

// TODO  separate into policy service & SOAP adaptor

@Injectable()
export class SoapService implements ISoapService {
    constructor(
        @Inject(PolicyRepositoryProvider)
        private readonly _policyRepository: IPolicyRepository,
    ) {
    }

    request(model: ISoapModelValidator, transaction: string): Observable<any> {
        const _xmlParserOption = {
            object: true,
            reversible: false,
            coerce: false,
            sanitize: false,
            trim: true,
            arrayNotation: false,
            alternateTextNode: false,
        }
        return from(SOAP(
            model.soapUrl,
            model.soapHeader,
            model.soapBody,
        )).pipe(
            catchError(err => {
                throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR)
            }),
            map((resp: any) => {
                const raw = resp.response.body
                const body = XML.toJson(raw, _xmlParserOption)
                return {
                    resp,
                    body: body['soap:Envelope']['soap:Body'],
                }
            }),
            map((raw: any) => {
                const info = raw.body.GetPolicyCompResponse.policyCompResponse
                console.log(info)
                const assign = {
                    name: `${info.title} ${info.name} ${info.surname}`,
                    policy: info.policyNo,
                    citizen: info.citizenId,
                    license: `${info.VEH_NBR1}${info.VEH_NBR2}`,
                    province: info.VEHICLE_PROV,
                    create: new Date(),
                    address: `${info.address} ${info.aumphur} ${info.tambol} ${info.postcode}`,
                    brand: info.VEHICLE_BRAND,
                    model: info.VEHICLE_MODEL,
                    chassis: info.CHASSIS_NBR,
                    doc: info.policyShortUrl,
                    start: info.StartDate,
                    expire: info.EndDate,
                    birth: info.birthDate,
                    age: info.age,
                    career: info.occupacation,
                    email: info.email,
                    mobile: info.mobile,
                    seat: info.SEAT,
                    weight: info.WEIGHT,
                    disp: info.DISP,
                    transaction,
                }
                return {
                    resp: raw.resp,
                    model: this._createPolicyModel(assign),
                }
            }),
            mergeMap((document: any) => {
                return this._policyRepository.save(document.model).pipe(
                    map(() => JSON.stringify(document.resp)),
                )
            }),
        )
    }

    private _createPolicyModel(policy: IPolicyValidator): PolicyModel {
        const newModel = new PolicyModel(policy.policy)
        newModel.setFullName(policy.name)
        newModel.setPolicyNumber(policy.policy)
        newModel.setCitizen(policy.citizen)
        newModel.setLicensePlate(policy.license)
        newModel.setProvince(policy.province)
        newModel.setCreateDate(policy.create)
        newModel.setAddress(policy.address)
        newModel.setBrand(policy.brand)
        newModel.setmodel(policy.model)
        newModel.setDoc(policy.doc)
        newModel.setStart(policy.start)
        newModel.setExpire(policy.expire)
        newModel.setChassis(policy.chassis)
        newModel.setBirthDate(policy.birth)
        newModel.setAge(policy.age)
        newModel.setCareer(policy.career)
        newModel.setEmail(policy.email)
        newModel.setMobile(policy.mobile)
        newModel.setSeat(policy.seat)
        newModel.setWeight(policy.weight)
        newModel.setDist(policy.disp)
        newModel.setTranscation(policy.transaction)
        return newModel
    }
}
