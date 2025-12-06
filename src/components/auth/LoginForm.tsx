import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema } from "@/api/validation/auth";
import { devLog } from "@/api/utils";
import { z } from "zod";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // Client-side validation
  const validateForm = (): boolean => {
    try {
      loginSchema.parse({ email, password });
      setFieldErrors({});
      return true;
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const errors: { email?: string; password?: string } = {};
        validationError.errors.forEach((err) => {
          if (err.path[0] === "email" || err.path[0] === "password") {
            errors[err.path[0]] = err.message;
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

    try {
      const validatedData = loginSchema.parse({ email, password });

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Nieprawidłowe dane logowania");
        return;
      }

      // Redirect to home page on success
      window.location.href = "/";
    } catch (error) {
      devLog("error", "Error during login:", error);
      setError("Błąd połączenia. Sprawdź połączenie internetowe i spróbuj ponownie.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Zaloguj się</h1>
        <p className="text-sm text-gray-600 mt-2">Wprowadź swoje dane, aby uzyskać dostęp do konta</p>
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
              if (error || fieldErrors.email) {
                setError(null);
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
              if (error || fieldErrors.password) {
                setError(null);
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
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md" role="alert">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Logowanie..." : "Zaloguj się"}
        </Button>
      </form>

      <div className="mt-6 text-center space-y-2">
        <p className="text-sm text-gray-600">
          <a href="/password-recovery" className="text-blue-600 hover:text-blue-800 hover:underline">
            Zapomniałeś hasła?
          </a>
        </p>
        <p className="text-sm text-gray-600">
          Nie masz konta?{" "}
          <a href="/register" className="text-blue-600 hover:text-blue-800 hover:underline">
            Zarejestruj się
          </a>
        </p>
      </div>
    </div>
  );
}
