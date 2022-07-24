export interface IEntity {
    getId(): string

    setId(id: string): void

    assertEqual(actual: any, expect: any, message?: string): void

    assertFalse(value: boolean, message?: string): void

    assertNotEqual(actual: any, expect: any, message?: string): void

    assertTrue(value: boolean, message?: string): void
}
