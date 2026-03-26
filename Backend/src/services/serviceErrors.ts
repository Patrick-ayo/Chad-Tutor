export class ServiceNotFoundError extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = "ServiceNotFoundError";
    this.statusCode = 404;
  }
}

export function assertRowsAffected(count: number, message: string): void {
  if (count === 0) {
    throw new ServiceNotFoundError(message);
  }
}
