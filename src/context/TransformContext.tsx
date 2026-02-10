import { createContext, useCallback, useState, ReactNode, Dispatch, SetStateAction } from "react";

export interface ITransform {
  zoom: number;
  pan: { x: number; y: number };
}

interface TransformContextType {
  transform: ITransform;
  setTransform: (actionOrValue: ITransform | ((prev: ITransform) => ITransform)) => void;
}

export const TransformContext = createContext<TransformContextType>({
  transform: { zoom: 1, pan: { x: 0, y: 0 } },
  setTransform: () => {},
});

export default function TransformContextProvider({ children }: { children: ReactNode }) {
  const [transform, setTransformInternal] = useState<ITransform>({
    zoom: 1,
    pan: { x: 0, y: 0 },
  });

  const setTransform = useCallback(
    (actionOrValue: ITransform | ((prev: ITransform) => ITransform)) => {
      const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
      const findFirstNumber = (...values: any[]) =>
        values.find((value) => typeof value === "number" && !isNaN(value));

      setTransformInternal((prev) => {
        let newValue: ITransform;
        if (typeof actionOrValue === "function") {
          newValue = actionOrValue(prev);
        } else {
          newValue = actionOrValue;
        }

        return {
          zoom: clamp(
            findFirstNumber(newValue.zoom, prev.zoom, 1),
            0.02,
            5,
          ),
          pan: {
            x: findFirstNumber(newValue.pan?.x, prev.pan?.x, 0),
            y: findFirstNumber(newValue.pan?.y, prev.pan?.y, 0),
          },
        };
      });
    },
    [setTransformInternal],
  );

  return (
    <TransformContext.Provider value={{ transform, setTransform }}>
      {children}
    </TransformContext.Provider>
  );
}
