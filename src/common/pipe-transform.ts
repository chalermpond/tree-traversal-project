import { PipeTransform } from '@nestjs/common'
import * as _ from 'lodash'

export class StringToNumberPipeTransform implements PipeTransform {
    public transform(value: string): number {
        const number = _.parseInt(value)
        if (!_.isNaN(number)) {
            return number
        }
        return undefined
    }

}
