import { useCallback } from 'react';
import './Resizer.css';

const Resizer = ({ onResize, direction = 'horizontal' }) => {
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    
    let lastPos = direction === 'horizontal' ? e.clientX : e.clientY;
    
    const handleMouseMove = (moveEvent) => {
      const currentPos = direction === 'horizontal' ? moveEvent.clientX : moveEvent.clientY;
      const delta = currentPos - lastPos;
      lastPos = currentPos;
      onResize?.(delta);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    
    document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [direction, onResize]);

  return (
    <div
      className={`resizer ${direction}`}
      onMouseDown={handleMouseDown}
    >
      <div className="resizer-handle" />
    </div>
  );
};

export default Resizer;

