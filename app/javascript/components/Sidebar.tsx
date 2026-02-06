import SidebarNav from './SidebarNav'
import type { View } from './SidebarNav'

interface SidebarProps {
  currentView: View
  onNavigate: (view: View) => void
}

export default function Sidebar({ currentView, onNavigate }: SidebarProps) {
  return (
    <div className="sidebar h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b-2 border-border">
        <h1 className="text-lg font-bold tracking-tight">BudgetBuddy</h1>
      </div>

      {/* Navigation */}
      <SidebarNav currentView={currentView} onNavigate={onNavigate} />
    </div>
  )
}
