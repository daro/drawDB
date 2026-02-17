import { useContext } from "react";
import { TextsContext } from "@context/TextsContext";

export default function useTexts() {
  return useContext(TextsContext);
}
