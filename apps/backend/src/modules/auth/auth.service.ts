import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AccountsService } from '../accounts/accounts.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private accountsService: AccountsService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.accountsService.findOneByEmail(email);
    if (user && user.passwordHash === pass) { // TODO: Hash password
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
    const user = await this.accountsService.create({
      email,
      passwordHash: password, // TODO: Hash
      name,
    });
    return this.login(user);
  }
}
