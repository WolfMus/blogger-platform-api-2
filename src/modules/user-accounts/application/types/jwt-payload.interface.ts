export interface JwtPayloadInterface {
  sub: string;
  login: string;
  iat: number;
  exp: number;
}
