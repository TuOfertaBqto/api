import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/login.dto';
import { JwtPayloadDTO } from './dto/jwt.dto';
import { ValidatedJwt } from './decorators/validated-jwt.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDTO) {
    return this.authService.login(loginDto);
  }

  @Get('validate')
  validateToken(@ValidatedJwt() payload: JwtPayloadDTO) {
    return {
      valid: true,
      user: {
        id: payload.sub,
        role: payload.role,
        email: payload.email,
      },
    };
  }
}
