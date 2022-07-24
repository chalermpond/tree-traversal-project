import {
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Inject,
    Post,
    Query,
} from '@nestjs/common'
import * as fs from 'fs'
import * as handlebars from 'handlebars'
import {
    map,
    mergeMap,
} from 'rxjs/operators'
import { ITransactionService } from 'src/service/transaction/interface/service.interface'
import { IConfig } from '../../common/interface/config.interface'
import { ProviderName } from '../../provider'
import { ISoapService } from '../../service/soap/interface'
import { ISoapModelValidator } from '../../service/soap/soap.model'

const {
    TransactionServiceProvider,
    SoapServiceProvider,
    EnvConfigProvider,
} = ProviderName

enum searchBy {
    policy = 'POLICYNO',
    transaction = 'REF',
}

@Controller('/')
export class LandingController {
    private readonly _soapConfig
    private readonly _pageTitle = 'เครือข่ายผู้ซื้อ พ.ร.บ.'

    constructor(
        @Inject(TransactionServiceProvider)
        private readonly _transactionService: ITransactionService,
        @Inject(SoapServiceProvider)
        private readonly _soapService: ISoapService,
        @Inject(EnvConfigProvider)
        private readonly _config: IConfig,
    ) {
        this._soapConfig = {
            soapUrl: this._config.tpb.soapUrl,
            soapHeader: this._config.tpb.soapHeader,
        }
    }

    @Get('/success')
    public successLanding(
        @Query('t') transaction: string,
        @Query('p') policyNo: string,
    ): any {
        const xml: string = fs.readFileSync('vendor/xml/GetPolicyComp.xml', 'utf-8')
        let assign: any
        assign = this._config.tpb.soapAssign
        assign.value = transaction
        assign.search = searchBy.transaction
        const soapBody = this._bodyParser(assign, xml)
        const model: ISoapModelValidator = {
            soapUrl: this._soapConfig.soapUrl,
            soapHeader: this._soapConfig.soapHeader,
            soapBody,
        }
        return this._soapService.request(model, transaction).pipe(
            mergeMap(resp => {
                const message = resp
                return this._transactionService.updateSuccess(transaction, message).pipe(
                    map(() => {
                        const file = fs.readFileSync('vendor/template/status.hbs').toString()
                        const successImage = fs.readFileSync('vendor/static/checked.png').toString('base64')
                        const template = handlebars.compile(file)
                        const context = {
                            pageTitle: this._pageTitle,
                            policyNo,
                            successImage: 'data:image/png;base64,' + successImage,
                            successTemplate: true,
                        }
                        return template(context)
                    }),
                )
            }),
        )
    }

    @Get('/fail')
    public failLanding(
        @Query('t') transaction: string,
        @Query('msg') message: string,
    ): any {
        return this._transactionService.updateFail(transaction, message).pipe(
            map((res) => {
                if (res.status !== 'updated') {
                    throw new HttpException(
                        `transaction update error`,
                        HttpStatus.BAD_REQUEST,
                    )
                }
                const file = fs.readFileSync('vendor/template/status.hbs').toString()
                const failImage = fs.readFileSync('vendor/static/close.png').toString('base64')
                const template = handlebars.compile(file)
                const context = {
                    pageTitle: this._pageTitle,
                    successImage: 'data:image/png;base64,' + failImage,
                    message,
                    failTemplate: true,
                }
                return template(context)
            }),
        )
    }

    @Post('/store')
    public createReferralSaleComp(): any {
        return this._transactionService.createReferral()
    }

    private _bodyParser(
        assign: any,
        body: string,
    ): string {
        const template = handlebars.compile(body)
        return template(assign)
    }
}
