import { API_ERROR_CODE } from "./errorCode";

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }

  isAuthError() {
    return (
      this.code === API_ERROR_CODE.AUTH_REQUIRED ||
      this.code === API_ERROR_CODE.AUTH_EXPIRED
    );
  }
}
