import { useState, useCallback } from "react";
import { z } from "zod";
import { devLog } from "@/api/utils";

interface UseAuthFormConfig<T extends z.ZodSchema> {
  schema: T;
  onSubmit: (data: z.infer<T>) => Promise<{ message?: string; requiresEmailConfirmation?: boolean }>;
  successRedirect?: string;
  resetOnSuccess?: boolean;
  onSuccess?: (data: { message?: string; requiresEmailConfirmation?: boolean }) => void;
}

interface UseAuthFormReturn {
  values: Record<string, string>;
  fieldErrors: Record<string, string>;
  error: string | null;
  success: string | null;
  isLoading: boolean;
  handleChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

/**
 * Custom hook for managing authentication forms with Zod validation.
 * Handles form state, validation, error messages, and submission.
 *
 * @example
 * const form = useAuthForm({
 *   schema: loginSchema,
 *   onSubmit: async (data) => {
 *     const response = await fetch('/api/auth/login', {
 *       method: 'POST',
 *       body: JSON.stringify(data)
 *     });
 *     return response.json();
 *   },
 *   successRedirect: '/'
 * });
 */
export function useAuthForm<T extends z.ZodSchema>({
  schema,
  onSubmit,
  successRedirect,
  resetOnSuccess = false,
  onSuccess,
}: UseAuthFormConfig<T>): UseAuthFormReturn {
  // Extract field names from schema
  const getInitialValues = useCallback(() => {
    // Handle ZodEffects (schemas with .refine()) by unwrapping to inner schema
    let baseSchema: z.ZodTypeAny = schema;

    // Check if it's a ZodEffects and unwrap it
    while (baseSchema._def.typeName === "ZodEffects") {
      baseSchema = (baseSchema as z.ZodEffects<z.ZodTypeAny>)._def.schema;
    }

    // Now baseSchema should be a ZodObject
    if (baseSchema._def.typeName === "ZodObject") {
      const shape = (baseSchema as z.ZodObject<z.ZodRawShape>)._def.shape();
      return Object.keys(shape).reduce(
        (acc, key) => {
          acc[key] = "";
          return acc;
        },
        {} as Record<string, string>
      );
    }

    // Fallback for unsupported schema types
    return {};
  }, [schema]);

  const [values, setValues] = useState<Record<string, string>>(getInitialValues());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Client-side validation
  const validateForm = useCallback((): boolean => {
    try {
      schema.parse(values);
      setFieldErrors({});
      return true;
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        validationError.errors.forEach((err) => {
          const field = err.path[0] as string;
          if (field) {
            errors[field] = err.message;
          }
        });
        setFieldErrors(errors);
      }
      return false;
    }
  }, [schema, values]);

  // Handle field changes
  const handleChange = useCallback(
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }));

      // Clear errors for this field
      if (error || success || fieldErrors[field]) {
        setError(null);
        setSuccess(null);
        setFieldErrors((prev) => {
          const newErrors = { ...prev };
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [error, success, fieldErrors]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) return;

      setIsLoading(true);
      setError(null);
      setSuccess(null);

      try {
        const validatedData = schema.parse(values);
        const result = await onSubmit(validatedData);

        // Handle success
        if (result.message) {
          setSuccess(result.message);
        }

        // Determine if we should reset the form
        const shouldReset = resetOnSuccess || (result.requiresEmailConfirmation && successRedirect);

        // Reset form if requested or if email confirmation required (no redirect)
        if (shouldReset) {
          setValues(getInitialValues());
        }

        // Call success callback if provided
        if (onSuccess) {
          onSuccess(result);
        }

        // Handle redirect
        if (successRedirect && !result.requiresEmailConfirmation) {
          setTimeout(() => {
            window.location.href = successRedirect;
          }, 2000);
        }
      } catch (submitError) {
        devLog("error", "Error during form submission:", submitError);

        // Check if it's an API error with a message or a network error
        if (submitError instanceof Error) {
          // If it's marked as an API error, use the API message
          if ((submitError as Error & { isApiError?: boolean }).isApiError) {
            setError(submitError.message);
          } else {
            // Network or other error
            setError("Błąd połączenia. Sprawdź połączenie internetowe i spróbuj ponownie.");
          }
        } else {
          setError("Wystąpił nieoczekiwany błąd. Spróbuj ponownie.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [validateForm, schema, values, onSubmit, onSuccess, successRedirect, resetOnSuccess, getInitialValues]
  );

  return {
    values,
    fieldErrors,
    error,
    success,
    isLoading,
    handleChange,
    handleSubmit,
  };
}
