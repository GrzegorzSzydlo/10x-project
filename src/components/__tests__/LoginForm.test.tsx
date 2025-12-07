import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { LoginForm } from "../auth/LoginForm";

// Example unit test for LoginForm component
describe("LoginForm", () => {
  it("should render login form with email and password fields", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/adres e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/hasło/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /zaloguj się/i })).toBeInTheDocument();
  });

  it("should show validation error for invalid email", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/adres e-mail/i);
    await user.type(emailInput, "invalid-email");
    await user.tab(); // Blur the input

    // Add your validation logic expectations here
    // expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
  });
});
