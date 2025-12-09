import { Button } from "@/components/ui/button";
import { registerSchema } from "@/api/validation/auth";
import { useAuthForm } from "@/components/hooks/useAuthForm";
import { FormField } from "./FormField";
import { AlertMessage } from "./AlertMessage";

export function RegisterForm() {
  const { values, fieldErrors, error, success, isLoading, handleChange, handleSubmit } = useAuthForm({
    schema: registerSchema,
    onSubmit: async (data) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Re-throw with API message to be caught by useAuthForm
        const error = new Error(result.message || "Rejestracja nie powiodła się");
        (error as Error & { isApiError: boolean }).isApiError = true;
        throw error;
      }

      return result;
    },
    successRedirect: "/login",
  });

  return (
    <div className="bg-white shadow-md rounded-lg p-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Zarejestruj się</h1>
        <p className="text-sm text-gray-600 mt-2">Utwórz nowe konto, aby rozpocząć</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Adres e-mail"
          name="email"
          type="email"
          placeholder="twoj@email.com"
          value={values.email || ""}
          onChange={handleChange("email")}
          error={fieldErrors.email}
          disabled={isLoading}
        />

        <FormField
          label="Hasło"
          name="password"
          type="password"
          placeholder="••••••••"
          value={values.password || ""}
          onChange={handleChange("password")}
          error={fieldErrors.password}
          disabled={isLoading}
          helpText="Hasło musi zawierać co najmniej 8 znaków"
        />

        <FormField
          label="Powtórz hasło"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={values.confirmPassword || ""}
          onChange={handleChange("confirmPassword")}
          error={fieldErrors.confirmPassword}
          disabled={isLoading}
        />

        {error && <AlertMessage variant="error" message={error} />}
        {success && <AlertMessage variant="success" message={success} />}

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
