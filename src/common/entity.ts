import { IAssertion } from './interface/assertion.interface'
import { AssertionConcern } from './assertion-concern'
import { IEntity } from './interface/entity.interface'

export abstract class Entity implements IEntity {
    private _id: string
    private readonly _assertion: IAssertion

    protected constructor() {
        this._assertion = new AssertionConcern()
    }

    public getId(): string {
        return this._id
    }

    public setId(id: string): void {
        this._id = id
    }

    public assertEqual(actual: any, expect: any, message?: string): void {
        this._assertion.assertEqual(actual, expect, message)
    }

    public assertFalse(value: boolean, message?: string): void {
        this._assertion.assertFalse(value, message)
    }

    public assertNotEqual(actual: any, expect: any, message?: string): void {
        this._assertion.assertNotEqual(actual, expect, message)
    }

    public assertTrue(value: boolean, message?: string): void {
        this._assertion.assertTrue(value, message)
    }
}
