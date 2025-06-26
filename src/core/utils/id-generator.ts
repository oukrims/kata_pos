import { randomBytes } from 'node:crypto';

export function generateId(length?: number): string {
    if (length === undefined || length <= 0) {
        length = 10;
    }

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const bytes = randomBytes(length);
    let result = '';

    for (let i = 0; i < length; i++) {
        result += characters[bytes[i]! % characters.length];
    }

    return result;
}
