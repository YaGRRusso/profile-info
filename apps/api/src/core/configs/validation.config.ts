import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from "@nestjs/common";

export function validationConfig(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        const [first] = errors;
        const constraints = first.constraints
          ? Object.values(first.constraints)
          : ["Validation failed"];

        return new BadRequestException(constraints[0]);
      },
      stopAtFirstError: true,
      transform: true,
      whitelist: true,
    })
  );
}
