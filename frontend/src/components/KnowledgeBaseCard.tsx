import React, { useState } from 'react';

interface KnowledgeBaseCardProps {
  id: string;
  title: string;
  creator: string;
  description: string;
  coverImage?: string;
  users: number;
  sources: number;
  rating: number;
  maxRating?: number;
  price?: number;
  isPurchased?: boolean;
  isOwned?: boolean;
  onTry?: (id: string) => void;
  onPurchase?: (id: string) => void;
  onShare?: (id: string) => void;
  onCompare?: (id: string) => void;
  className?: string;
}

const KnowledgeBaseCard: React.FC<KnowledgeBaseCardProps> = ({
  id,
  title,
  creator,
  description,
  coverImage,
  users,
  sources,
  rating,
  maxRating = 5,
  price,
  isPurchased = false,
  isOwned = false,
  onTry,
  onPurchase,
  onShare,
  onCompare,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const renderStars = (rating: number, maxRating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < maxRating; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} style={{ color: '#F59E0B' }}>★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} style={{ color: '#F59E0B' }}>☆</span>);
      } else {
        stars.push(<span key={i} style={{ color: '#6B7280' }}>☆</span>);
      }
    }
    
    return stars;
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div
      className={className}
      style={{
        backgroundColor: '#1E293B',
        border: '1px solid #334155',
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered 
          ? '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)' 
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        maxWidth: '320px',
        width: '100%'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Cover Image */}
      {coverImage && !imageError ? (
        <div style={{ position: 'relative', height: '160px', overflow: 'hidden' }}>
          <img
            src={coverImage}
            alt={`${title} cover`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)'
            }}
            onError={handleImageError}
          />
          {/* Overlay gradient */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)'
          }} />
          
          {/* Price badge */}
          {price && !isPurchased && !isOwned && (
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              backgroundColor: '#3B82F6',
              color: '#FFFFFF',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              ${price}
            </div>
          )}

          {/* Owned/Purchased badge */}
          {(isOwned || isPurchased) && (
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              backgroundColor: '#22C55E',
              color: '#FFFFFF',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {isOwned ? 'Owned' : 'Purchased'}
            </div>
          )}
        </div>
      ) : (
        // Fallback when no image or image error
        <div style={{
          height: '160px',
          backgroundColor: '#374151',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <div style={{ fontSize: '48px', color: '#6B7280' }}>📚</div>
          
          {/* Price badge */}
          {price && !isPurchased && !isOwned && (
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              backgroundColor: '#3B82F6',
              color: '#FFFFFF',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              ${price}
            </div>
          )}

          {/* Owned/Purchased badge */}
          {(isOwned || isPurchased) && (
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              backgroundColor: '#22C55E',
              color: '#FFFFFF',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {isOwned ? 'Owned' : 'Purchased'}
            </div>
          )}
        </div>
      )}

      {/* Card Content */}
      <div style={{ padding: '16px' }}>
        {/* Header */}
        <div style={{ marginBottom: '12px' }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#FFFFFF',
            marginBottom: '4px',
            lineHeight: '1.2'
          }}>
            {title}
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#9CA3AF',
            fontWeight: '500'
          }}>
            by {creator}
          </p>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '16px' }}>
          <p style={{
            fontSize: '14px',
            color: '#E5E7EB',
            lineHeight: '1.4',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {description}
          </p>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          padding: '8px 0',
          borderTop: '1px solid #334155',
          borderBottom: '1px solid #334155'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>👥</span>
            <span style={{ fontSize: '12px', color: '#E5E7EB', fontWeight: '500' }}>
              {formatNumber(users)}
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>📄</span>
            <span style={{ fontSize: '12px', color: '#E5E7EB', fontWeight: '500' }}>
              {formatNumber(sources)}
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ fontSize: '12px' }}>
              {renderStars(rating, maxRating)}
            </div>
            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
              ({rating.toFixed(1)})
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Primary Action */}
          <button
            onClick={() => onTry?.(id)}
            style={{
              backgroundColor: '#3B82F6',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              width: '100%'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#2563EB';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#3B82F6';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {isOwned || isPurchased ? 'Use Knowledge Base' : 'Try Knowledge Base'}
          </button>

          {/* Secondary Actions */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {!isOwned && !isPurchased && price && (
              <button
                onClick={() => onPurchase?.(id)}
                style={{
                  backgroundColor: '#22C55E',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  flex: 1
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#16A34A';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#22C55E';
                }}
              >
                Purchase
              </button>
            )}
            
            <button
              onClick={() => onShare?.(id)}
              style={{
                backgroundColor: '#374151',
                color: '#E5E7EB',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flex: 1
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#4B5563';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#374151';
              }}
            >
              Share
            </button>
            
            {onCompare && (
              <button
                onClick={() => onCompare(id)}
                style={{
                  backgroundColor: '#374151',
                  color: '#E5E7EB',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  flex: 1
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#4B5563';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#374151';
                }}
              >
                Compare
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseCard; 