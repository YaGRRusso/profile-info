import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  getHello(): Record<string, any> {
    return {
      name: 'Profile Info',
      version: '0.0',
      url: 'https://yagrrusso-info.onrender.com',
      repo: 'https://yagrrusso-info.onrender.com',
    }
  }
}
