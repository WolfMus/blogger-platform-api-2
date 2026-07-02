export class ErrorItemResponseDto {
  field: string;
  message: string;
}

export class ErrorResponseDto {
  errorsMessages: ErrorItemResponseDto[];
}
