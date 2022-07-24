import { Provider as NestProviderInterface } from '@nestjs/common'
import { HttpErrorFilter } from '../common/error-filter'
import { APP_FILTER } from '@nestjs/core'

export const httpErrorFilter: NestProviderInterface = {
    provide: APP_FILTER,
    useClass: HttpErrorFilter,
}
