"use client"
import { motion } from "framer-motion"

export const DashboardMockup = () => {
  return (
    <motion.svg
      width="100%"
      height="100%"
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      {/* Dashboard Frame */}
      <rect x="10" y="10" width="380" height="280" rx="8" fill="#1E1E2E" stroke="#6366F1" strokeWidth="1.5" />

      {/* Top Bar */}
      <rect x="10" y="10" width="380" height="40" rx="8" fill="#2D2B42" />
      <circle cx="30" cy="30" r="8" fill="#FF5757" />
      <circle cx="55" cy="30" r="8" fill="#FFBD2E" />
      <circle cx="80" cy="30" r="8" fill="#27C93F" />

      {/* Sidebar */}
      <rect x="10" y="50" width="80" height="240" fill="#2D2B42" />
      <rect x="25" y="70" width="50" height="8" rx="4" fill="#6366F1" />
      <rect x="25" y="100" width="50" height="8" rx="4" fill="#8B8D9E" />
      <rect x="25" y="130" width="50" height="8" rx="4" fill="#8B8D9E" />
      <rect x="25" y="160" width="50" height="8" rx="4" fill="#8B8D9E" />
      <rect x="25" y="190" width="50" height="8" rx="4" fill="#8B8D9E" />

      {/* Main Content - Stats */}
      <rect x="110" y="70" width="80" height="60" rx="6" fill="#2D2B42" />
      <rect x="125" y="85" width="50" height="6" rx="3" fill="#6366F1" />
      <rect x="125" y="105" width="30" height="10" rx="3" fill="#FFFFFF" />

      <rect x="210" y="70" width="80" height="60" rx="6" fill="#2D2B42" />
      <rect x="225" y="85" width="50" height="6" rx="3" fill="#6366F1" />
      <rect x="225" y="105" width="30" height="10" rx="3" fill="#FFFFFF" />

      <rect x="310" y="70" width="60" height="60" rx="6" fill="#2D2B42" />
      <rect x="325" y="85" width="30" height="6" rx="3" fill="#6366F1" />
      <rect x="325" y="105" width="20" height="10" rx="3" fill="#FFFFFF" />

      {/* Chart */}
      <rect x="110" y="150" width="260" height="120" rx="6" fill="#2D2B42" />
      <rect x="125" y="165" width="80" height="6" rx="3" fill="#6366F1" />

      {/* Chart Bars */}
      <rect x="140" y="190" width="15" height="60" rx="2" fill="#6366F1" opacity="0.3" />
      <rect x="140" y="220" width="15" height="30" rx="2" fill="#6366F1" />

      <rect x="170" y="190" width="15" height="60" rx="2" fill="#6366F1" opacity="0.3" />
      <rect x="170" y="200" width="15" height="50" rx="2" fill="#6366F1" />

      <rect x="200" y="190" width="15" height="60" rx="2" fill="#6366F1" opacity="0.3" />
      <rect x="200" y="180" width="15" height="70" rx="2" fill="#6366F1" />

      <rect x="230" y="190" width="15" height="60" rx="2" fill="#6366F1" opacity="0.3" />
      <rect x="230" y="210" width="15" height="40" rx="2" fill="#6366F1" />

      <rect x="260" y="190" width="15" height="60" rx="2" fill="#6366F1" opacity="0.3" />
      <rect x="260" y="190" width="15" height="60" rx="2" fill="#6366F1" />

      <rect x="290" y="190" width="15" height="60" rx="2" fill="#6366F1" opacity="0.3" />
      <rect x="290" y="230" width="15" height="20" rx="2" fill="#6366F1" />

      <rect x="320" y="190" width="15" height="60" rx="2" fill="#6366F1" opacity="0.3" />
      <rect x="320" y="205" width="15" height="45" rx="2" fill="#6366F1" />
    </motion.svg>
  )
}

export const EmailMockup = () => {
  return (
    <motion.svg
      width="100%"
      height="100%"
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.4 }}
    >
      {/* Email App Frame */}
      <rect x="10" y="10" width="380" height="280" rx="8" fill="#1E1E2E" stroke="#6366F1" strokeWidth="1.5" />

      {/* Top Bar */}
      <rect x="10" y="10" width="380" height="40" rx="8" fill="#2D2B42" />
      <rect x="30" y="26" width="100" height="8" rx="4" fill="#6366F1" />
      <circle cx="360" cy="30" r="8" fill="#6366F1" />

      {/* Sidebar - Email Folders */}
      <rect x="10" y="50" width="100" height="240" fill="#2D2B42" />
      <rect x="25" y="70" width="70" height="8" rx="4" fill="#6366F1" />
      <rect x="25" y="100" width="70" height="8" rx="4" fill="#8B8D9E" />
      <rect x="25" y="130" width="70" height="8" rx="4" fill="#8B8D9E" />
      <rect x="25" y="160" width="70" height="8" rx="4" fill="#8B8D9E" />
      <rect x="25" y="190" width="70" height="8" rx="4" fill="#8B8D9E" />
      <rect x="25" y="220" width="70" height="8" rx="4" fill="#8B8D9E" />

      {/* Email List */}
      <rect x="110" y="50" width="140" height="240" fill="#1E1E2E" />

      {/* Email Items */}
      <rect x="120" y="60" width="120" height="50" rx="4" fill="#2D2B42" />
      <circle cx="135" cy="75" r="8" fill="#6366F1" />
      <rect x="150" y="70" width="80" height="6" rx="3" fill="#FFFFFF" />
      <rect x="150" y="85" width="60" height="4" rx="2" fill="#8B8D9E" />

      <rect x="120" y="120" width="120" height="50" rx="4" fill="#2D2B42" />
      <circle cx="135" cy="135" r="8" fill="#6366F1" />
      <rect x="150" y="130" width="80" height="6" rx="3" fill="#FFFFFF" />
      <rect x="150" y="145" width="60" height="4" rx="2" fill="#8B8D9E" />

      <rect x="120" y="180" width="120" height="50" rx="4" fill="#2D2B42" />
      <circle cx="135" cy="195" r="8" fill="#6366F1" />
      <rect x="150" y="190" width="80" height="6" rx="3" fill="#FFFFFF" />
      <rect x="150" y="205" width="60" height="4" rx="2" fill="#8B8D9E" />

      <rect x="120" y="240" width="120" height="40" rx="4" fill="#2D2B42" />
      <circle cx="135" cy="255" r="8" fill="#6366F1" />
      <rect x="150" y="250" width="80" height="6" rx="3" fill="#FFFFFF" />
      <rect x="150" y="265" width="60" height="4" rx="2" fill="#8B8D9E" />

      {/* Email Content */}
      <rect x="250" y="50" width="140" height="240" fill="#1E1E2E" />
      <rect x="265" y="70" width="110" height="8" rx="4" fill="#FFFFFF" />
      <rect x="265" y="90" width="80" height="6" rx="3" fill="#8B8D9E" />

      <rect x="265" y="120" width="110" height="4" rx="2" fill="#8B8D9E" />
      <rect x="265" y="135" width="110" height="4" rx="2" fill="#8B8D9E" />
      <rect x="265" y="150" width="110" height="4" rx="2" fill="#8B8D9E" />
      <rect x="265" y="165" width="110" height="4" rx="2" fill="#8B8D9E" />
      <rect x="265" y="180" width="80" height="4" rx="2" fill="#8B8D9E" />

      <rect x="265" y="210" width="110" height="30" rx="4" fill="#2D2B42" />
      <rect x="280" y="223" width="80" height="4" rx="2" fill="#FFFFFF" />
    </motion.svg>
  )
}

export const AnalyticsMockup = () => {
  return (
    <motion.svg
      width="100%"
      height="100%"
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.6 }}
    >
      {/* Analytics Frame */}
      <rect x="10" y="10" width="380" height="280" rx="8" fill="#1E1E2E" stroke="#6366F1" strokeWidth="1.5" />

      {/* Top Bar */}
      <rect x="10" y="10" width="380" height="40" rx="8" fill="#2D2B42" />
      <rect x="30" y="26" width="120" height="8" rx="4" fill="#6366F1" />
      <circle cx="350" cy="30" r="8" fill="#6366F1" />
      <circle cx="375" cy="30" r="8" fill="#8B8D9E" />

      {/* Main Content */}
      <rect x="30" y="70" width="340" height="60" rx="6" fill="#2D2B42" />
      <rect x="50" y="85" width="60" height="8" rx="4" fill="#FFFFFF" />
      <rect x="50" y="105" width="40" height="10" rx="3" fill="#6366F1" />

      <rect x="150" y="85" width="60" height="8" rx="4" fill="#FFFFFF" />
      <rect x="150" y="105" width="40" height="10" rx="3" fill="#6366F1" />

      <rect x="250" y="85" width="60" height="8" rx="4" fill="#FFFFFF" />
      <rect x="250" y="105" width="40" height="10" rx="3" fill="#6366F1" />

      {/* Line Chart */}
      <rect x="30" y="150" width="160" height="120" rx="6" fill="#2D2B42" />
      <rect x="45" y="165" width="80" height="6" rx="3" fill="#FFFFFF" />

      {/* Line Chart Path */}
      <path d="M45,235 Q65,200 85,220 Q105,240 125,190 Q145,140 165,180" stroke="#6366F1" strokeWidth="2" fill="none" />
      <circle cx="45" cy="235" r="3" fill="#6366F1" />
      <circle cx="85" cy="220" r="3" fill="#6366F1" />
      <circle cx="125" cy="190" r="3" fill="#6366F1" />
      <circle cx="165" cy="180" r="3" fill="#6366F1" />

      {/* Pie Chart */}
      <rect x="210" y="150" width="160" height="120" rx="6" fill="#2D2B42" />
      <rect x="225" y="165" width="80" height="6" rx="3" fill="#FFFFFF" />

      {/* Pie Chart */}
      <circle cx="290" cy="210" r="40" fill="#1E1E2E" />
      <path d="M290,210 L290,170 A40,40 0 0,1 330,210 Z" fill="#6366F1" />
      <path d="M290,210 L330,210 A40,40 0 0,1 290,250 Z" fill="#A5B4FC" />
      <path d="M290,210 L290,250 A40,40 0 0,1 250,210 Z" fill="#818CF8" />
      <path d="M290,210 L250,210 A40,40 0 0,1 290,170 Z" fill="#4F46E5" opacity="0.7" />
      <circle cx="290" cy="210" r="15" fill="#1E1E2E" />
    </motion.svg>
  )
}
