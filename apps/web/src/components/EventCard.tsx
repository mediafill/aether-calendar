import type { Event } from '@aether/shared-types';

interface EventCardProps {
  event: Event;
}

function EventCard({ event }: EventCardProps) {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getImportanceClass = (importance?: string) => {
    switch (importance) {
      case 'urgent':
        return 'urgent';
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      case 'low':
        return 'low';
      default:
        return '';
    }
  };

  return (
    <div className={`event-card ${getImportanceClass(event.importance)}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>
            {event.title}
          </h3>
          
          <div style={{ 
            color: '#5f6368', 
            fontSize: '14px', 
            marginBottom: '8px' 
          }}>
            {formatTime(event.start)} - {formatTime(event.end)}
          </div>

          {event.description && (
            <p style={{ 
              margin: '0 0 8px 0', 
              color: '#5f6368', 
              fontSize: '14px',
              lineHeight: '1.4'
            }}>
              {event.description}
            </p>
          )}

          {event.location && (
            <div style={{ 
              color: '#5f6368', 
              fontSize: '14px', 
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              📍 {event.location}
            </div>
          )}

          {event.guests && event.guests.length > 0 && (
            <div style={{ 
              color: '#5f6368', 
              fontSize: '14px', 
              marginBottom: '8px' 
            }}>
              👥 {event.guests.join(', ')}
            </div>
          )}

          {event.tags && event.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {event.tags.map((tag, index) => (
                <span
                  key={index}
                  style={{
                    background: '#e8f0fe',
                    color: '#1a73e8',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {event.importance && (
          <div style={{
            fontSize: '12px',
            fontWeight: '600',
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: (() => {
              switch (event.importance) {
                case 'urgent': return '#fce8e6';
                case 'high': return '#fef7e0';
                case 'medium': return '#e6f4ea';
                case 'low': return '#f1f3f4';
                default: return '#f1f3f4';
              }
            })(),
            color: (() => {
              switch (event.importance) {
                case 'urgent': return '#d93025';
                case 'high': return '#f9ab00';
                case 'medium': return '#137333';
                case 'low': return '#5f6368';
                default: return '#5f6368';
              }
            })(),
          }}>
            {event.importance.toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}

export default EventCard;