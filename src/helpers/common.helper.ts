function parseCookies(cookieString: string) {
  const cookies: { [key: string]: string } = {};
  if (cookieString) {
    cookieString.split(';').forEach((cookie) => {
      const parts = cookie.split('=');
      const key = parts[0].trim();
      const value = parts.slice(1).join('=');
      cookies[key] = value;
    });
  }
  return cookies;
}

export { parseCookies };
