import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
} from '@nestjs/common'
import { ValidationError } from 'class-validator'

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse()
        const request = ctx.getRequest()
        const status = exception.getStatus()

        console.log(exception instanceof ValidationError)
        console.log(exception)
        response
            .status(status)
            .json({
                statusCode: status,
                timestamp: new Date().toISOString(),
                path: request.url,
            })
    }
}
