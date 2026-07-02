import { HttpStatus } from '@nestjs/common';

export class Extension {
  constructor(
    public message: string,
    public field: string,
  ) {}
}

export class DomainException extends Error {
  message: string;
  code: HttpStatus;
  extensions: Extension[];

  constructor(errorInfo: {
    code: HttpStatus;
    message: string;
    extensions?: Extension[];
  }) {
    super(errorInfo.message);
    this.message = errorInfo.message;
    this.code = errorInfo.code;
    this.extensions = errorInfo.extensions || [];
  }
}
