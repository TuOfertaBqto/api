import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/login.dto';
import { JwtPayloadDTO } from './dto/jwt.dto';
import { ValidatedJwt } from './decorators/validated-jwt.decorator';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/email/email.service';
import { ForgotPasswordDTO, ResetPasswordDTO } from './dto/password.dto';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

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

  @Post('forgot-password')
  async forgotPassword(
    @Req() req: Request,
    @Body() forgotPasswordDto: ForgotPasswordDTO,
  ) {
    const origin = req.headers['origin'];
    const { email } = forgotPasswordDto;
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('El usuario no existe');
    }

    if (!user.password) {
      throw new BadRequestException(
        'Este usuario no tiene contraseña registrada, use otro método de acceso',
      );
    }

    const token = await this.jwtService.signAsync(
      { sub: user.id, role: user.role, email: user.email },
      { expiresIn: '15m' },
    );

    await this.emailService.sendEmail({
      recipients: [{ email: user.email, name: user.firstName }],
      subject: 'Recuperar contraseña - TuOfertaBqto',
      html: `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Recuperar contraseña</title>
  </head>
  <body style="margin:0; padding:0; font-family: Arial, Helvetica, sans-serif; background-color:#f4f4f7; color:#333;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td align="center" style="padding: 20px 0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <tr>
              <td align="center" style="background:#2563eb; padding:20px;">
                <h1 style="margin:0; font-size:22px; color:#ffffff;">TuOfertaBqto</h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:30px;">
                <p style="font-size:16px; margin-bottom:20px;">Hola <strong>${user.firstName}</strong>,</p>
                <p style="font-size:16px; margin-bottom:20px;">
                  Hemos recibido una solicitud para restablecer tu contraseña.  
                  Si no fuiste tú, puedes ignorar este correo.
                </p>
                <div style="text-align:center; margin:30px 0;">
                  <a href="${origin}/reset-password?token=${token}" 
                    style="background:#2563eb; color:#fff; padding:12px 24px; text-decoration:none; border-radius:6px; font-weight:bold; display:inline-block;">
                    Restablecer contraseña
                  </a>
                </div>
                <p style="font-size:14px; color:#555;">
                  Este enlace expirará en <strong>15 minutos</strong> por motivos de seguridad.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="background:#f4f4f7; padding:20px; font-size:12px; color:#777;">
                © ${new Date().getFullYear()} TuOfertaBqto. Todos los derechos reservados.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `,
      text: `Hola ${user.firstName},

Hemos recibido una solicitud para restablecer tu contraseña.  
Si no fuiste tú, puedes ignorar este correo.

Usa el siguiente enlace para continuar (válido por 15 minutos): 
${origin}/reset-password?token=${token}

© ${new Date().getFullYear()} TuOfertaBqto`,
    });

    return { message: 'Se envió el correo de recuperación' };
  }

  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDTO) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayloadDTO>(
        body.token,
      );

      const newPassword = await bcrypt.hash(body.newPassword, 10);

      await this.userService.update(payload.sub, { password: newPassword });

      return { message: 'Contraseña actualizada correctamente' };
    } catch (e) {
      console.error('Error verifying reset password token:', e);
      throw new BadRequestException('Token inválido o expirado');
    }
  }
}
