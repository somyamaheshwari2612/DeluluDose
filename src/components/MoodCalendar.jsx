import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useThemeContext } from "../contexts/ThemeContext"

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay() // 0 = Sunday
}

function getTodayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function getDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function MoodCalendar({ moodHistory }) {
  const { isDark } = useThemeContext()
  const [isOpen, setIsOpen] = useState(false)

  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const todayKey = getTodayKey()

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  // Count how many days this month have a mood logged
  const loggedThisMonth = Object.keys(moodHistory).filter(k =>
    k.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`)
  ).length

  return (
    <div className="max-w-xl w-full mt-4">

      {/* Collapsible trigger */}
      <motion.button
        onClick={() => setIsOpen(prev => !prev)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full text-left px-4 py-2.5 rounded-2xl text-xs uppercase tracking-widest font-semibold flex items-center justify-between transition-colors duration-300 cursor-pointer ${
          isDark
            ? "bg-purple-900/30 border border-purple-700/30 text-purple-300 hover:bg-purple-900/50"
            : "bg-sky-900/30 border border-sky-600/30 text-sky-300 hover:bg-sky-900/50"
        }`}
      >
        <span>
          📅 mood calendar
          {loggedThisMonth > 0 && (
            <span className="ml-2 opacity-50 normal-case tracking-normal">
              · {loggedThisMonth} day{loggedThisMonth !== 1 ? "s" : ""} logged
            </span>
          )}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="opacity-60"
        >
          ▾
        </motion.span>
      </motion.button>

      {/* Calendar grid */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className={`mt-2 rounded-2xl p-6 transition-colors duration-500 ${
              isDark
                ? "bg-[#1a1025] border border-purple-800/40"
                : "bg-sky-900/30 border border-sky-500/30 backdrop-blur-sm"
            }`}>

              {/* Month title */}
              <p className={`text-sm font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r ${
                isDark
                    ? "from-purple-300 via-fuchsia-300 to-pink-300"
                    : "from-sky-300 via-cyan-300 to-blue-300"
                }`}>
                {MONTH_NAMES[month]} {year}
                </p>

              {/* Day labels */}
              <div className="grid grid-cols-7 mb-2">
                {DAY_LABELS.map(d => (
                  <p key={d} className={`text-center text-[10px] font-semibold uppercase tracking-wide ${
                    isDark ? "text-purple-500/60" : "text-sky-500/60"
                  }`}>
                    {d}
                  </p>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1">

                {/* Empty cells for offset */}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {/* Day cells */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const key = getDateKey(year, month, day)
                  const emoji = moodHistory[key]
                  const isToday = key === todayKey
                  const isFuture = day > today.getDate()

                  return (
                    <motion.div
                      key={key}
                      whileHover={emoji ? { scale: 1.2 } : {}}
                      title={emoji ? `${key}: ${emoji}` : isToday ? "today" : ""}
                      className={`aspect-square rounded-lg flex items-center justify-center text-base transition-colors duration-300 ${
                        isToday && !emoji
                          ? isDark
                            ? "border border-purple-500/50 bg-purple-900/20"
                            : "border border-sky-500/50 bg-sky-800/20"
                          : !emoji && !isFuture
                            ? isDark
                              ? "bg-purple-900/10"
                              : "bg-sky-900/10"
                            : isFuture
                              ? "opacity-20"
                              : ""
                      }`}
                    >
                      {emoji ? (
                        <span className="text-lg leading-none">{emoji}</span>
                      ) : (
                        <span className={`text-[10px] font-semibold bg-clip-text text-transparent bg-gradient-to-r ${
                            isDark
                                ? "from-purple-300 via-fuchsia-300 to-pink-300"
                                : "from-sky-300 via-cyan-300 to-blue-300"
                            }`}>
                            {isFuture ? "" : day}
                            </span>
                      )}
                    </motion.div>
                  )
                })}
              </div>

              {/* Empty state */}
              {loggedThisMonth === 0 && (
                <p className={`text-xs text-center mt-4 ${
                  isDark ? "text-purple-500/40" : "text-sky-500/40"
                }`}>
                  no moods logged yet this month ✦ tap an emoji above to start
                </p>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}