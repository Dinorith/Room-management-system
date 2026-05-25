import React, { useEffect, useState } from 'react';
import { Trash2, Edit2, Plus, Search, Filter } from 'lucide-react';
import RoomTypeService, { RoomType } from '../../services/RoomTypeService';
import RoomTypeForm from './RoomTypeForm';
import RoomTypeDetail from './RoomTypeDetail';
import styles from './RoomTypeManager.module.css';

export default function RoomTypesList() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // Load room types
  const loadRoomTypes = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const filters: any = {
        page,
        limit,
        search: searchTerm,
      };

      if (filterStatus !== 'all') {
        filters.status = filterStatus === 'active';
      }

      const response = await RoomTypeService.getAll(filters);
      setRoomTypes(response.data);
      setTotalPages(response.pagination.last_page);
      setCurrentPage(page);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load room types');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoomTypes(1);
  }, [searchTerm, filterStatus, limit]);

  const handleCreateSuccess = () => {
    setShowForm(false);
    setEditingId(null);
    loadRoomTypes(currentPage);
  };

  const handleEdit = (roomType: RoomType) => {
    setSelectedRoomType(roomType);
    setEditingId(roomType.id);
    setShowForm(true);
  };

  const handleView = (roomType: RoomType) => {
    setSelectedRoomType(roomType);
    setShowDetail(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this room type?')) {
      return;
    }

    try {
      await RoomTypeService.delete(id);
      loadRoomTypes(currentPage);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete room type';
      setError(errorMessage);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setSelectedRoomType(null);
  };

  if (showForm) {
    return (
      <div className={styles.container}>
        <button onClick={handleCloseForm} className={styles.backButton}>
          ← Back to Room Types
        </button>
        <RoomTypeForm
          roomType={selectedRoomType || undefined}
          onSuccess={handleCreateSuccess}
          onCancel={handleCloseForm}
        />
      </div>
    );
  }

  if (showDetail && selectedRoomType) {
    return (
      <div className={styles.container}>
        <button onClick={() => setShowDetail(false)} className={styles.backButton}>
          ← Back to Room Types
        </button>
        <RoomTypeDetail
          roomTypeId={selectedRoomType.id}
          onEdit={() => handleEdit(selectedRoomType)}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Room Types Management</h1>
          <p>Create and manage different room types with dynamic pricing</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setSelectedRoomType(null);
            setShowForm(true);
          }}
          className={styles.createButton}
        >
          <Plus size={20} /> Create Room Type
        </button>
      </div>

      {error && <div className={styles.errorAlert}>{error}</div>}

      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Search room types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <Filter size={20} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className={styles.limitSelector}>
          <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
          </select>
        </div>
      </div>

      {loading && <div className={styles.loadingSpinner}>Loading...</div>}

      {!loading && roomTypes.length === 0 && (
        <div className={styles.emptyState}>
          <p>No room types found. Create your first room type!</p>
        </div>
      )}

      {!loading && roomTypes.length > 0 && (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Room Type</th>
                  <th>Base Price</th>
                  <th>Capacity</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {roomTypes.map((roomType) => (
                  <tr key={roomType.id}>
                    <td className={styles.nameCell}>
                      <strong>{roomType.name}</strong>
                    </td>
                    <td>${roomType.base_price.toFixed(2)}</td>
                    <td>{roomType.capacity} persons</td>
                    <td className={styles.descriptionCell}>
                      {roomType.description || 'N/A'}
                    </td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          roomType.status ? styles.badgeActive : styles.badgeInactive
                        }`}
                      >
                        {roomType.status ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      <button
                        onClick={() => handleView(roomType)}
                        className={styles.viewButton}
                        title="View Details"
                      >
                        👁
                      </button>
                      <button
                        onClick={() => handleEdit(roomType)}
                        className={styles.editButton}
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(roomType.id)}
                        className={styles.deleteButton}
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <button
              onClick={() => loadRoomTypes(currentPage - 1)}
              disabled={currentPage === 1}
              className={styles.paginationButton}
            >
              Previous
            </button>
            <span className={styles.pageInfo}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => loadRoomTypes(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={styles.paginationButton}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
