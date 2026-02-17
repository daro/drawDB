import { createContext, useState, ReactNode, Dispatch, SetStateAction } from "react";
import { Action, ObjectType } from "@data/constants";
import { useUndoRedo } from "@hooks";
import { Toast } from "@douyinfe/semi-ui";
import { useTranslation } from "react-i18next";
import { nanoid } from "nanoid";
import { IType } from "@types";

interface TypesContextType {
  types: IType[];
  setTypes: Dispatch<SetStateAction<IType[]>>;
  addType: (data?: { index: number; type: IType }, addToHistory?: boolean) => void;
  updateType: (id: string | number, values: Partial<IType>) => void;
  deleteType: (id: string | number, addToHistory?: boolean) => void;
  typesCount: number;
}

export const TypesContext = createContext<TypesContextType>({
  types: [],
  setTypes: () => {},
  addType: () => {},
  updateType: () => {},
  deleteType: () => {},
  typesCount: 0,
});

export default function TypesContextProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [types, setTypes] = useState<IType[]>([]);
  const { setUndoStack, setRedoStack } = useUndoRedo();

  const addType = (data?: { index: number; type: IType }, addToHistory: boolean = true) => {
    const id = nanoid();
    if (data) {
      setTypes((prev) => {
        const temp = prev.slice();
        temp.splice(data.index, 0, data.type);
        return temp;
      });
    } else {
      setTypes((prev) => [
        ...prev,
        {
          id,
          name: `type_${prev.length}`,
          fields: [],
          comment: "",
        },
      ]);
    }
    if (addToHistory) {
      setUndoStack((prev) => [
        ...prev,
        {
          data: {
            index: types.length,
            type: data?.type ?? {
              id,
              name: `type_${types.length}`,
              fields: [],
              comment: "",
            },
          },
          action: Action.ADD,
          element: ObjectType.TYPE,
          message: t("add_type"),
        },
      ]);
      setRedoStack([]);
    }
  };

  const deleteType = (id: string | number, addToHistory: boolean = true) => {
    const deletedTypeIndex = types.findIndex((e) => e.id === id);
    if (deletedTypeIndex === -1) return;

    if (addToHistory) {
      Toast.success(t("type_deleted"));
      setUndoStack((prev) => [
        ...prev,
        {
          action: Action.DELETE,
          element: ObjectType.TYPE,
          data: { type: types[deletedTypeIndex], index: deletedTypeIndex },
          message: t("delete_type", {
            typeName: types[deletedTypeIndex].name,
          }),
        },
      ]);
      setRedoStack([]);
    }
    setTypes((prev) => prev.filter((e) => e.id !== id));
  };

  const updateType = (id: string | number, values: Partial<IType>) => {
    setTypes((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...values } : item)),
    );
  };

  return (
    <TypesContext.Provider
      value={{
        types,
        setTypes,
        addType,
        updateType,
        deleteType,
        typesCount: types.length,
      }}
    >
      {children}
    </TypesContext.Provider>
  );
}
