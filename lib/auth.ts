export const ACCESS_COOKIE_NAME = "agent_reputation_access";
export const ACCESS_COOKIE_VALUE = "granted";

export const hasAccessCookie = (cookieValue: string | undefined): boolean => {
  return cookieValue === ACCESS_COOKIE_VALUE;
};
