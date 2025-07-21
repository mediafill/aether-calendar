import React, { useState, useEffect } from 'react';
import type { Event } from '../types/shared';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: Partial<Event>) => void;
  onDelete?: (eventId: string) => void;
  event?: Event | null;
  selectedDate?: Date;
}

function EventModal({ isOpen, onClose, onSave, onDelete, event, selectedDate }: EventModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    start: '',
    end: '',
    importance: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    guests: [] as string[],
    tags: [] as string[]
  });

  const [guestInput, setGuestInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (event) {
        // Edit mode
        setFormData({
          title: event.title || '',
          description: event.description || '',
          location: event.location || '',
          start: new Date(event.start).toISOString().slice(0, 16),
          end: new Date(event.end).toISOString().slice(0, 16),
          importance: event.importance || 'medium',
          guests: event.guests || [],
          tags: event.tags || []
        });
      } else {
        // Create mode
        const now = new Date();
        const startTime = selectedDate || now;
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // +1 hour
        
        setFormData({
          title: '',
          description: '',
          location: '',
          start: startTime.toISOString().slice(0, 16),
          end: endTime.toISOString().slice(0, 16),
          importance: 'medium',
          guests: [],
          tags: []
        });
      }
      setErrors([]);
    }
  }, [isOpen, event, selectedDate]);

  const validateForm = () => {
    const newErrors: string[] = [];
    
    if (!formData.title.trim()) {
      newErrors.push('Title is required');
    }
    
    if (!formData.start) {
      newErrors.push('Start time is required');
    }
    
    if (!formData.end) {
      newErrors.push('End time is required');
    }
    
    if (formData.start && formData.end && new Date(formData.start) >= new Date(formData.end)) {
      newErrors.push('End time must be after start time');
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const eventData = {
      ...formData,
      start: new Date(formData.start).toISOString(),
      end: new Date(formData.end).toISOString(),
    };
    
    onSave(eventData);
    onClose();
  };

  const addGuest = () => {
    if (guestInput.trim() && !formData.guests.includes(guestInput.trim())) {
      setFormData(prev => ({
        ...prev,
        guests: [...prev.guests, guestInput.trim()]
      }));
      setGuestInput('');
    }
  };

  const removeGuest = (guest: string) => {
    setFormData(prev => ({
      ...prev,
      guests: prev.guests.filter(g => g !== guest)
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{event ? 'Edit Event' : 'Create New Event'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">×</button>
        </div>

        {errors.length > 0 && (
          <div className="error-message">
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group form-group-full">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter event title"
                  autoComplete="off"
                  autoFocus={!event}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="start">Start Time *</label>
                <input
                  type="datetime-local"
                  id="start"
                  value={formData.start}
                  onChange={(e) => setFormData(prev => ({ ...prev, start: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="end">End Time *</label>
                <input
                  type="datetime-local"
                  id="end"
                  value={formData.end}
                  onChange={(e) => setFormData(prev => ({ ...prev, end: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group form-group-full">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter event description"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter event location"
                />
              </div>

              <div className="form-group">
                <label htmlFor="importance">Priority</label>
                <select
                  id="importance"
                  value={formData.importance}
                  onChange={(e) => setFormData(prev => ({ ...prev, importance: e.target.value as any }))}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="form-group form-group-full">
                <label>Guests</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="email"
                    value={guestInput}
                    onChange={(e) => setGuestInput(e.target.value)}
                    placeholder="Enter email address"
                    style={{ flex: 1 }}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addGuest())}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={addGuest}
                    style={{ padding: '8px 16px' }}
                  >
                    Add
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {formData.guests.map(guest => (
                    <span
                      key={guest}
                      style={{
                        background: '#e3f2fd',
                        color: '#1565c0',
                        padding: '4px 8px',
                        borderRadius: '16px',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {guest}
                      <button
                        type="button"
                        onClick={() => removeGuest(guest)}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: '#1565c0', 
                          cursor: 'pointer',
                          fontSize: '16px',
                          lineHeight: 1
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group form-group-full">
                <label>Tags</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Enter tag"
                    style={{ flex: 1 }}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={addTag}
                    style={{ padding: '8px 16px' }}
                  >
                    Add
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        background: '#f3e5f5',
                        color: '#7b1fa2',
                        padding: '4px 8px',
                        borderRadius: '16px',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: '#7b1fa2', 
                          cursor: 'pointer',
                          fontSize: '16px',
                          lineHeight: 1
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <div className="modal-actions-left">
              {event && onDelete && (
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={() => onDelete(event.id)}
                >
                  Delete Event
                </button>
              )}
            </div>
            <div className="modal-actions-right">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {event ? 'Save Changes' : 'Create Event'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EventModal;