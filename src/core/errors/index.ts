export class ValidationError extends Error {
  constructor(public field: string, public value: any, public constraint: string) {
    super(`${field}: ${constraint}`);
    this.name = 'ValidationError';
  }
}

