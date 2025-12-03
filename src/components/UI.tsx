import React from 'react';

// 通用样式
const containerStyle: React.CSSProperties = {
  position: 'absolute',
  zIndex: 20,
  fontFamily: '"Times New Roman", serif',
  color: '#F7E7CE', // 香槟金字体
  textTransform: 'uppercase',
  letterSpacing: '2px',
};

interface UIProps {
  hasStarted: boolean;
  isTreeMode: boolean;
  onStart: () => void;
  onToggle: () => void;
}

export const UI: React.FC<UIProps> = ({ hasStarted, isTreeMode, onStart, onToggle }) => {
  // 1. 初始引导页 (保持宏大感，稍作调整)
  if (!hasStarted) {
    return (
      <div style={{
        ...containerStyle,
        inset: 0,
        background: 'radial-gradient(circle at center, rgba(0,20,5,0.4) 0%, rgba(0,5,2,0.95) 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '0.5rem', letterSpacing: '6px', textShadow: '0 0 20px rgba(212, 175, 55, 0.5)' }}>
          GRAND LUXURY
        </h1>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '3rem', opacity: 0.8, letterSpacing: '4px' }}>
          Interactive Holiday Experience
        </h2>
        <button
          onClick={onStart}
          style={{
            padding: '16px 48px',
            background: 'linear-gradient(45deg, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c)', // 金色渐变背景
            border: '1px solid #F7E7CE',
            color: '#001105', // 深色文字
            fontSize: '1.1rem', fontFamily: 'serif', cursor: 'pointer', fontWeight: 'bold',
            boxShadow: '0 0 40px rgba(212, 175, 55, 0.6)',
            textTransform: 'uppercase', letterSpacing: '2px',
            transition: 'all 0.5s ease'
          }}
        >
          Enter The Brilliance
        </button>
      </div>
    );
  }

  // 2. 主界面 UI (参考图风格：右下角)
  return (
    <div style={{
      ...containerStyle,
      bottom: '40px',
      right: '40px',
      textAlign: 'right',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      pointerEvents: 'none' // 让容器不挡鼠标，只让按钮挡
    }}>
      {/* 主标题 */}
      <div style={{ marginBottom: '20px', pointerEvents: 'auto' }}>
        <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#D4AF37', letterSpacing: '3px', textShadow: '0 0 10px rgba(212,175,55,0.3)' }}>
          ARIX SIGNATURE
        </h3>
        <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', opacity: 0.7 }}>
          EST. 2025 — THE GOLD STANDARD
        </p>
      </div>

      {/* 控制按钮容器 */}
      <div style={{ pointerEvents: 'auto' }}>
        <button
          onClick={onToggle}
          style={{
            // 参考图风格：深绿色背景 + 金色边框 + 辉光
            background: 'linear-gradient(to bottom, #00220a, #001105)',
            border: '2px solid #D4AF37',
            padding: '14px 36px',
            color: '#D4AF37',
            fontSize: '1rem',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            cursor: 'pointer',
            fontFamily: 'serif',
            fontWeight: 600,
            boxShadow: isTreeMode
              ? '0 0 25px rgba(212, 175, 55, 0.4), inset 0 0 10px rgba(212,175,55,0.2)'
              : '0 0 15px rgba(0, 51, 17, 0.4)',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', // 有弹性的过渡
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* 按钮文字 */}
          <span style={{ position: 'relative', zIndex: 2, textShadow: '0 0 5px rgba(212,175,55,0.5)' }}>
            {isTreeMode ? "Unleash Chaos" : "Assemble Shape"}
          </span>

          {/* 按钮 hover 时的扫光效果 (伪元素模拟) */}
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            background: 'linear-gradient(120deg, transparent, rgba(212,175,55,0.4), transparent)',
            transform: 'translateX(-100%)',
            transition: 'transform 0.6s',
            zIndex: 1
          }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(100%)'}
          />
        </button>
      </div>
    </div>
  );
};