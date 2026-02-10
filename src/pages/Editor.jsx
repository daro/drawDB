import LayoutContextProvider from "../context/LayoutContext";
import TransformContextProvider from "../context/TransformContext";
import TablesContextProvider from "../context/DiagramContext";
import UndoRedoContextProvider from "../context/UndoRedoContext";
import SelectContextProvider from "../context/SelectContext";
import AreasContextProvider from "../context/AreasContext";
import NotesContextProvider from "../context/NotesContext";
import TypesContextProvider from "../context/TypesContext";
import TasksContextProvider from "../context/TasksContext";
import SaveStateContextProvider from "../context/SaveStateContext";
import EnumsContextProvider from "../context/EnumsContext";
import TextsContextProvider from "../context/TextsContext";
import WorkSpace from "../components/Workspace";
import { useThemedPage } from "../hooks";

export default function Editor() {
  useThemedPage();

  return (
    <LayoutContextProvider>
      <TransformContextProvider>
        <UndoRedoContextProvider>
          <SelectContextProvider>
            <TasksContextProvider>
              <AreasContextProvider>
                <NotesContextProvider>
                  <TextsContextProvider>
                    <TypesContextProvider>
                    <EnumsContextProvider>
                      <TablesContextProvider>
                        <SaveStateContextProvider>
                          <WorkSpace />
                        </SaveStateContextProvider>
                      </TablesContextProvider>
                    </EnumsContextProvider>
                  </TypesContextProvider>
                </TextsContextProvider>
              </NotesContextProvider>
              </AreasContextProvider>
            </TasksContextProvider>
          </SelectContextProvider>
        </UndoRedoContextProvider>
      </TransformContextProvider>
    </LayoutContextProvider>
  );
}
