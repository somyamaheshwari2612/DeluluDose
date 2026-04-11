const QuoteImageTemplate = ({ affirmation, templateRef }) => {
  return (
    <div
      ref={templateRef}
      style={{
        position: "fixed",
        top: "-9999px",
        left: "-9999px",
        width: "600px",
        height: "600px",
        background: "linear-gradient(135deg, #0d0a14 0%, #1a1025 50%, #0d0a14 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px",
        fontFamily: "system-ui, sans-serif",
        boxSizing: "border-box",
      }}
    >
      {/* Top accent */}
      <div style={{
        width: "60px",
        height: "4px",
        background: "linear-gradient(to right, #a855f7, #ec4899)",
        borderRadius: "99px",
        marginBottom: "28px",
        flexShrink: 0,
      }} />

      {/* Category */}
      <p style={{
        fontSize: "11px",
        letterSpacing: "3px",
        textTransform: "uppercase",
        color: "#a855f7",
        margin: "0 0 20px 0",
        flexShrink: 0,
      }}>
        {affirmation.category === "ai-crafted"
            ? "A DeluluDose Original  ✦"
            : affirmation.category}
      </p>

      {/* Quote — solid white, no gradient */}
      <p style={{
        fontSize: "24px",
        fontWeight: "700",
        textAlign: "center",
        lineHeight: "1.6",
        color: "#f3e8ff",
        margin: "0 0 32px 0",
        wordBreak: "break-word",
        overflowWrap: "break-word",
        maxWidth: "100%",
      }}>
        {affirmation.text}
      </p>

      {/* Bottom accent */}
      <div style={{
        width: "60px",
        height: "4px",
        background: "linear-gradient(to right, #a855f7, #ec4899)",
        borderRadius: "99px",
        marginBottom: "20px",
        flexShrink: 0,
      }} />

      {/* Branding */}
      <p style={{
        fontSize: "13px",
        color: "rgba(168, 85, 247, 0.6)",
        letterSpacing: "1px",
        margin: "0",
        flexShrink: 0,
      }}>
        DeluluDose ✦ by Somya 💜
      </p>
    </div>
  )
}

export default QuoteImageTemplate