export const changePasswordEvents = {
  open: () => window.dispatchEvent(new CustomEvent("open-change-password")),
};
export const changeEmailEvents = {
  open: () => window.dispatchEvent(new CustomEvent("open-change-email")),
};