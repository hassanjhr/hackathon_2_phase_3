/**
 * Task API Client
 * Feature: 003-frontend-integration
 *
 * API functions for task CRUD operations
 */

import { apiClient } from './client';
import { Task, CreateTaskData, UpdateTaskData } from '@/types';
import { getUser } from '@/lib/auth/token';

/**
 * Get user ID from stored user data
 */
function getUserId(): number {
  const user = getUser();
  if (!user || !user.id) {
    throw new Error('User not authenticated');
  }
  return user.id;
}

/**
 * Get all tasks for the authenticated user
 */
export async function getTasks(): Promise<Task[]> {
  const userId = getUserId();
  const response = await apiClient.get<{ tasks: Task[] }>(`/api/${userId}/tasks`, true);
  return response.tasks;
}

/**
 * Create a new task
 */
export async function createTask(data: CreateTaskData): Promise<Task> {
  const userId = getUserId();
  return apiClient.post<Task>(`/api/${userId}/tasks`, data, true);
}

/**
 * Update an existing task
 */
export async function updateTask(id: number, data: UpdateTaskData): Promise<Task> {
  const userId = getUserId();
  return apiClient.put<Task>(`/api/${userId}/tasks/${id}`, data, true);
}

/**
 * Delete a task
 */
export async function deleteTask(id: number): Promise<{ message: string }> {
  const userId = getUserId();
  return apiClient.delete<{ message: string }>(`/api/${userId}/tasks/${id}`, true);
}
