import React from 'react';

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    color: 'badge-gray'   },
  processing: { label: 'Processing', color: 'badge-blue'   },
  shipped:    { label: 'Shipped',    color: 'badge-orange' },
  delivered:  { label: 'Delivered', color: 'badge-green'  },
  cancelled:  { label: 'Cancelled', color: 'badge-red'    },
};

const OrderStatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return <span className={config.color}>{config.label}</span>;
};

export default OrderStatusBadge;
