import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema } from "@/api/validation/auth";
import { devLog } from "@/api/utils";
import { z } from "zod";

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Client-side validation
  const validateForm = (): boolean => {
    try {
      registerSchema.parse({ email, password, confirmPassword });
      setFieldErrors({});
      return true;
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const errors: { email?: string; password?: string; confirmPassword?: string } = {};
        validationError.errors.forEach((err) => {
          const field = err.path[0];
          if (field === "email" || field === "password" || field === "confirmPassword") {
            errors[field] = err.message;
          }
        });
        setFieldErrors(errors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const validatedData = registerSchema.parse({ email, password, confirmPassword });

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: validatedData.email,
          password: validatedData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Rejestracja nie powiodła się");
        return;
      }

      // Show success message
      setSuccess(data.message);

      // If no email confirmation required, redirect to login
      if (!data.requiresEmailConfirmation) {
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    } catch (error) {
      devLog("error", "Error during registration:", error);
      setError("Błąd połączenia. Sprawdź połączenie internetowe i spróbuj ponownie.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Zarejestruj się</h1>
        <p className="text-sm text-gray-600 mt-2">Utwórz nowe konto, aby rozpocząć</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Adres e-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="twoj@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error || success || fieldErrors.email) {
                setError(null);
                setSuccess(null);
                setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
            disabled={isLoading}
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
          />
          {fieldErrors.email && (
            <p id="email-error" className="text-sm text-red-600" role="alert">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Hasło</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error || success || fieldErrors.password) {
                setError(null);
                setSuccess(null);
                setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }
            }}
            disabled={isLoading}
            aria-invalid={!!fieldErrors.password}
            aria-describedby={fieldErrors.password ? "password-error" : undefined}
          />
          {fieldErrors.password && (
            <p id="password-error" className="text-sm text-red-600" role="alert">
              {fieldErrors.password}
            </p>
          )}
          <p className="text-xs text-gray-500">Hasło musi zawierać co najmniej 8 znaków</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Powtórz hasło</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (error || success || fieldErrors.confirmPassword) {
                setError(null);
                setSuccess(null);
                setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }
            }}
            disabled={isLoading}
            aria-invalid={!!fieldErrors.confirmPassword}
            aria-describedby={fieldErrors.confirmPassword ? "confirmPassword-error" : undefined}
          />
          {fieldErrors.confirmPassword && (
            <p id="confirmPassword-error" className="text-sm text-red-600" role="alert">
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md" role="alert">
            {success}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Rejestracja..." : "Zarejestruj się"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Masz już konto?{" "}
          <a href="/login" className="text-blue-600 hover:text-blue-800 hover:underline">
            Zaloguj się
          </a>
        </p>
      </div>
    </div>
  );
}
