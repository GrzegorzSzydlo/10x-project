export function getE2ECredentials() {
  const username = process.env.E2E_USERNAME;
  const password = process.env.E2E_PASSWORD;

  // Debug logging
  console.log("E2E_USERNAME:", username);
  console.log("E2E_PASSWORD exists:", !!password);

  if (!username || !password) {
    throw new Error(
      `E2E credentials not found. E2E_USERNAME=${username}, E2E_PASSWORD=${password ? "SET" : "NOT SET"}. ` +
        "Make sure E2E_USERNAME and E2E_PASSWORD are set in .env.test"
    );
  }

  return { username, password };
}
