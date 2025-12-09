import { Button } from "@/components/ui/button";
import { passwordRecoverySchema } from "@/api/validation/auth";
import { useAuthForm } from "@/components/hooks/useAuthForm";
import { FormField } from "./FormField";
import { AlertMessage } from "./AlertMessage";

export function PasswordRecoveryForm() {
  const { values, fieldErrors, error, success, isLoading, handleChange, handleSubmit } = useAuthForm({
    schema: passwordRecoverySchema,
    onSubmit: async (data) => {
      const response = await fetch("/api/auth/password-recovery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        const error = new Error(result.message || "Nie udało się wysłać linku resetującego");
        (error as Error & { isApiError: boolean }).isApiError = true;
        throw error;
      }

      return result;
    },
    resetOnSuccess: true,
  });

  return (
    <div className="bg-white shadow-md rounded-lg p-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Odzyskiwanie hasła</h1>
        <p className="text-sm text-gray-600 mt-2">Wprowadź swój adres e-mail, aby otrzymać link do resetowania hasła</p>
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

        {error && <AlertMessage variant="error" message={error} />}
        {success && <AlertMessage variant="success" message={success} />}

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
