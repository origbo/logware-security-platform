import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import MFAVerification from "../../features/auth/components/MFAVerification";
import authReducer from "../../features/auth/slice/authSlice";
import { mfaApi } from "../../services/auth/mfaService";

// Mock the MFA service hooks
jest.mock("../../services/auth/mfaService", () => ({
  __esModule: true,
  MFAMethodType: {
    APP: "app",
    SMS: "sms",
    EMAIL: "email",
    RECOVERY: "recovery",
  },
  useVerifyMFALoginMutation: () => [
    jest.fn().mockImplementation((data) =>
      Promise.resolve({
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
        user: {
          id: "123",
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          role: "user",
          twoFactorEnabled: true,
          createdAt: "2023-01-01",
          updatedAt: "2023-01-01",
          preferences: {
            theme: "light",
            dashboardLayout: {},
            notifications: {
              email: true,
              browser: true,
              mobile: false,
            },
          },
        },
      })
    ),
    { isLoading: false },
  ],
  useSendVerificationCodeMutation: () => [
    jest.fn().mockResolvedValue({ success: true }),
    { isLoading: false },
  ],
  mfaApi: {
    reducerPath: "mfaApi",
    reducer: () => ({}),
    middleware: () => (next) => (action) => next(action),
  },
}));

// Mock the analytics service
jest.mock("../../services/analytics/errorAnalyticsService", () => ({
  __esModule: true,
  ErrorCategory: {
    AUTH: "auth",
  },
  logEvent: jest.fn(),
}));

describe("MFAVerification Component", () => {
  let store;
  const onCompleteMock = jest.fn();
  const onCancelMock = jest.fn();

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
        [mfaApi.reducerPath]: mfaApi.reducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(mfaApi.middleware),
    });

    // Reset mocks
    onCompleteMock.mockReset();
    onCancelMock.mockReset();
  });

  it("renders the MFA verification form", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <MFAVerification
            userId="123"
            verificationId="456"
            onComplete={onCompleteMock}
            onCancel={onCancelMock}
          />
        </MemoryRouter>
      </Provider>
    );

    // Check if the component renders correctly
    expect(screen.getByText(/Two-Factor Authentication/i)).toBeInTheDocument();
    expect(screen.getByText(/Enter the 6-digit code/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Verify/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
  });

  it("handles verification code input", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <MFAVerification
            userId="123"
            verificationId="456"
            onComplete={onCompleteMock}
            onCancel={onCancelMock}
          />
        </MemoryRouter>
      </Provider>
    );

    // Get the input field
    const inputField = screen.getByLabelText(/Authentication Code/i);

    // Type a 6-digit code
    fireEvent.change(inputField, { target: { value: "123456" } });

    // Verify the input value
    expect(inputField.value).toBe("123456");
  });

  it("calls onComplete when verification is successful", async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <MFAVerification
            userId="123"
            verificationId="456"
            onComplete={onCompleteMock}
            onCancel={onCancelMock}
          />
        </MemoryRouter>
      </Provider>
    );

    // Get the input field and verify button
    const inputField = screen.getByLabelText(/Authentication Code/i);
    const verifyButton = screen.getByRole("button", { name: /Verify/i });

    // Type a 6-digit code
    fireEvent.change(inputField, { target: { value: "123456" } });

    // Click the verify button
    fireEvent.click(verifyButton);

    // Wait for the onComplete callback to be called
    await waitFor(() => {
      expect(onCompleteMock).toHaveBeenCalledWith({
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
      });
    });
  });

  it("calls onCancel when cancel button is clicked", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <MFAVerification
            userId="123"
            verificationId="456"
            onComplete={onCompleteMock}
            onCancel={onCancelMock}
          />
        </MemoryRouter>
      </Provider>
    );

    // Get the cancel button
    const cancelButton = screen.getByRole("button", { name: /Cancel/i });

    // Click the cancel button
    fireEvent.click(cancelButton);

    // Verify that onCancel was called
    expect(onCancelMock).toHaveBeenCalled();
  });

  it("shows an error when code is empty", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <MFAVerification
            userId="123"
            verificationId="456"
            onComplete={onCompleteMock}
            onCancel={onCancelMock}
          />
        </MemoryRouter>
      </Provider>
    );

    // Get the verify button
    const verifyButton = screen.getByRole("button", { name: /Verify/i });

    // Click the verify button without entering a code
    fireEvent.click(verifyButton);

    // Check for error message
    expect(
      screen.getByText(/Please enter a verification code/i)
    ).toBeInTheDocument();
  });
});
