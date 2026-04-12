import { useThemeContext } from "../contexts/ThemeContext"

const QuoteImageTemplate = ({ affirmation, templateRef }) => {
  const { isDark } = useThemeContext()

  return (
    <div
      ref={templateRef}
      style={{
        position: "fixed",
        top: "-9999px",
        left: "-9999px",
        width: "600px",
        height: "600px",
        background: isDark
          ? "linear-gradient(135deg, #0d0a14 0%, #1a1025 50%, #0d0a14 100%)"
          : "linear-gradient(135deg, #060e1f 0%, #0a1628 50%, #060e1f 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px",
        fontFamily: "system-ui, sans-serif",
        boxSizing: "border-box",
      }}
    >
      <div style={{
        width: "60px",
        height: "4px",
        background: isDark
          ? "linear-gradient(to right, #a855f7, #ec4899)"
          : "linear-gradient(to right, #3b82f6, #06b6d4)",
        borderRadius: "99px",
        marginBottom: "28px",
        flexShrink: 0,
      }} />

      <p style={{
        fontSize: "11px",
        letterSpacing: affirmation.category === "ai-crafted" ? "4px" : "3px",
        textTransform: "uppercase",
        color: isDark ? "#a855f7" : "#3b82f6",
        margin: "0 0 20px 0",
        flexShrink: 0,
      }}>
        {affirmation.category === "ai-crafted"
          ? "A DeluluDose Original ✦"
          : affirmation.category}
      </p>

      <p style={{
        fontSize: "24px",
        fontWeight: "700",
        textAlign: "center",
        lineHeight: "1.6",
        color: isDark ? "#f3e8ff" : "#e0f7ff",
        margin: "0 0 32px 0",
        wordBreak: "break-word",
        overflowWrap: "break-word",
        maxWidth: "100%",
      }}>
        {affirmation.text}
      </p>

      <div style={{
        width: "60px",
        height: "4px",
        background: isDark
          ? "linear-gradient(to right, #a855f7, #ec4899)"
          : "linear-gradient(to right, #3b82f6, #06b6d4)",
        borderRadius: "99px",
        marginBottom: "20px",
        flexShrink: 0,
      }} />

      <p style={{
        fontSize: "13px",
        color: isDark ? "rgba(168, 85, 247, 0.6)" : "rgba(59, 130, 246, 0.6)",
        letterSpacing: "1px",
        margin: "0",
        flexShrink: 0,
      }}>
        {`DeluluDose ✦ by SM ${isDark ? "💜" : "💙"}`}
      </p>
    </div>
  )
}

export default QuoteImageTemplate