import { Controller, Post } from '@nestjs/common';
import { SeedService } from './seed.service';

/**
 * Dev-only endpoint. In production this controller should be disabled
 * or protected behind auth.
 */
@Controller('dev')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post('seed')
  seed() {
    return this.seedService.run();
  }
}
