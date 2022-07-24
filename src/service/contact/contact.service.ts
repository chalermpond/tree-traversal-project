import {
    Inject,
    Injectable,
} from '@nestjs/common'
import {
    IContactId,
    IContactService,
    IContactValidator,
} from './interface/service.interface'

import { ProviderName } from '../../provider'
import { IContactRepository } from './interface/repository.interface'
import { ContactModel } from './contact.model'
import {
    Observable,
    of,
} from 'rxjs'
import {
    map,
    mergeMap,
} from 'rxjs/operators'

const {
    ContactRepositoryProvider,
} = ProviderName

@Injectable()
export class ContactService implements IContactService {
    constructor(
        @Inject(ContactRepositoryProvider)
        private readonly _contactRepository: IContactRepository,
    ) {
    }

    public test() {
        const contactModel = new ContactModel('test')
        this._contactRepository.save(contactModel)
        return 'test service called'

    }

    public createNewContact(contact: IContactValidator): Observable<IContactId> {
        return of(this._createContactModel(contact)).pipe(
            mergeMap(model => {
                return this._contactRepository.save(model)
            }),
            map(resp => ({
                id: resp.id,
            })),
        )

    }

    private _createContactModel(contact: IContactValidator): ContactModel {
        const newModel = new ContactModel(contact.fullName)
        //  main info
        newModel.setTitle(contact.title)
        newModel.setCompany(contact.company)
        newModel.setAddress(contact.address)
        newModel.setEmail(contact.email)
        newModel.setPhone(contact.phone)
        newModel.setWorkPhone(contact.workPhone)

        // social
        newModel.setFacebook(contact.facebook)
        newModel.setLine(contact.line)
        newModel.setTwitter(contact.twitter)

        // additional
        newModel.setTags(contact.tags || [])

        return newModel
    }
}
