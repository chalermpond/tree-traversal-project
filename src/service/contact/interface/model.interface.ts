import { IEntity } from '../../../common/interface/entity.interface'

export interface IContactModel extends IEntity {
    getFullName(): string
    setFullName(name: string): void
    getTitle(): string
    setTitle(title: string): void
    getPhone(): string
    setPhone(phone: string): void
    getWorkPhone(): string
    setWorkPhone(phone: string): void
    getEmail(): string
    setEmail(email: string): void
    getLine(): string
    setLine(line: string): void
    getFacebook(): string
    setFacebook(facebook: string): void
    getTwitter(): string
    setTwitter(twitter: string): void
    getCompany(): string
    setCompany(company: string): void
    getAddress(): string
    setAddress(address: string): void
    getTags(): string[]
    addTag(tag: string): number
    removeTag(tag: string): number
    setTags(tags: string[]): number
}
