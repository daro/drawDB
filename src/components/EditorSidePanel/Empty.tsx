import {
  IllustrationNoContent,
  IllustrationNoContentDark,
} from "@douyinfe/semi-illustrations";
import { Empty as SemiUIEmpty } from "@douyinfe/semi-ui";
import { ReactNode } from "react";

/**
 * Props for the Empty component.
 * 
 * @interface EmptyProps
 * @property {ReactNode} title - The title to display in the empty state.
 * @property {ReactNode} text - The description text to display in the empty state.
 */
interface EmptyProps {
  title: ReactNode;
  text: ReactNode;
}

/**
 * A component that displays an empty state with an illustration, title, and description.
 * 
 * @param {EmptyProps} props - The component props.
 * @returns {JSX.Element} The rendered empty state.
 */
export default function Empty({ title, text }: EmptyProps) {
  return (
    <div className="select-none mt-2">
      <SemiUIEmpty
        image={<IllustrationNoContent style={{ width: 154, height: 154 }} />}
        darkModeImage={
          <IllustrationNoContentDark style={{ width: 154, height: 154 }} />
        }
        title={title}
        description={text}
      />
    </div>
  );
}
