import { Button } from "@/components/ui/button";
import { loginSchema } from "@/api/validation/auth";
import { useAuthForm } from "@/components/hooks/useAuthForm";
import { FormField } from "./FormField";
import { AlertMessage } from "./AlertMessage";

export function LoginForm() {
  const { values, fieldErrors, error, isLoading, handleChange, handleSubmit } = useAuthForm({
    schema: loginSchema,
    onSubmit: async (data) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.message || "Nieprawidłowe dane logowania");
        (error as Error & { isApiError: boolean }).isApiError = true;
        throw error;
      }

      // Redirect to home page on success
      window.location.href = "/";
      return {};
    },
  });

  return (
    <div className="bg-white shadow-md rounded-lg p-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Zaloguj się</h1>
        <p className="text-sm text-gray-600 mt-2">Wprowadź swoje dane, aby uzyskać dostęp do konta</p>
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
        />

        {error && <AlertMessage variant="error" message={error} />}

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
