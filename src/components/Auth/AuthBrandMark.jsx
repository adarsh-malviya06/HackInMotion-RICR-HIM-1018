import React from 'react';

export const AuthBrandMark = () => (
  <div
    aria-label="Finova Intelligent Fintech"
    style={{
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: '14px',
      lineHeight: 1
    }}
  >
    <span
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: '2.65rem',
        fontWeight: 800,
        color: '#0c172c',
        letterSpacing: 0,
        lineHeight: 0.88
      }}
    >
      Finova
    </span>
    <span
      style={{
        marginTop: '9px',
        fontSize: '0.95rem',
        fontWeight: 600,
        color: '#43506a',
        letterSpacing: 0,
        lineHeight: 1.1
      }}
    >
      Intelligent Fintech
    </span>
  </div>
);
