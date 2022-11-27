const { authorize } = require("../backend/auth");
const axios = require("axios");
const oAuth2ClientModule = require("../backend/oauth2client");

jest.mock("axios");

const mockRequest = (token) => {
  return {
    cookies: { token },
    session: {},
    originalUrl: "http://localhost:3000",
  };
};

const mockResponse = () => {
  const res = {};
  res.redirect = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe("authorize users with valid token", () => {
  test("should return error w. status 500 if authUrl cannot be set  ", async () => {
    //   TODO: https://stackoverflow.com/questions/51269431/jest-mock-inner-function

    const spy = jest.mock().spyOn(oAuth2ClientModule, "getOAuth2Client");

    spy.mockReturnValue(undefined)

    const req = mockRequest("goodToken");
    const res = mockResponse();

    await authorize(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalled();

    spy.mockRestore()

  });

  test("should set session redirect url", async () => {
    const req = mockRequest();
    const res = mockResponse();

    await authorize(req, res, mockNext);
    expect(req.session.redirectTo).toEqual(req.originalUrl);
  });

  test("should redirect for google auth. if token not present", async () => {
    const req = mockRequest();
    const res = mockResponse();

    await authorize(req, res, mockNext);
    // redirect contains googleAuthUrl
    expect(res.redirect).toHaveBeenCalled();
  });

  test("should redirect user with invalid token", async () => {
    const req = mockRequest("badToken");
    const res = mockResponse();

    axios.get.mockRejectedValue({
      error: "invalid_token",
      error_description: "Invalid Value",
    });

    await authorize(req, res, mockNext);
    // redirect contains googleAuthUrl
    expect(res.redirect).toHaveBeenCalled();
  });

  test("should set OAuth2Client on req with valid token", async () => {
    const req = mockRequest("goodToken");
    const res = mockResponse();

    axios.get.mockResolvedValue({});

    await authorize(req, res, mockNext);
    // redirect contains googleAuthUrl
    expect(req.oAuth2Client).not.toBeNull();
    expect(res.redirect).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });
});
