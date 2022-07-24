import { Observable } from 'rxjs'

export interface IContactId {
    id: string
}

export interface IContactService {
    createNewContact(contact: IContactValidator): Observable<IContactId>
}

export interface IContactValidator {
    fullName: string
    title?: string
    phone?: string
    workPhone?: string
    email?: string
    line?: string
    facebook?: string
    twitter?: string
    company?: string
    address?: string
    tags?: string[]
}
