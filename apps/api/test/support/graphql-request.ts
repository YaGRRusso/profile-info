import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";

export async function graphqlRequest<TData = Record<string, unknown>>(
  app: INestApplication<App>,
  {
    query,
    variables,
    token,
  }: {
    query: string;
    variables?: Record<string, unknown>;
    token?: string;
  }
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await request(app.getHttpServer())
    .post("/graphql")
    .set(headers)
    .send({ query, variables });

  return response.body as {
    data?: TData;
    errors?: Array<{ message: string; extensions?: { code?: string } }>;
  };
}
