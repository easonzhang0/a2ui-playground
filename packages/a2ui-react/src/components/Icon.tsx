import React from 'react';

export interface IconProps {
  id?: string;
  className?: string;
  name: string;
  size?: number;
  color?: string;
  hasMounted?: boolean;
  onMountComplete?: (componentId: string) => void;
}

export const Icon: React.FC<IconProps> = ({
  id,
  className,
  name,
  size = 24,
  color = '#000'
}) => {
  // 这里使用简单的文字作为图标，实际项目中可以使用图标库
  return (
    <div
      id={id}
      className={className}
      style={{
        fontSize: `${size}px`,
        color,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {name}
    </div>
  );
};
