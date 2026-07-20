import {
  BadGatewayException,
  BadRequestException,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { ResendService } from "./resend.service";

const sendMock = jest.fn();

jest.mock("resend", () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: sendMock },
  })),
}));

describe("ResendService", () => {
  async function createService(env: Record<string, string | undefined>) {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResendService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => env[key]),
          },
        },
      ],
    }).compile();

    return module.get(ResendService);
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws when RESEND_API_KEY is missing", async () => {
    const service = await createService({ EMAIL_FROM: "from@example.com" });

    await expect(
      service.send({
        subject: "Hello",
        text: "Hi",
        to: "user@example.com",
      })
    ).rejects.toMatchObject({
      response: expect.objectContaining({ message: "email.NOT_CONFIGURED" }),
    });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("throws ServiceUnavailableException when not configured", async () => {
    const service = await createService({});

    await expect(
      service.send({
        subject: "Hello",
        text: "Hi",
        to: "user@example.com",
      })
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it("throws when from is missing from message and env", async () => {
    const service = await createService({ RESEND_API_KEY: "re_test" });

    await expect(
      service.send({
        subject: "Hello",
        text: "Hi",
        to: "user@example.com",
      })
    ).rejects.toMatchObject({
      response: expect.objectContaining({ message: "email.FROM_REQUIRED" }),
    });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("throws BadRequestException when from is missing", async () => {
    const service = await createService({ RESEND_API_KEY: "re_test" });

    await expect(
      service.send({
        subject: "Hello",
        text: "Hi",
        to: "user@example.com",
      })
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("sends successfully and returns the provider id", async () => {
    sendMock.mockResolvedValueOnce({
      data: { id: "email_123" },
      error: null,
    });

    const service = await createService({
      EMAIL_FROM: "from@example.com",
      RESEND_API_KEY: "re_test",
    });

    const result = await service.send({
      subject: "Hello",
      text: "Hi",
      to: "user@example.com",
    });

    expect(result).toEqual({ id: "email_123" });
    expect(sendMock).toHaveBeenCalledWith({
      from: "from@example.com",
      html: undefined,
      replyTo: undefined,
      subject: "Hello",
      text: "Hi",
      to: "user@example.com",
    });
  });

  it("prefers message.from over EMAIL_FROM", async () => {
    sendMock.mockResolvedValueOnce({
      data: { id: "email_456" },
      error: null,
    });

    const service = await createService({
      EMAIL_FROM: "default@example.com",
      RESEND_API_KEY: "re_test",
    });

    await service.send({
      from: "override@example.com",
      html: "<p>Hi</p>",
      subject: "Hello",
      to: "user@example.com",
    });

    expect(sendMock.mock.calls[0][0].from).toBe("override@example.com");
  });

  it("maps vendor auth errors to UnauthorizedException", async () => {
    sendMock.mockResolvedValueOnce({
      data: null,
      error: {
        message: "Invalid API key",
        name: "invalid_api_key",
        statusCode: 401,
      },
    });

    const service = await createService({
      EMAIL_FROM: "from@example.com",
      RESEND_API_KEY: "re_test",
    });

    await expect(
      service.send({
        subject: "Hello",
        text: "Hi",
        to: "user@example.com",
      })
    ).rejects.toMatchObject({
      response: expect.objectContaining({ message: "email.UNAUTHORIZED" }),
    });
  });

  it("maps vendor auth errors as UnauthorizedException instance", async () => {
    sendMock.mockResolvedValueOnce({
      data: null,
      error: {
        message: "Invalid API key",
        name: "invalid_api_key",
        statusCode: 401,
      },
    });

    const service = await createService({
      EMAIL_FROM: "from@example.com",
      RESEND_API_KEY: "re_test",
    });

    await expect(
      service.send({
        subject: "Hello",
        text: "Hi",
        to: "user@example.com",
      })
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("throws when the provider returns no data", async () => {
    sendMock.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    const service = await createService({
      EMAIL_FROM: "from@example.com",
      RESEND_API_KEY: "re_test",
    });

    await expect(
      service.send({
        subject: "Hello",
        text: "Hi",
        to: "user@example.com",
      })
    ).rejects.toMatchObject({
      response: expect.objectContaining({ message: "email.PROVIDER_FAILURE" }),
    });
  });

  it("maps unexpected thrown errors to BadGatewayException", async () => {
    sendMock.mockRejectedValueOnce(new Error("socket hang up"));

    const service = await createService({
      EMAIL_FROM: "from@example.com",
      RESEND_API_KEY: "re_test",
    });

    await expect(
      service.send({
        subject: "Hello",
        text: "Hi",
        to: "user@example.com",
      })
    ).rejects.toBeInstanceOf(BadGatewayException);
  });
});
