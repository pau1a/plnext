
import { useEffect } from "react";
import hotkeys from "hotkeys-js";

export function useHotkeys(keys: string, callback: (event: KeyboardEvent) => void) {
  useEffect(() => {
    hotkeys(keys, callback);

    return () => {
      hotkeys.unbind(keys, callback);
    };
  }, [keys, callback]);
}
