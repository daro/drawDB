import { Typography } from "@douyinfe/semi-ui";
import { IconGithubLogo } from "@douyinfe/semi-icons";

const { Text } = Typography;

/**
 * AGPL-3.0 Section 13 Compliance Component
 *
 * This component displays a link to the source code, which is required
 * by the GNU Affero General Public License v3.0 when running the software
 * as a network service.
 */
export default function SourceCodeFooter() {
  const REPOSITORY_URL = "https://github.com/daro/drawDB";

  return (
    <div
      style={{
        position: "fixed",
        bottom: 8,
        right: 8,
        zIndex: 1000,
        backgroundColor: "var(--semi-color-bg-2)",
        padding: "6px 12px",
        borderRadius: "4px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "12px",
        opacity: 0.8,
        transition: "opacity 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.8")}
    >
      <IconGithubLogo size="small" />
      <Text size="small">
        <a
          href={REPOSITORY_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "var(--semi-color-text-0)",
            textDecoration: "none",
          }}
        >
          Source Code (AGPL-3.0)
        </a>
      </Text>
    </div>
  );
}
