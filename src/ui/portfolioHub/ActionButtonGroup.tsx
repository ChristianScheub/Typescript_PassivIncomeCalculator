import React from 'react';
import { Pencil, Trash2, Eye, Plus } from 'lucide-react';
import { Button } from '../shared/Button';

interface ActionButtonGroupProps {
  /** Show edit button */
  showEdit?: boolean;
  /** Show delete button */
  showDelete?: boolean;
  /** Show view button */
  showView?: boolean;
  /** Show add price button */
  showAddPrice?: boolean;
  /** Edit button click handler */
  onEdit?: () => void;
  /** Delete button click handler */
  onDelete?: () => void;
  /** View button click handler */
  onView?: () => void;
  /** Add price button click handler */
  onAddPrice?: () => void;
  /** Size of the buttons */
  size?: 'sm' | 'default' | 'lg';
  /** Button variant */
  variant?: 'outline' | 'ghost' | 'default';
  /** Custom className */
  className?: string;
}

export const ActionButtonGroup: React.FC<ActionButtonGroupProps> = ({
  showEdit = true,
  showDelete = true,
  showView = false,
  showAddPrice = false,
  onEdit,
  onDelete,
  onView,
  onAddPrice,
  size = 'sm',
  variant = 'outline',
  className = ''
}) => {
  return (
    <div className={`flex space-x-2 ${className}`}>
      {showView && onView && (
        <Button
          variant={variant}
          size={size}
          onClick={onView}
          className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
        >
          <Eye size={14} className="mr-1" />
          View
        </Button>
      )}
      
      {showAddPrice && onAddPrice && (
        <Button
          variant={variant}
          size={size}
          onClick={onAddPrice}
          className="text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30"
        >
          <Plus size={14} className="mr-1" />
          Add Price
        </Button>
      )}
      
      {showEdit && onEdit && (
        <Button
          variant={variant}
          size={size}
          onClick={onEdit}
          className="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <Pencil size={14} className="mr-1" />
          Edit
        </Button>
      )}
      
      {showDelete && onDelete && (
        <Button
          variant={variant}
          size={size}
          onClick={onDelete}
          className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
        >
          <Trash2 size={14} className="mr-1" />
          Delete
        </Button>
      )}
    </div>
  );
};
