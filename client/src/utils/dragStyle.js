import { CSS } from '@dnd-kit/utilities';

export function getDragStyle(transform, transition, isDragging) {
  return {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 'auto',
    boxShadow: isDragging ? '0 4px 15px rgba(0,0,0,0.2)' : '',
  };
}
