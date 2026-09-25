'use client';

import { useState } from 'react';
import { ActionItem, ActionItemCreate, ActionItemUpdate } from '@/lib/types';
import { getActionItems, createActionItem, updateActionItem, deleteActionItem } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { CheckCircle, Circle, Plus, Trash2, Edit2 } from 'lucide-react';
import { Toast } from '@/components/ui/toast';

interface ActionItemsListProps {
  meetingId: number;
  initialItems: ActionItem[];
}

export function ActionItemsList({ meetingId, initialItems }: ActionItemsListProps) {
  const [items, setItems] = useState<ActionItem[]>(initialItems);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ActionItem | null>(null);
  const [pendingItemId, setPendingItemId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleToggleComplete = async (item: ActionItem) => {
    try {
      setPendingItemId(item.id);
      const updated = await updateActionItem(item.id, { completed: !item.completed });
      setItems(items.map(i => i.id === item.id ? updated : i));
      setToast({ message: 'Action item updated', type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to update action item', type: 'error' });
    } finally {
      setPendingItemId(null);
    }
  };

  const handleCreate = async (data: ActionItemCreate | ActionItemUpdate) => {
    try {
      const newItem = await createActionItem(meetingId, data as ActionItemCreate);
      setItems([...items, newItem]);
      setShowCreateModal(false);
      setToast({ message: 'Action item created', type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to create action item', type: 'error' });
    }
  };

  const handleUpdate = async (data: ActionItemCreate | ActionItemUpdate) => {
    if (!editingItem) return;
    
    try {
      const updated = await updateActionItem(editingItem.id, data as ActionItemUpdate);
      setItems(items.map(i => i.id === editingItem.id ? updated : i));
      setShowEditModal(false);
      setEditingItem(null);
      setToast({ message: 'Action item updated', type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to update action item', type: 'error' });
    }
  };

  const handleDelete = async (itemId: number) => {
    if (!confirm('Are you sure you want to delete this action item?')) return;
    
    try {
      setPendingItemId(itemId);
      await deleteActionItem(itemId);
      setItems(items.filter(i => i.id !== itemId));
      setToast({ message: 'Action item deleted', type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to delete action item', type: 'error' });
    } finally {
      setPendingItemId(null);
    }
  };

  const openEditModal = (item: ActionItem) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  return (
    <>
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No action items
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-lg border transition-colors ${
                item.completed
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  aria-label={`${item.completed ? 'Mark incomplete' : 'Mark complete'}: ${item.title}`}
                  onClick={() => handleToggleComplete(item)}
                  disabled={pendingItemId === item.id}
                  className="mt-0.5 flex-shrink-0"
                >
                  {item.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      item.completed
                        ? 'text-gray-500 line-through'
                        : 'text-gray-900'
                    }`}
                  >
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="text-xs text-gray-600 mt-1">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    {item.assignee && (
                      <span>Assigned to: {item.assignee}</span>
                    )}
                    {item.due_date && (
                      <span>Due: {formatDate(item.due_date)}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    aria-label={`Edit action item: ${item.title}`}
                    onClick={() => openEditModal(item)}
                    disabled={pendingItemId === item.id}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    aria-label={`Delete action item: ${item.title}`}
                    onClick={() => handleDelete(item.id)}
                    disabled={pendingItemId === item.id}
                    className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Button
        onClick={() => setShowCreateModal(true)}
        className="w-full mt-4"
        variant="secondary"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Action Item
      </Button>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add Action Item"
      >
        <ActionItemForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingItem(null);
        }}
        title="Edit Action Item"
      >
        {editingItem && (
          <ActionItemForm
            item={editingItem}
            onSubmit={handleUpdate}
            onCancel={() => {
              setShowEditModal(false);
              setEditingItem(null);
            }}
          />
        )}
      </Modal>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}

interface ActionItemFormProps {
  item?: ActionItem;
  onSubmit: (data: ActionItemCreate | ActionItemUpdate) => Promise<void>;
  onCancel: () => void;
}

function ActionItemForm({ item, onSubmit, onCancel }: ActionItemFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: item?.title || '',
    description: item?.description || '',
    assignee: item?.assignee || '',
    due_date: item?.due_date ? item.due_date.split('T')[0] : '',
    completed: item?.completed || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      setLoading(true);
      await onSubmit({
        ...formData,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Action item title"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Detailed description"
          rows={3}
          className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assignee
          </label>
          <Input
            value={formData.assignee}
            onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
            placeholder="Assignee name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Due Date
          </label>
          <Input
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="completed"
          checked={formData.completed}
          onChange={(e) => setFormData({ ...formData, completed: e.target.checked })}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="completed" className="text-sm text-gray-700">
          Mark as completed
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (item ? 'Updating...' : 'Creating...') : (item ? 'Update' : 'Create')}
        </Button>
      </div>
    </form>
  );
}
