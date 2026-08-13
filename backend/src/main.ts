import "reflect-metadata";

import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix("api/v1");
  app.enableCors({
    origin: configService.get<string>("FRONTEND_URL") ?? true,
    credentials: true
  });
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true
    })
  );

  const swaggerDocument = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle("FlagForge API")
      .setDescription(
        "Management and evaluation API for the FlagForge feature-flag platform. " +
          "Authenticate with the access token returned by POST /api/v1/auth/login or POST /api/v1/auth/register."
      )
      .setVersion("1.0")
      .addBearerAuth({ bearerFormat: "JWT", scheme: "bearer", type: "http" }, "access-token")
      .build()
  );
  SwaggerModule.setup("api/docs", app, swaggerDocument);

  const port = configService.get<number>("PORT") ?? 3001;
  await app.listen(port);
}

void bootstrap();
