import { IEntity } from '../../../common/interface/entity.interface'

export interface IPolicyModel extends IEntity {
    getFullName(): string
    getPolicyNumber(): string
    getCreateDate(): string
    getCitizen(): string
    getLicensePlate(): string
    getAddress(): string
    getType(): string
    getProvince(): string
    getBrand(): string
    getmodel(): string
    getChassis(): string
    getDoc(): string
    getStart(): string
    getExpire(): string
    getBirthDate(): string
    getEmail(): string
    getMobile(): string
    getAge(): string
    getSeat(): string
    getDist(): string
    getWeight(): string
    getCareer(): string
    getTransaction(): string

    setFullName(name: string): void
    setPolicyNumber(policy: string): void
    setCreateDate(create: string): void
    setCitizen(citizen: string): void
    setLicensePlate(license: string): void
    setAddress(address: string): void
    setType(type: string): void
    setProvince(province: string): void
    setBrand(input: string): void
    setmodel(input: string): void
    setChassis(input: string): void
    setDoc(input: string): void
    setStart(input: string): void
    setExpire(input: string): void
    setBirthDate(input: string): void
    setEmail(input: string): void
    setMobile(input: string): void
    setAge(input: string): void
    setSeat(input: string): void
    setDist(input: string): void
    setWeight(input: string): void
    setCareer(input: string): void
    setTranscation(input: string): void
}
