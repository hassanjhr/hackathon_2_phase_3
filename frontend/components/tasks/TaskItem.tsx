'use client';

import { useState } from 'react';
import { Task, UpdateTaskData } from '@/types';

/**
 * TaskItem Component
 * Individual task item with edit, toggle completion, and delete functionality
 */
interface TaskItemProps {
  task: Task;
  onUpdate: (data: UpdateTaskData) => Promise<void>;
  onDelete: () => Promise<void>;
}

export default function TaskItem({ task, onUpdate, onDelete }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleToggleComplete = async () => {
    setIsUpdating(true);
    try {
      await onUpdate({ completed: !task.completed });
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveEdit = async () => {
    if (editTitle.trim() === '') {
      return;
    }

    if (editTitle === task.title) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdate({ title: editTitle });
      setIsEditing(false);
    } catch (error) {
      // Revert on error
      setEditTitle(task.title);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
      setShowDeleteConfirm(false);
    } catch (error) {
      // Error handled by parent
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={task.completed}
        onChange={handleToggleComplete}
        disabled={isUpdating || isDeleting}
        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
        aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
      />

      {/* Task Title */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSaveEdit();
              } else if (e.key === 'Escape') {
                handleCancelEdit();
              }
            }}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isUpdating}
            autoFocus
          />
        ) : (
          <p
            className={`text-sm ${
              task.completed ? 'line-through text-gray-500' : 'text-gray-900'
            }`}
          >
            {task.title}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <button
              onClick={handleSaveEdit}
              disabled={isUpdating}
              className="text-sm text-green-600 hover:text-green-700 disabled:opacity-50"
              aria-label="Save changes"
            >
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={isUpdating}
              className="text-sm text-gray-600 hover:text-gray-700 disabled:opacity-50"
              aria-label="Cancel editing"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              disabled={isUpdating || isDeleting}
              className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
              aria-label={`Edit "${task.title}"`}
            >
              Edit
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isUpdating || isDeleting}
              className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
              aria-label={`Delete "${task.title}"`}
            >
              Delete
            </button>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Task</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete "{task.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
