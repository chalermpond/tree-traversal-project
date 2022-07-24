import { Entity } from '../../common/entity'
import { IPolicyModel } from './interface'

export class PolicyModel extends Entity implements IPolicyModel {
    private _name: string
    private _policy: string
    private _create: string
    private _citizen: string
    private _license: string
    private _address: string
    private _type: string
    private _province: string
    private _brand: string
    private _model: string
    private _doc: string
    private _expire: string
    private _start: string
    private _chassis: string
    private _age: string
    private _birthdate: string
    private _career: string
    private _disp: string
    private _email: string
    private _mobile: string
    private _seat: string
    private _weight: string
    private _transaction: string

    getFullName(): string {
        return this._name
    }

    constructor(
        policy: string,
    ) {
        super()
        this._policy = policy
    }

    setFullName(name: string): void {
        this._name = name
    }

    getPolicyNumber(): string {
        return this._policy
    }

    setPolicyNumber(policy: string): void {
        this._policy = policy
    }

    getCreateDate(): string {
        return this._create
    }

    getProvince(): string {
        return this._province
    }

    setCreateDate(create: string): void {
        this._create = create
    }

    getCitizen(): string {
        return this._citizen
    }

    getLicensePlate(): string {
        return this._license
    }

    setCitizen(citizen: string): void {
        this._citizen = citizen
    }

    setLicensePlate(license: string): void {
        this._license = license
    }

    getAddress(): string {
        return this._address
    }

    getType(): string {
        return this._type
    }

    setAddress(address: string): void {
        this._address = address
    }

    setType(type: string): void {
        this._type = type
    }

    setProvince(province: string): void {
        this._province = province
    }

    getBrand(): string {
        return this._brand
    }

    getChassis(): string {
        return this._chassis
    }

    getDoc(): string {
        return this._doc
    }

    getExpire(): string {
        return this._expire
    }

    getmodel(): string {
        return this._model
    }

    setBrand(input: string): void {
        this._brand = input
    }

    setChassis(input: string): void {
        this._chassis = input
    }

    setDoc(input: string): void {
        this._doc = input
    }

    setExpire(input: string): void {
        this._expire = input
    }

    setmodel(input: string): void {
        this._model = input
    }

    getStart(): string {
        return this._start
    }

    setStart(input: string): void {input
        this._start = input
    }

    public getAge(): string {
        return this._age
    }

    public getBirthDate(): string {
        return this._birthdate
    }

    public getCareer(): string {
        return this._career
    }

    public getDist(): string {
        return this._disp
    }

    public getEmail(): string {
        return this._email
    }

    public getMobile(): string {
        return this._mobile
    }

    public getSeat(): string {
        return this._seat
    }

    public getWeight(): string {
        return this._weight
    }

    public setAge(input: string): void {
        this._age = input
    }

    public setBirthDate(input: string): void {
        this._birthdate = input
    }

    public setCareer(input: string): void {
        this._career = input
    }

    public setDist(input: string): void {
        this._disp = input
    }

    public setEmail(input: string): void {
        this._email = input
    }

    public setMobile(input: string): void {
        this._mobile = input
    }

    public setSeat(input: string): void {
        this._seat = input
    }

    public setWeight(input: string): void {
        this._weight = input
    }

    public getTransaction(): string {
        return this._transaction
    }

    public setTranscation(input: string): void {
        this._transaction = input
    }
}
