import { createContext, useEffect, useState, ReactNode, Dispatch, SetStateAction } from "react";

export interface ILayout {
  header: boolean;
  sidebar: boolean;
  issues: boolean;
  toolbar: boolean;
  dbmlEditor: boolean;
  readOnly: boolean;
}

interface LayoutContextType {
  layout: ILayout;
  setLayout: Dispatch<SetStateAction<ILayout>>;
}

const defaultLayout: ILayout = {
  header: true,
  sidebar: true,
  issues: true,
  toolbar: true,
  dbmlEditor: false,
  readOnly: false,
};

export const LayoutContext = createContext<LayoutContextType>({
  layout: defaultLayout,
  setLayout: () => {},
});

export default function LayoutContextProvider({ children }: { children: ReactNode }) {
  const [layout, setLayout] = useState<ILayout>(() => {
    const savedLayout = localStorage.getItem("layout");
    if (savedLayout) {
      try {
        return { ...defaultLayout, ...JSON.parse(savedLayout), readOnly: false };
      } catch (e) {
        console.error("Failed to parse layout from localStorage", e);
      }
    }
    return defaultLayout;
  });

  useEffect(() => {
    localStorage.setItem("layout", JSON.stringify(layout));
  }, [layout]);

  return (
    <LayoutContext.Provider value={{ layout, setLayout }}>
      {children}
    </LayoutContext.Provider>
  );
}
