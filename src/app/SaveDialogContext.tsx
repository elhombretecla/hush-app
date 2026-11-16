import { createContext, useContext } from "react";

export const SaveDialogContext = createContext<() => void>(() => {});
/** Opens the Save Content dialog (desktop Modal / mobile BottomSheet). */
export const useOpenSave = () => useContext(SaveDialogContext);
