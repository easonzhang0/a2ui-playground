import React from 'react';
import type { DataModelUpdatePayload } from 'a2ui-core';

/** Client-side open URL; mirrors optional userAction.openLink for transport. */
export interface OpenLinkSpec {
  url: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
}

export interface ButtonAction {
  name: string;
  context?: Record<string, unknown>;
  localDataModelUpdate?: DataModelUpdatePayload;
  /** Open in the browser (new tab by default). Host injects handler via createRenderMap. */
  openLink?: OpenLinkSpec;
}

export interface ButtonProps {
  id?: string;
  className?: string;
  text?: {
    literalString?: string;
    path?: string;
  };
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  hasMounted?: boolean;
  onMountComplete?: (componentId: string) => void;
  action?: ButtonAction;
  /** Injected by createRenderMap when local action options are provided. */
  onLocalDataModelUpdate?: (payload: DataModelUpdatePayload) => void;
  /** Injected when createRenderMap provides openExternalLink. */
  onOpenLink?: (spec: OpenLinkSpec) => void;
}

export const Button: React.FC<ButtonProps> = ({
  id,
  className,
  text,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  action,
  onLocalDataModelUpdate,
  onOpenLink
}) => {
  const displayText = text?.literalString || text?.path || '';

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none'
    },
    secondary: {
      backgroundColor: '#6c757d',
      color: 'white',
      border: 'none'
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#007bff',
      border: '1px solid #007bff'
    },
    text: {
      backgroundColor: 'transparent',
      color: '#007bff',
      border: 'none'
    }
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    small: {
      padding: '4px 8px',
      fontSize: '0.875rem'
    },
    medium: {
      padding: '8px 16px',
      fontSize: '1rem'
    },
    large: {
      padding: '12px 24px',
      fontSize: '1.125rem'
    }
  };

  const handleClick = () => {
    if (disabled) return;
    if (action?.openLink?.url && onOpenLink) {
      onOpenLink({
        url: action.openLink.url,
        target: action.openLink.target
      });
    }
    if (action?.localDataModelUpdate && onLocalDataModelUpdate) {
      onLocalDataModelUpdate(action.localDataModelUpdate);
    }
  };

  return (
    <button
      id={id}
      className={className}
      type="button"
      disabled={disabled}
      onClick={handleClick}
      style={{
        ...variantStyles[variant],
        ...sizeStyles[size],
        borderRadius: '4px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1
      }}
    >
      {displayText}
    </button>
  );
};
