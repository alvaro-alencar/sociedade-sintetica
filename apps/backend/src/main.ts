import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DEFAULT_BACKEND_PORT } from '@sociedade/shared-config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api');
  const port = process.env.PORT || DEFAULT_BACKEND_PORT;
  await app.listen(port);
  console.log(`Backend running on port ${port}`);
}
bootstrap();
