import { Button } from "@/components/ui/button";
import { updatePasswordSchema } from "@/api/validation/auth";
import { useAuthForm } from "@/components/hooks/useAuthForm";
import { FormField } from "./FormField";
import { AlertMessage } from "./AlertMessage";

export function UpdatePasswordForm() {
  const { values, fieldErrors, error, success, isLoading, handleChange, handleSubmit } = useAuthForm({
    schema: updatePasswordSchema,
    onSubmit: async (data) => {
      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const error = new Error(result.message || "Zmiana hasła nie powiodła się");
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
        <h1 className="text-2xl font-bold text-gray-900">Ustaw nowe hasło</h1>
        <p className="text-sm text-gray-600 mt-2">Wprowadź nowe hasło dla swojego konta</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Nowe hasło"
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
          label="Powtórz nowe hasło"
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
          {isLoading ? "Zapisywanie..." : "Zmień hasło"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          <a href="/login" className="text-blue-600 hover:text-blue-800 hover:underline">
            Powrót do logowania
          </a>
        </p>
      </div>
    </div>
  );
}
