import {
    Controller,
    Get,
    Header,
    HttpException,
    HttpStatus,
    Inject,
    Param,
    Post,
    Query,
    Req,
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { validateSync } from 'class-validator'
import { parse } from 'csv/lib/es5/sync'
import * as _ from 'lodash'
import { Observable } from 'rxjs'
import { Parser } from 'json2csv'
import {
    AdminGuard,
    RoleGuard,
} from '../../common/role-guard'
import { ProviderName } from '../../provider'
import { IAuthService } from '../../service/auth/interface/service.interface'
import { IReportService } from '../../service/report/interface'
import { ITransactionService } from '../../service/transaction/interface'
import { TransactionValidator } from './validator/transaction.validator'
import {
    map,
    reduce,
} from 'rxjs/operators'
import * as csv2json from 'csvjson'
import * as xls from 'excel4node'

const {
    AdminAuthServiceProvider,
    ReportServiceProvider,
    TransactionServiceProvider,
} = ProviderName

@Controller('/report')
export class ReportController {
    constructor(
        @Inject(ReportServiceProvider)
        private readonly _reportService: IReportService,
        @Inject(TransactionServiceProvider)
        private readonly _transactionService: ITransactionService,
        @Inject(AdminAuthServiceProvider)
        private readonly _adminAuth: IAuthService,
    ) {
    }

    @Get('/transaction/export')
    @UseGuards(AdminGuard)
    @Header('Content-Type', 'text/csv')
    @Header('Content-Disposition', 'attachment;filename=report.csv')
    public queryMonthlyTransaction(
        @Query('start') start: string,
        @Query('end') end: string,
    ): Observable<string> {
        if (_.isEmpty(start) || _.isEmpty(end)) {
            throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST)
        }
        const startDate = new Date(`${start} 00:00:00`)
        const endDate = new Date(`${end} 23:59:59`)
        return this._reportService.getMonthlyTransactionReport(startDate, endDate)
    }

    @Get('/summary/export')
    @UseGuards(AdminGuard)
    public querySummaryTransaction(
        @Query('start') start: string,
        @Query('end') end: string,
        @Res() res,
    ): Observable<string> {
        if (_.isEmpty(start) || _.isEmpty(end)) {
            throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST)
        }
        const startDate = new Date(`${start} 00:00:00`)
        const endDate = new Date(`${end} 23:59:59`)

        return this._reportService.getSummaryTransactionReport(startDate, endDate).pipe(
            reduce((str, current) => str + current, ''),
            map(report => {
                const reportObject: any = csv2json.toObject(report, {
                    delimiter: ',',
                    quote: '"',
                })

                const header = Object.keys(reportObject[0])
                const workbook = new xls.Workbook()
                const worksheet = workbook.addWorksheet('summary')

                console.log(header)

                worksheet.cell(1, 1).string(header[0])
                worksheet.cell(1, 2).string(header[1])
                worksheet.cell(1, 3).string(header[2])
                worksheet.cell(1, 4).string(header[3])
                worksheet.cell(1, 5).string(header[4])

                let i = 0
                let j = 2

                while (i < reportObject.length) {
                    worksheet.cell(j, 1).string(reportObject[i].BankAccount)
                    worksheet.cell(j, 2).string(reportObject[i].BankName)
                    worksheet.cell(j, 3).string(reportObject[i].Benefit)
                    worksheet.cell(j, 4).string(reportObject[i].Paid)
                    worksheet.cell(j, 5).string(reportObject[i].PaymentDate)

                    i++
                    j++
                }

                return workbook.write(`report_${start}_${end}.xlsx`, res)
            }),
        )
    }

    @UseGuards(AdminGuard)
    @Get('/transaction/log')
    public queryTransactionLogs(
        @Query('start') start: string,
        @Query('end') end: string,
        @Query('status') status: string,
    ): any {
        if (_.isEmpty(start) || _.isEmpty(end)) {
            throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST)
        }
        const startDate = new Date(start)
        const endDate = new Date(end)
        return this._transactionService.queryTransaction(startDate, endDate, status)
    }

    @UseGuards(AdminGuard)
    @Post('/transaction/import')
    @UseInterceptors(FileInterceptor('file'))
    public importPaymentStatus(
        @UploadedFile() file,
        @Req() req,
    ) {

        const records: any[] = parse(file.buffer.toString(), {
            columns: true,
            skip_empty_lines: true,
        })
        let errors = []
        const validators = records.map(record => {
            const validator = new TransactionValidator()
            _.assign(validator, record)
            errors = _.concat(errors, validateSync(validator))
            return validator
        })

        if (!_.isEmpty(errors)) {
            const errorStr = errors.map(err => {
                const constrains = _.values(err.constraints)
                return constrains.map(constrain => `${err.target.Code}: ${err.property}, ${constrain}`)
            })
            throw new HttpException(_.flatten(errorStr), HttpStatus.BAD_REQUEST)
        }
        const token = _.replace(
            _.get(req.headers, 'authorization', ''),
            /^Bearer\s/ig,
            '',
        )
        const data = this._adminAuth.verifyToken(token)
        return this._reportService.importPaymentStatus(validators, data.username)
    }

    @Get('/transaction/import/template')
    @Header('Content-Type', 'text/csv')
    @Header('Content-Disposition', 'attachment;filename=template.csv')
    public downloadImportTemplate() {
        const json2csvParser = new Parser({header: false})
        const headers = json2csvParser.parse({
            code: 'Code',
            bankAccount: 'BankAccount',
            bankName: 'BankName',
            license: 'Plate',
            benefit: 'Benefit',
            type: 'Type',
            from: 'From',
            status: 'Status',
            paymentDate: 'PaymentDate',
        })

        return headers
    }

    @UseGuards(RoleGuard)
    @Get('/yearlyprofit/:nodeId')
    public queryYearlyProfit(
        @Param('nodeId') code: string,
    ): any {
        const currentYear = new Date().getFullYear()
        return this._reportService.getYearlyProfitTransaction(code, currentYear)
    }
}
