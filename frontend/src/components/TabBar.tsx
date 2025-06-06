import { X, Plus, Circle } from 'lucide-react'
import clsx from 'clsx'
import { TAB_HEIGHT } from '@verbweaver/shared'
import { useTabStore } from '../store/tabStore'
import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

function TabBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { tabs, activeTabId, addTab, removeTab, setActiveTab } = useTabStore()

  // Sync current route with active tab
  useEffect(() => {
    // For editor tabs, match by file path
    if (location.pathname.startsWith('/editor/')) {
      const filePath = decodeURIComponent(location.pathname.replace('/editor/', ''))
      const editorTab = tabs.find(tab => 
        tab.type === 'editor' && tab.metadata?.filePath === filePath
      )
      if (editorTab && editorTab.id !== activeTabId) {
        setActiveTab(editorTab.id)
        return
      }
    }
    
    // For other tabs, match by path prefix
    const currentTab = tabs.find(tab => 
      tab.type !== 'editor' && location.pathname.startsWith(tab.path)
    )
    if (currentTab && currentTab.id !== activeTabId) {
      setActiveTab(currentTab.id)
    }
  }, [location.pathname, tabs, activeTabId, setActiveTab])

  const handleTabClick = (tabId: string, path: string) => {
    setActiveTab(tabId)
    navigate(path)
  }

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation()
    
    // Don't allow closing the last tab
    if (tabs.length === 1) return
    
    const tab = tabs.find(t => t.id === tabId)
    
    // If tab has unsaved changes, confirm before closing
    if (tab?.metadata?.isModified) {
      if (!confirm(`"${tab.title}" has unsaved changes. Close anyway?`)) {
        return
      }
    }
    
    // Find the tab to be removed and the next active tab
    const tabIndex = tabs.findIndex(tab => tab.id === tabId)
    const isActive = tabId === activeTabId
    
    removeTab(tabId)
    
    // If we closed the active tab, navigate to the new active tab
    if (isActive && tabs.length > 1) {
      const nextTab = tabs[tabIndex === tabs.length - 1 ? tabIndex - 1 : tabIndex + 1]
      if (nextTab) {
        navigate(nextTab.path)
      }
    }
  }

  const handleNewTab = () => {
    // Default to graph view for new tabs
    const newTabId = addTab({
      path: '/graph',
      title: 'Graph',
      type: 'graph'
    })
    navigate('/graph')
  }

  return (
    <div 
      className="flex items-center bg-muted/30 border-b border-border overflow-x-auto scrollbar-thin"
      style={{ height: `${TAB_HEIGHT}px` }}
    >
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={clsx(
            'flex items-center gap-2 px-4 h-full border-r border-border transition-colors min-w-[120px] cursor-pointer',
            'hover:bg-accent/50',
            tab.id === activeTabId && 'bg-background'
          )}
          onClick={() => handleTabClick(tab.id, tab.path)}
        >
          <span className="text-sm truncate flex items-center gap-1">
            {tab.title}
            {tab.metadata?.isModified && (
              <Circle className="w-2 h-2 fill-current" />
            )}
          </span>
          {tabs.length > 1 && (
            <div
              onClick={(e) => handleCloseTab(e, tab.id)}
              className="p-0.5 rounded hover:bg-muted cursor-pointer"
            >
              <X className="w-3 h-3" />
            </div>
          )}
        </div>
      ))}
      
      <button
        onClick={handleNewTab}
        className="p-2 hover:bg-accent/50 transition-colors"
        title="New tab"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  )
}

export default TabBar 