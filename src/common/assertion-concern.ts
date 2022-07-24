import { IAssertion } from './interface/assertion.interface'
import {
    notStrictEqual,
    ok,
    strictEqual,
} from 'assert'

/**
 * AssertionConcern implement IAssert for object assertion
 */
export class AssertionConcern implements IAssertion {
    public assertEqual(actual: any, expect: any, message?: string): void {
        strictEqual(actual, expect, message)
    }

    public assertFalse(value: boolean, message?: string): void {
        ok(!value, message)
    }

    public assertNotEqual(actual: any, expect: any, message?: string): void {
        notStrictEqual(actual, expect, message)
    }

    public assertTrue(value: boolean, message?: string): void {
        ok(!!value, message)
    }
}
