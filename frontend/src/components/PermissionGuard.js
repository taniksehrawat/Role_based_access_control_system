import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { Tooltip } from '@mui/material';

const PermissionGuard = ({ 
  children, 
  permission, 
  fallback = null,
  showTooltip = true,
  tooltipMessage = "You don't have permission to perform this action"
}) => {
  const { can } = usePermissions();

  if (can(permission)) {
    return children;
  }

  if (fallback) {
    return fallback;
  }

  if (showTooltip) {
    return (
      <Tooltip title={tooltipMessage}>
        <span style={{ display: 'inline-block' }}>
          {React.cloneElement(children, {
            disabled: true,
            style: { ...children.props.style, opacity: 0.5, pointerEvents: 'none' }
          })}
        </span>
      </Tooltip>
    );
  }

  return null;
};

export default PermissionGuard;