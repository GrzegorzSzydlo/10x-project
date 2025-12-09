interface AlertMessageProps {
  variant: "error" | "success" | "info";
  message: string;
}

/**
 * Alert message component for displaying errors, success messages, and info.
 * Includes proper accessibility attributes.
 */
export function AlertMessage({ variant, message }: AlertMessageProps) {
  const variantStyles = {
    error: "text-red-600 bg-red-50 border-red-200",
    success: "text-green-600 bg-green-50 border-green-200",
    info: "text-blue-600 bg-blue-50 border-blue-200",
  };

  return (
    <div className={`p-3 text-sm ${variantStyles[variant]} border rounded-md`} role="alert">
      {message}
    </div>
  );
}
