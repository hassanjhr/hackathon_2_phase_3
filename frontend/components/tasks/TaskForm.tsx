'use client';

import { useState, FormEvent } from 'react';
import { TaskFormData } from '@/types';
import { validateTaskForm } from '@/lib/utils/validation';

/**
 * TaskForm Component
 * Form for creating new tasks
 */
interface TaskFormProps {
  onSubmit: (data: TaskFormData) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export default function TaskForm({ onSubmit, loading = false, error = null }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Clear previous validation errors
    setValidationErrors({});

    // Validate form data
    const formData = { title };
    const errors = validateTaskForm(formData);

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Submit form
    try {
      await onSubmit(formData);
      // Clear form on success
      setTitle('');
    } catch (err) {
      // Error handling is done by parent component
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          New Task
        </label>
        <div className="mt-1 flex gap-2">
          <input
            id="title"
            name="title"
            type="text"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors.title
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300'
            }`}
            disabled={loading}
            aria-invalid={!!validationErrors.title}
            aria-describedby={validationErrors.title ? 'title-error' : undefined}
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              'Add Task'
            )}
          </button>
        </div>
        {validationErrors.title && (
          <p id="title-error" className="mt-1 text-sm text-red-600">
            {validationErrors.title}
          </p>
        )}
      </div>

      {/* API Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4" role="alert">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </form>
  );
}
