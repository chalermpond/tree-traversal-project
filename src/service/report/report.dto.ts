import { ITransactionModel } from '../transaction/interface'
import { IReportDto } from './interface'

export class ReportDto {
    public static toTransactionDto(input: ITransactionModel): IReportDto {
        return {
            id: input.getId(),
            created: input.getCreateDate(),
            update: input.getUpdateDate(),
            status: input.getStatus(),
        }
    }
}
