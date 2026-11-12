import { INestApplication, ValidationPipe } from '@nestjs/common';

/** Shared app configuration used by both main.ts and the e2e tests. */
export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}
