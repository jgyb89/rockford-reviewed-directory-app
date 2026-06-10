// src/components/events/EventCommentList.js
"use client";

import { useState } from 'react';
import PropTypes from 'prop-types';
import DOMPurify from 'isomorphic-dompurify';

export default function EventCommentList({ comments, noCommentsYet = "No comments yet. Be the first to start the discussion!" }) {
  const [visibleCount, setVisibleCount] = useState(5);
  const [expandedComments, setExpandedComments] = useState({});

  const nodes = comments?.nodes || [];

  if (!nodes || nodes.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "3rem 1rem", backgroundColor: "#fdfdfd", border: "1px dashed #eaeaea", borderRadius: "12px", color: "#666" }}>
        <p>{noCommentsYet}</p>
      </div>
    );
  }

  const handleShowMore = () => {
    setVisibleCount(prev => prev + 5);
  };

  const toggleExpand = (index) => {
    setExpandedComments(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const WORD_LIMIT = 200;

  const truncateContent = (content, index) => {
    const words = content.split(' ');
    if (words.length <= WORD_LIMIT || expandedComments[index]) {
      return content;
    }
    return words.slice(0, WORD_LIMIT).join(' ') + '...';
  };

  return (
    <section>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {nodes.slice(0, visibleCount).map((comment, index) => {
          const cleanContent = DOMPurify.sanitize(comment.content || '', {
            ALLOWED_TAGS: ['p', 'br', 'b', 'i', 'strong', 'em'],
            ALLOWED_ATTR: []
          });

          const isLongComment = (comment.content || '').split(' ').length > WORD_LIMIT;

          return (
            <article 
              key={comment.id || index} 
              style={{ 
                backgroundColor: '#ffffff', 
                padding: '1.5rem 2rem', 
                borderRadius: '12px', 
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)', 
                border: '1px solid #eaeaea', 
              }}
            >
              <header style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '1.2rem', fontWeight: 'bold', flexShrink: 0, overflow: 'hidden' }}>
                  {comment.author?.node?.avatar?.url ? (
                    <img src={comment.author.node.avatar.url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    comment.author?.node?.name ? comment.author.node.name.charAt(0).toUpperCase() : <span className="material-symbols-outlined">person</span>
                  )}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <span style={{ fontWeight: '600', fontSize: '1.05rem', color: '#111' }}>
                    {comment.author?.node?.name || "Anonymous"}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#666' }}>
                    {new Date(comment.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </span>
                </div>
              </header>

              <div 
                style={{ color: '#444', lineHeight: '1.6', fontSize: '1rem' }}
                dangerouslySetInnerHTML={{ __html: truncateContent(cleanContent, index) }} 
              />
              
              {isLongComment && (
                <button 
                  onClick={() => toggleExpand(index)}
                  style={{ background: 'none', border: 'none', color: '#e94f37', cursor: 'pointer', padding: 0, marginTop: '0.75rem', fontWeight: '600', fontSize: '0.9rem' }}
                >
                  {expandedComments[index] ? 'Read less' : 'Read more'}
                </button>
              )}
            </article>
          );
        })}
      </div>

      {visibleCount < nodes.length && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button 
            onClick={handleShowMore}
            style={{ background: '#f8f9fa', border: '1px solid #eaeaea', padding: '0.75rem 1.5rem', borderRadius: '100px', color: '#333', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.2s' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#eaeaea'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#f8f9fa'}
          >
            Load More Comments
          </button>
        </div>
      )}
    </section>
  );
}

EventCommentList.propTypes = {
  comments: PropTypes.shape({
    nodes: PropTypes.arrayOf(PropTypes.object),
  }),
  noCommentsYet: PropTypes.string,
};
