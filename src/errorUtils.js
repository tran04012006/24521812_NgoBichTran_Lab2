
export function getErrorMessage(error) {
  if (error instanceof TypeError) {
    return "Unable to connect to the server. Check your network connection.";
  }

  if (error instanceof SyntaxError) {
    return "The server returned invalid data.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
}
