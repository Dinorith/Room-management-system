import React, { useEffect, useState } from 'react';
import { Edit2, Loader } from 'lucide-react';
import RoomTypeService, { RoomType } from '../../services/RoomTypeService';
import styles from './RoomTypeManager.module.css';

interface RoomTypeDetailProps {
  roomTypeId: string;
  onEdit: () => void;
}

export default function RoomTypeDetail({ roomTypeId, onEdit }: RoomTypeDetailProps) {
  const [roomType, setRoomType] = useState<RoomType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRoomType();
  }, [roomTypeId]);

  const loadRoomType = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await RoomTypeService.getById(roomTypeId);
      setRoomType(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load room type');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.detailContainer}>
        <Loader size={40} className={styles.spinner} />
        Loading room type details...
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.detailContainer}>
        <div className={styles.errorAlert}>{error}</div>
      </div>
    );
  }

  if (!roomType) {
    return <div className={styles.detailContainer}>Room type not found</div>;
  }

  return (
    <div className={styles.detailContainer}>
      <div className={styles.detailHeader}>
        <div>
          <h1>{roomType.name}</h1>
          <p className={styles.subtitle}>Room Type Details</p>
        </div>
        <button onClick={onEdit} className={styles.editButton}>
          <Edit2 size={20} /> Edit
        </button>
      </div>

      <div className={styles.detailGrid}>
        <div className={styles.detailCard}>
          <h3>Pricing Information</h3>
          <div className={styles.detailItem}>
            <span className={styles.label}>Base Monthly Price:</span>
            <span className={styles.value}>${roomType.base_price.toFixed(2)}</span>
          </div>
        </div>

        <div className={styles.detailCard}>
          <h3>Capacity</h3>
          <div className={styles.detailItem}>
            <span className={styles.label}>Maximum Occupancy:</span>
            <span className={styles.value}>{roomType.capacity} persons</span>
          </div>
        </div>

        <div className={styles.detailCard}>
          <h3>Status</h3>
          <div className={styles.detailItem}>
            <span className={styles.label}>Room Type Status:</span>
            <span
              className={`${styles.value} ${styles.badge} ${
                roomType.status ? styles.badgeActive : styles.badgeInactive
              }`}
            >
              {roomType.status ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div className={styles.detailCard}>
          <h3>Usage Statistics</h3>
          <div className={styles.detailItem}>
            <span className={styles.label}>Number of Rooms:</span>
            <span className={styles.value}>{roomType.room_count || 0} rooms</span>
          </div>
        </div>

        {roomType.description && (
          <div className={`${styles.detailCard} ${styles.fullWidth}`}>
            <h3>Description</h3>
            <p className={styles.descriptionText}>{roomType.description}</p>
          </div>
        )}

        <div className={`${styles.detailCard} ${styles.fullWidth}`}>
          <h3>Timestamps</h3>
          <div className={styles.detailItem}>
            <span className={styles.label}>Created:</span>
            <span className={styles.value}>
              {new Date(roomType.created_at).toLocaleDateString()} at{' '}
              {new Date(roomType.created_at).toLocaleTimeString()}
            </span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.label}>Last Updated:</span>
            <span className={styles.value}>
              {new Date(roomType.updated_at).toLocaleDateString()} at{' '}
              {new Date(roomType.updated_at).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
