import * as _ from 'lodash'
import { Entity } from '../../common/entity'
import { IContactModel } from './interface/model.interface'

export class ContactModel extends Entity implements IContactModel {
    private _name: string
    private _tags: string[]
    private _address: string
    private _company: string
    private _email: string
    private _facebook: string
    private _line: string
    private _phone: string
    private _title: string
    private _twitter: string
    private _workPhone: string

    constructor(name: string) {
        super()
        this._name = name
    }

    public addTag(tag: string): number {
        const searchResult = _.find(
            this._tags,
            existingTag => existingTag === tag,
        )

        if (_.isNil(searchResult)) {
            return this._tags.length
        }
        return this._tags.push(tag)
    }

    public getAddress(): string {
        return this._address
    }

    public getCompany(): string {
        return this._company
    }

    public getEmail(): string {
        return this._email
    }

    public getFacebook(): string {
        return this._facebook
    }

    public getFullName(): string {
        return this._name
    }

    public getLine(): string {
        return this._line
    }

    public getPhone(): string {
        return this._phone
    }

    public getTags(): string[] {
        return _.cloneDeep(this._tags)
    }

    public getTitle(): string {
        return this._title
    }

    public getTwitter(): string {
        return this._twitter
    }

    public getWorkPhone(): string {
        return this._workPhone
    }

    public removeTag(tag: string): number {
        _.remove(this._tags,
            element => element === tag,
        )
        return this._tags.length
    }

    public setAddress(address: string): void {
        this._address = address
    }

    public setCompany(company: string): void {
        this._company = company
    }

    public setEmail(email: string): void {
        this._email = email
    }

    public setFacebook(facebook: string): void {
        this._facebook = facebook
    }

    public setFullName(name: string): void {
        this._name = name
    }

    public setLine(line: string): void {
        this._line = line
    }

    public setPhone(phone: string): void {
        this._phone = phone
    }

    public setTags(tags: string[]): number {
        this._tags = tags
        return this._tags.length
    }

    public setTitle(title: string): void {
        this._title = title
    }

    public setTwitter(twitter: string): void {
        this._twitter = twitter
    }

    public setWorkPhone(phone: string): void {
        this._workPhone = phone
    }

}
