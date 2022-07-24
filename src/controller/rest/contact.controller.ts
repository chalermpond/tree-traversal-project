import {
    Body,
    Controller,
    Inject,
    Post,
    UseGuards,
} from '@nestjs/common'
import { IContactService } from '../../service/contact/interface/service.interface'
import { ProviderName } from '../../provider'
import { ContactValidator } from './validator/contact.validator'
import { RoleGuard } from '../../common/role-guard'

const {
    ContactServiceProvider,
} = ProviderName

@Controller('/contact')
export class ContactController {
    constructor(
        @Inject(ContactServiceProvider)
        private _contactService: IContactService,
    ) {
    }

    @UseGuards(RoleGuard)
    @Post('/')
    public createContact(
        @Body() contact: ContactValidator,
    ) {
        return this._contactService.createNewContact(contact)
    }
}
