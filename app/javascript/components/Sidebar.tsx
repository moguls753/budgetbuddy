import SidebarNav from './SidebarNav'
import type { View } from './SidebarNav'

interface SidebarProps {
  currentView: View
  onNavigate: (view: View) => void
  collapsed?: boolean
  onToggleCollapsed?: () => void
}

export default function Sidebar({ currentView, onNavigate, collapsed = false, onToggleCollapsed }: SidebarProps) {
  return (
    <div className={`sidebar h-full${collapsed ? ' sidebar-collapsed' : ''}`}>
      {/* Logo — height matches topbar so borders align */}
      <div className={`h-14 flex items-center border-b-2 border-border flex-shrink-0 overflow-hidden${
        collapsed ? ' justify-center' : ' px-5'
      }`}>
        <h1 className="text-lg font-bold tracking-tight">
          {collapsed ? 'K' : 'Kontor'}
        </h1>
      </div>

      {/* Navigation */}
      <SidebarNav
        currentView={currentView}
        onNavigate={onNavigate}
        collapsed={collapsed}
        onToggleCollapsed={onToggleCollapsed}
      />
    </div>
  )
}
