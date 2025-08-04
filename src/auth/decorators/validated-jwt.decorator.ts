import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JwtPayloadDTO } from '../dto/jwt.dto';

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

export const ValidatedJwt = createParamDecorator(
  (
    data: keyof JwtPayloadDTO | undefined,
    ctx: ExecutionContext,
  ): string | JwtPayloadDTO => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ headers: { authorization?: string } }>();

    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Authorization token not found or malformed',
      );
    }

    const token = authHeader.split(' ')[1];

    let decoded: JwtPayloadDTO;

    try {
      decoded = jwt.verify(token, jwtSecret) as JwtPayloadDTO;
    } catch (err) {
      console.error('JWT verification error:', err);
      throw new UnauthorizedException('Invalid or expired JWT');
    }

    if (!decoded || !decoded.sub || !decoded.role) {
      throw new UnauthorizedException('Missing required JWT fields');
    }

    if (data) {
      const value = decoded[data];
      if (typeof value === 'undefined' || value === null) {
        throw new UnauthorizedException(
          `JWT payload missing required property: ${String(data)}`,
        );
      }
      return value as string;
    }
    return decoded;
  },
);
