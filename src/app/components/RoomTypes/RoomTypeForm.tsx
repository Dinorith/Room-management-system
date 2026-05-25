import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader } from 'lucide-react';
import RoomTypeService, { RoomType, RoomTypeCreateInput } from '../../services/RoomTypeService';
import styles from './RoomTypeManager.module.css';

interface RoomTypeFormProps {
  roomType?: RoomType;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function RoomTypeForm({ roomType, onSuccess, onCancel }: RoomTypeFormProps) {
  const [formData, setFormData] = useState<RoomTypeCreateInput>({
    name: '',
    base_price: 0,
    capacity: 1,
    description: '',
    status: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (roomType) {
      setFormData({
        name: roomType.name,
        base_price: roomType.base_price,
        capacity: roomType.capacity,
        description: roomType.description || '',
        status: roomType.status,
      });
    }
  }, [roomType]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Room type name is required';
    }

    if (formData.base_price < 0) {
      newErrors.base_price = 'Base price cannot be negative';
    }

    if (formData.capacity < 1 || formData.capacity > 20) {
      newErrors.capacity = 'Capacity must be between 1 and 20';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData({
      ...formData,
      [name]: name === 'base_price' ? parseFloat(value) : 
              name === 'capacity' ? parseInt(value) : 
              newValue,
    });

    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (roomType) {
        await RoomTypeService.update(roomType.id, formData);
      } else {
        await RoomTypeService.create(formData);
      }

      onSuccess();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || `Failed to ${roomType ? 'update' : 'create'} room type`;
      setSubmitError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>{roomType ? 'Edit Room Type' : 'Create New Room Type'}</h2>

      {submitError && (
        <div className={styles.errorAlert}>
          <AlertCircle size={20} />
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Room Type Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Standard Room, Deluxe Room"
            className={errors.name ? styles.inputError : ''}
          />
          {errors.name && <span className={styles.errorText}>{errors.name}</span>}
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="base_price">Base Monthly Price * ($)</label>
            <input
              type="number"
              id="base_price"
              name="base_price"
              value={formData.base_price}
              onChange={handleChange}
              step="0.01"
              min="0"
              placeholder="0.00"
              className={errors.base_price ? styles.inputError : ''}
            />
            {errors.base_price && <span className={styles.errorText}>{errors.base_price}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="capacity">Capacity (persons) *</label>
            <input
              type="number"
              id="capacity"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              min="1"
              max="20"
              placeholder="1"
              className={errors.capacity ? styles.inputError : ''}
            />
            {errors.capacity && <span className={styles.errorText}>{errors.capacity}</span>}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter room type description..."
            rows={4}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="status"
              checked={formData.status}
              onChange={handleChange}
            />
            Active (Make this room type available for assignment)
          </label>
        </div>

        <div className={styles.formActions}>
          <button type="button" onClick={onCancel} className={styles.cancelButton}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading && <Loader size={20} className={styles.spinner} />}
            {roomType ? 'Update Room Type' : 'Create Room Type'}
          </button>
        </div>
      </form>
    </div>
  );
}
