import { createContext, useState, ReactNode, Dispatch, SetStateAction } from "react";
import { Action, ObjectType } from "@data/constants";
import { Toast } from "@douyinfe/semi-ui";
import { useTranslation } from "react-i18next";
import { useUndoRedo } from "@hooks";
import { nanoid } from "nanoid";
import { IEnum } from "@types";

interface EnumsContextType {
  enums: IEnum[];
  setEnums: Dispatch<SetStateAction<IEnum[]>>;
  addEnum: (data?: { index: number; enum: IEnum }, addToHistory?: boolean) => void;
  updateEnum: (id: string | number, values: Partial<IEnum>) => void;
  deleteEnum: (id: string | number, addToHistory?: boolean) => void;
  enumsCount: number;
}

export const EnumsContext = createContext<EnumsContextType>({
  enums: [],
  setEnums: () => {},
  addEnum: () => {},
  updateEnum: () => {},
  deleteEnum: () => {},
  enumsCount: 0,
});

export default function EnumsContextProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [enums, setEnums] = useState<IEnum[]>([]);
  const { setUndoStack, setRedoStack } = useUndoRedo();

  const addEnum = (data?: { index: number; enum: IEnum }, addToHistory: boolean = true) => {
    const newEnum: IEnum = {
      id: nanoid(),
      name: `enum_${enums.length}`,
      values: [],
    };
    if (data) {
      setEnums((prev) => {
        const temp = prev.slice();
        temp.splice(data.index, 0, data.enum);
        return temp;
      });
    } else {
      setEnums((prev) => [...prev, newEnum]);
    }
    if (addToHistory) {
      setUndoStack((prev) => [
        ...prev,
        {
          action: Action.ADD,
          data: {
            index: enums.length,
            enum: data?.enum ?? newEnum,
          },
          element: ObjectType.ENUM,
          message: t("add_enum"),
        },
      ]);
      setRedoStack([]);
    }
  };

  const deleteEnum = (id: string | number, addToHistory: boolean = true) => {
    const enumIndex = enums.findIndex((e) => e.id === id);
    if (enumIndex === -1) return;

    if (addToHistory) {
      Toast.success(t("enum_deleted"));
      setUndoStack((prev) => [
        ...prev,
        {
          action: Action.DELETE,
          element: ObjectType.ENUM,
          data: {
            index: enumIndex,
            enum: enums[enumIndex],
          },
          message: t("delete_enum", {
            enumName: enums[enumIndex].name,
          }),
        },
      ]);
      setRedoStack([]);
    }
    setEnums((prev) => prev.filter((e) => e.id !== id));
  };

  const updateEnum = (id: string | number, values: Partial<IEnum>) => {
    setEnums((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...values } : e)),
    );
  };

  return (
    <EnumsContext.Provider
      value={{
        enums,
        setEnums,
        addEnum,
        updateEnum,
        deleteEnum,
        enumsCount: enums.length,
      }}
    >
      {children}
    </EnumsContext.Provider>
  );
}
