export class HttpError extends Error {
  public status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = new.target.name;
    this.status = status;
  }
}

export class ConflictError extends HttpError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

export class NotFoundError extends HttpError {
  constructor(message = 'Not found') {
    super(message, 404);
  }
}
