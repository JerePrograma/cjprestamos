type ApiErrorData = {
  message?: string;
  detail?: string;
  error?: string;
  title?: string;
  errors?: Array<{
    defaultMessage?: string;
    message?: string;
  }>;
  violations?: Array<{
    message?: string;
  }>;
};

type ApiErrorShape = {
  response?: {
    data?: ApiErrorData | string;
  };
  message?: string;
};

export function obtenerMensajeErrorApi(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null) {
    const apiError = error as ApiErrorShape;
    const data = apiError.response?.data;

    if (typeof data === "string" && data.trim()) {
      return data;
    }

    if (data && typeof data === "object") {
      if (typeof data.message === "string" && data.message.trim()) return data.message;
      if (typeof data.detail === "string" && data.detail.trim()) return data.detail;
      if (typeof data.error === "string" && data.error.trim()) return data.error;
      if (typeof data.title === "string" && data.title.trim()) return data.title;

      if (Array.isArray(data.errors) && data.errors.length > 0) {
        const primerError = data.errors[0];
        if (
          typeof primerError.defaultMessage === "string" &&
          primerError.defaultMessage.trim()
        ) {
          return primerError.defaultMessage;
        }
        if (typeof primerError.message === "string" && primerError.message.trim()) {
          return primerError.message;
        }
      }

      if (Array.isArray(data.violations) && data.violations.length > 0) {
        const primeraViolacion = data.violations[0];
        if (
          typeof primeraViolacion.message === "string" &&
          primeraViolacion.message.trim()
        ) {
          return primeraViolacion.message;
        }
      }
    }

    if (typeof apiError.message === "string" && apiError.message.trim()) {
      return apiError.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
