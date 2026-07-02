import { Transform, TransformFnParams } from 'class-transformer';

export const Trim = () => {
  return Transform(({ value }: TransformFnParams): unknown =>
    typeof value === 'string' ? value.trim() : value,
  );
};
