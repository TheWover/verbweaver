﻿import { useState } from 'react'
import { X } from 'lucide-react'
import { useTaskStore } from '../../store/taskStore'
import { useNodeStore } from '../../store/nodeStore'
import { format } from 'date-fns'
import { TaskState, TaskStatus, MarkdownMetadata } from '@verbweaver/shared'
import toast from 'react-hot-toast'

interface CreateTaskModalProps {
  projectId?: string
  defaultStatus: string
  onClose: () => void
}

// Check if we're in Electron
const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined

function CreateTaskModal({ projectId, defaultStatus, onClose }: CreateTaskModalProps) {
  const { createTask } = useTaskStore()
  const { createNode } = useNodeStore()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [dueDate, setDueDate] = useState('')
  const [assignee, setAssignee] = useState('')
  const [tags, setTags] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }

    setIsSubmitting(true)
    try {
      if (isElectron) {
        // In Electron mode, create a node with task metadata
        const metadata: Partial<MarkdownMetadata> = {
          title,
          description,
          tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
          task: {
            status: defaultStatus as TaskState,
            priority: priority as 'low' | 'medium' | 'high',
            assignee: assignee || undefined,
            dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
            completedDate: undefined
          }
        }
        
        await createNode('nodes', title, 'file', metadata, `# ${title}\n\n${description || ''}`)
        toast.success('Task created')
        onClose()
      } else if (projectId) {
        // Web mode - use the existing task store
        // Convert TaskState to TaskStatus
        const statusMap: Record<string, TaskStatus> = {
          'todo': TaskStatus.TODO,
          'in-progress': TaskStatus.IN_PROGRESS,
          'review': TaskStatus.REVIEW,
          'done': TaskStatus.DONE,
          'archived': TaskStatus.DONE // map archived to done
        }
        
        await createTask(parseInt(projectId), {
          title,
          description,
          status: statusMap[defaultStatus] || TaskStatus.TODO,
          priority: priority as any,
          assignee,
          tags: [],
          dueDate: dueDate ? new Date(dueDate) : undefined
        })
        onClose()
      } else {
        toast.error('No project context available')
      }
    } catch (error) {
      console.error('Failed to create task:', error)
      toast.error('Failed to create task')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Create Task</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-accent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              placeholder="Enter task title"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background resize-none"
              rows={3}
              placeholder="Enter task description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Assignee</label>
            <input
              type="text"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              placeholder="Enter assignee name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              placeholder="Enter tags separated by commas"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-input rounded-md hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateTaskModal