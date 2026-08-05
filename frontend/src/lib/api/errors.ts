import axios from "axios";

/**
 * Normalize API errors into a user-friendly message without raw stacktraces or technical detail.
 */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 409) {
      return "This email is already registered.";
    }

    if (error.response?.status === 401) {
      return "Incorrect email or password.";
    }

    if (error.response?.status === 403) {
      return "You do not have permission to perform this action.";
    }

    if (error.response?.status === 404) {
      return "The requested resource was not found.";
    }

    if (error.response?.status === 422 || error.response?.status === 400) {
      const responseData = error.response.data as { detail?: unknown } | undefined;

      if (typeof responseData?.detail === "string") {
        return responseData.detail;
      }

      if (Array.isArray(responseData?.detail)) {
        const firstError = responseData.detail[0];
        if (
          firstError &&
          typeof firstError === "object" &&
          "msg" in firstError &&
          typeof (firstError as { msg?: string }).msg === "string"
        ) {
          // Remove Pydantic "Value error, " prefix if present
          return (firstError as { msg: string }).msg.replace(/^Value error,\s*/i, "");
        }
      }

      return "Invalid information provided. Please check your inputs.";
    }

    if (error.response?.status && error.response.status >= 500) {
      return "The server is currently unavailable. Please try again shortly.";
    }

    // Network / connection errors
    if (!error.response && error.code === "ERR_NETWORK") {
      return "Unable to connect to the server. Please check your internet connection.";
    }
  }

  if (error instanceof Error && !error.message.includes("AxiosError") && !error.message.includes("Network Error")) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}
