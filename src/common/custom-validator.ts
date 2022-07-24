import {
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator'

import * as _ from 'lodash'

@ValidatorConstraint({
    name: 'customDateString',
    async: false,
})
export class CustomDateString implements ValidatorConstraintInterface {
    public defaultMessage(validationArguments?: ValidationArguments): string {
        return 'Invalid Date Format'
    }

    public validate(value: string, validationArguments?: ValidationArguments): boolean {
        const d = new Date(value)
        return !_.isNaN(d.getTime())
    }

}
