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

const formatByEnUsNum = (value: number) => {
  return value.toLocaleString('en-US');
};

const formatIODate = (strDate: string, onlyDate = false) => {
  const date = strDate.split('T')[0];
  if (onlyDate) return `${date} (UTC)`;
  const time = strDate.split('T')[1].split('.')[0];
  return `${date} ${time} (UTC)`;
};

const shortWalletAddress = (wallet: string): string => {
  return `${wallet.substring(0, 10)}...${wallet.substring(wallet.length - 6, wallet.length)}`;
};

export { parseCookies, formatByEnUsNum, formatIODate, shortWalletAddress };
