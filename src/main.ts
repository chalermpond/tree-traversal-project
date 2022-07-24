import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as Config from 'config'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
    const port: number = Config.get('application.port')
    const app = await NestFactory.create(AppModule)
    app.enableCors()
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
        }),
    )
    return await app.listen(port || 3000)
}

bootstrap().then( () => {
    console.log('Application started')
} )
