import request from "supertest";
import app from "../app";
import { AppDataSource } from "../config/data-source";

process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-secret";
process.env.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET ?? "test-refresh";
process.env.MINIO_ENDPOINT = process.env.MINIO_ENDPOINT ?? "http://localhost:9000";
process.env.MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY ?? "test";
process.env.MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY ?? "test";
process.env.POSTGRES_HOST = process.env.POSTGRES_HOST ?? "localhost";
process.env.POSTGRES_DB = process.env.POSTGRES_DB ?? "test";
process.env.POSTGRES_USER = process.env.POSTGRES_USER ?? "test";
process.env.POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD ?? "test";

describe("Auth endpoints", () => {
  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  it("should register a new user", async () => {
    const response = await request(app)
      .post("/api/auth/signup")
      .send({
        email: `test-${Date.now()}@example.com`,
        username: `user${Date.now()}`,
        password: "Password123!"
      })
      .expect(201);

    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("user.id");
  });
});

