import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { passwordRecoverySchema } from "@/api/validation/auth";
import { devLog } from "@/api/utils";
import { z } from "zod";

export function PasswordRecoveryForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
  }>({});

  // Client-side validation
  const validateForm = (): boolean => {
    try {
      passwordRecoverySchema.parse({ email });
      setFieldErrors({});
      return true;
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const errors: { email?: string } = {};
        validationError.errors.forEach((err) => {
          if (err.path[0] === "email") {
            errors.email = err.message;
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
      const validatedData = passwordRecoverySchema.parse({ email });

      const response = await fetch("/api/auth/password-recovery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Nie udało się wysłać linku resetującego");
        return;
      }

      // Show success message
      setSuccess(data.message);
      setEmail("");
    } catch (error) {
      devLog("error", "Error during password recovery:", error);
      setError("Błąd połączenia. Sprawdź połączenie internetowe i spróbuj ponownie.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Odzyskiwanie hasła</h1>
        <p className="text-sm text-gray-600 mt-2">Wprowadź swój adres e-mail, aby otrzymać link do resetowania hasła</p>
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
          {isLoading ? "Wysyłanie..." : "Wyślij link resetujący"}
        </Button>
      </form>

      <div className="mt-6 text-center space-y-2">
        <p className="text-sm text-gray-600">
          <a href="/login" className="text-blue-600 hover:text-blue-800 hover:underline">
            Powrót do logowania
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
