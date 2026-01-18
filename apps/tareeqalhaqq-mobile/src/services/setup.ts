import { secureStore } from "./secureStore";

const SETUP_KEY = "setup_complete";

export const getSetupCompleted = async () => {
  const flag = await secureStore.getItem(SETUP_KEY);
  return flag === "true";
};

export const setSetupCompleted = async (value: boolean) => {
  await secureStore.setItem(SETUP_KEY, value ? "true" : "false");
};
