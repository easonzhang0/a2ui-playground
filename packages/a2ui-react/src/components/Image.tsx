import React from 'react';

export interface ImageProps {
  id?: string;
  className?: string;
  source: {
    uri: string;
  };
  alt?: string;
  width?: number | string;
  height?: number | string;
  hasMounted?: boolean;
  onMountComplete?: (componentId: string) => void;
}

export const Image: React.FC<ImageProps> = ({
  id,
  className,
  source,
  alt = '',
  width,
  height
}) => {
  return (
    <img
      id={id}
      className={className}
      src={source.uri}
      alt={alt}
      style={{
        width,
        height,
        objectFit: 'cover'
      }}
    />
  );
};
