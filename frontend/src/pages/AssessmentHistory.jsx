import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Eye,
  Calendar,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import { StatusBadge, ConfidenceBadge } from '../components/Badge';

export default function AssessmentHistory() {
  const [assessments, setAssessments] = useState([]);
  const [crops, setCrops] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCropId, setSelectedCropId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Load Crops for filter dropdown
  useEffect(() => {
    async function loadCrops() {
      try {
        const data = await api.getCrops();
        setCrops(data);
      } catch (err) {
        console.warn('Could not fetch crops for filter');
      }
    }
    loadCrops();
  }, []);

  // Load Assessments whenever page or filters change
  useEffect(() => {
    async function loadAssessments() {
      setLoading(true);
      try {
        const res = await api.listAssessments({
          page,
          limit,
          search: search.trim() || undefined,
          cropId: selectedCropId || undefined,
          status: selectedStatus || undefined
        });
        setAssessments(res.items);
        setTotal(res.total);
      } catch (err) {
        console.warn('Failed to load history:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadAssessments();
  }, [page, limit, search, selectedCropId, selectedStatus]);

  const totalPages = Math.ceil(total / limit) || 1;

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--primary)' }}>Assessment History</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Complete audit trail of all AI visual assessments on your farm
          </p>
        </div>

        <Link to="/new-assessment" className="btn btn-emerald btn-sm">
          <PlusCircle size={16} /> New Assessment
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div
        className="card"
        style={{
          padding: '20px',
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search crop or condition..."
            style={{ paddingLeft: '38px', height: '42px', width: '100%', fontSize: '0.9rem' }}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Crop Filter */}
        <div style={{ flex: '1 1 180px' }}>
          <select
            className="form-select"
            style={{ height: '42px', width: '100%', fontSize: '0.9rem' }}
            value={selectedCropId}
            onChange={(e) => {
              setSelectedCropId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Crops ({crops.length})</option>
            {crops.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div style={{ flex: '1 1 180px' }}>
          <select
            className="form-select"
            style={{ height: '42px', width: '100%', fontSize: '0.9rem' }}
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="healthy">Healthy Crop</option>
            <option value="disease_detected">Disease Detected</option>
            <option value="low_confidence">Low Confidence</option>
            <option value="invalid_image">Unsuitable Image</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            Loading records...
          </div>
        ) : assessments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <FileText size={48} color="var(--text-subtle)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '6px' }}>
              No matching assessments
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Try adjusting your search criteria or create a new assessment.
            </p>
          </div>
        ) : (
          <div className="data-table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Crop</th>
                  <th>Condition</th>
                  <th>Confidence</th>
                  <th>Status</th>
                  <th>Source</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        {item.crop_name}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{item.condition}</span>
                    </td>
                    <td>
                      {item.confidence !== null && item.confidence !== undefined ? (
                        <ConfidenceBadge level={item.confidence_level} value={item.confidence} />
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td>
                      <span style={{ textTransform: 'capitalize', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {item.image_source}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <Calendar size={14} />
                        <span>{formatDate(item.created_at)}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/assessment/${item.id}`} className="btn btn-secondary btn-sm">
                        <Eye size={14} /> View Report
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {total > limit && (
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#fafcfb'
            }}
          >
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total} records
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, padding: '0 8px' }}>
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
