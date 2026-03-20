export const getBaseUrl = (): string => {
  return (import.meta.env.BASE_URL ?? '').replace(/\/$/, '');
};

export const PUBLIC_URL = getBaseUrl();
