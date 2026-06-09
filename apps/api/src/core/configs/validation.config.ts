import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from "@nestjs/common";

export function validationConfig(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const first = errors[0];
        const constraints = first.constraints
          ? Object.values(first.constraints)
          : ["Validation failed"];

        return new BadRequestException(constraints[0]);
      },
    })
  );
}
