export interface IAssertion {
    assertTrue(value: boolean, message?: string): void

    assertFalse(value: boolean, message?: string): void

    assertEqual(actual: any, expect: any, message?: string): void

    assertNotEqual(actual: any, expect: any, message?: string): void
}
