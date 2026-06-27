import React from 'react';
import { 
  BsBoxArrowInRight, 
  BsBoxArrowRight, 
  BsArrowRepeat, 
  BsXLg, 
  BsShieldCheck,
  BsShieldX,
  BsLink45Deg,
  BsExclamationTriangleFill,
  BsInfoCircle
} from 'react-icons/bs';

export const EVENT_TYPE_LABELS = {
  login: 'Login',
  logout: 'Logout',
  phone_login: 'Phone Login',
  google_login: 'Google Login',
  session_restore: 'Session Restored',
  session_expiry: 'Session Expired',
  session_created: 'Session Created',
  session_terminated: 'Session Terminated',
  provider_linked: 'Provider Linked',
  provider_unlinked: 'Provider Unlinked',
  account_merge: 'Account Merged',
  trusted_device_added: 'Trusted Device Added',
  trusted_device_removed: 'Trusted Device Removed',
  security_alert: 'Security Alert'
};

export const getEventLabel = (type, page) => {
  if (page === 'activity') {
    switch (type) {
      case 'login': return 'Logged In';
      case 'logout': return 'Logged Out';
      case 'session_restore': return 'Session Restored';
      case 'session_expiry': return 'Session Expired';
      case 'session_extended': return 'Session Extended';
      default: return (type || '').replace(/_/g, ' ').toUpperCase();
    }
  }

  return EVENT_TYPE_LABELS[type] || type || 'Unknown Event';
};

export const getEventIcon = (type, page) => {
  if (page === 'activity') {
    switch (type) {
      case 'login': return React.createElement(BsBoxArrowInRight, { className: "text-emerald-500" });
      case 'logout': return React.createElement(BsBoxArrowRight, { className: "text-red-500" });
      case 'session_restore': return React.createElement(BsArrowRepeat, { className: "text-blue-500" });
      case 'session_expiry': return React.createElement(BsXLg, { className: "text-amber-500" });
      case 'session_extended': return React.createElement(BsShieldCheck, { className: "text-blue-400" });
      default: return React.createElement(BsArrowRepeat);
    }
  }

  switch (type) {
    case 'login':
    case 'phone_login':
    case 'google_login':
      return React.createElement(BsBoxArrowInRight, { className: "text-emerald-500" });
    case 'logout':
    case 'session_expiry':
      return React.createElement(BsBoxArrowRight, { className: "text-amber-500" });
    case 'session_restore':
      return React.createElement(BsArrowRepeat, { className: "text-blue-500" });
    case 'session_created':
      return React.createElement(BsShieldCheck, { className: "text-blue-400" });
    case 'session_terminated':
      return React.createElement(BsXLg, { className: "text-red-500" });
    case 'provider_linked':
      return React.createElement(BsShieldCheck, { className: "text-emerald-500" });
    case 'provider_unlinked':
      return React.createElement(BsShieldX, { className: "text-red-400" });
    case 'account_merge':
      return React.createElement(BsLink45Deg, { className: "text-purple-500" });
    case 'trusted_device_added':
      return React.createElement(BsShieldCheck, { className: "text-teal-400" });
    case 'trusted_device_removed':
      return React.createElement(BsShieldX, { className: "text-rose-500" });
    case 'security_alert':
      return React.createElement(BsExclamationTriangleFill, { className: "text-red-500 animate-pulse" });
    default:
      return React.createElement(BsInfoCircle, { className: "text-slate-400" });
  }
};

export const getRiskBadgeClass = (riskLevel) => {
  const RISK_BADGES = {
    LOW: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    MEDIUM: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    HIGH: 'bg-red-500/10 text-red-500 border-red-500/20'
  };
  return RISK_BADGES[riskLevel || 'LOW'] || RISK_BADGES.LOW;
};
