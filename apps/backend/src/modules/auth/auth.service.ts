import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AccountsService } from '../accounts/accounts.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private accountsService: AccountsService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.accountsService.findOneByEmail(email);

    // ✅ CORREÇÃO: Usa bcrypt.compare() para validar senha com hash
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }

    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(email: string, password: string, name: string) {
    // Check if exists
    const existing = await this.accountsService.findOneByEmail(email);
    if (existing) {
      throw new Error('User already exists');
    }

    // ✅ CORREÇÃO: Gera salt e hash da senha antes de salvar
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await this.accountsService.create({
      email,
      passwordHash: hashedPassword, // Salva o hash, não a senha plana
      name,
    });

    return this.login(user);
  }
}

