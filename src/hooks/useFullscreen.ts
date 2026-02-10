import { useState } from "react";
import { useEventListener } from "usehooks-ts";

export default function useFullscreen(): boolean {
  const [value, setValue] = useState<boolean>(() => {
    return document.fullscreenElement === document.documentElement;
  });

  function handleFullscreenChange() {
    setValue(document.fullscreenElement === document.documentElement);
  }

  useEventListener("fullscreenchange", handleFullscreenChange, document as any);

  return value;
}
