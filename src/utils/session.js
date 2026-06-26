export const getSessionFingerprint = () => {
  const ua = navigator.userAgent;
  
  // Advanced OS detection
  let os = "Unknown OS";
  let deviceName = "Generic Device";
  
  if (ua.indexOf("Win") !== -1) {
    os = "Windows";
    deviceName = "Windows PC";
  } else if (ua.indexOf("Mac") !== -1) {
    os = "macOS";
    deviceName = ua.indexOf("iPhone") !== -1 ? "iPhone" : ua.indexOf("iPad") !== -1 ? "iPad" : "MacBook Pro";
  } else if (ua.indexOf("Linux") !== -1) {
    os = "Linux";
    deviceName = "Linux PC";
  } else if (ua.indexOf("Android") !== -1) {
    os = "Android";
    deviceName = "Android Phone";
  } else if (ua.indexOf("like Mac") !== -1) {
    os = "iOS";
    deviceName = "Apple Device";
  }

  // Advanced Browser detection
  let browser = "Unknown Browser";
  if (ua.indexOf("Edg/") !== -1) browser = "Edge";
  else if (ua.indexOf("Chrome") !== -1) browser = "Chrome";
  else if (ua.indexOf("Safari") !== -1) browser = "Safari";
  else if (ua.indexOf("Firefox") !== -1) browser = "Firefox";

  // Device type
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|MS|Ge))))/i.test(ua.toLowerCase());
  const deviceType = isTablet ? "Tablet" : isMobile ? "Mobile" : "Desktop";

  // Create a stable fingerprint ID (excluding timestamps)
  const stableId = btoa(`${os}-${browser}-${deviceType}-${navigator.language}-${screen.width}x${screen.height}`).substring(0, 16);

  return {
    stableId,
    deviceName,
    deviceType,
    browserName: browser,
    operatingSystem: os,
    sessionName: `${deviceName} • ${browser}`,
    userAgent: ua.substring(0, 100) + "..."
  };
};

export const formatSessionAge = (timestamp) => {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  return `${minutes}m`;
};

export const normalizeSession = (session) => {
  if (!session) return null;
  const now = new Date().toISOString();
  
  const sessionId = session.sessionId || session.id || Math.random().toString(36).substring(2, 15);

  return {
    sessionId,
    stableId: session.stableId || "",
    deviceName: session.deviceName || "Unknown Device",
    deviceType: session.deviceType || "Desktop",
    browserName: session.browserName || "Unknown Browser",
    operatingSystem: session.operatingSystem || "Unknown OS",
    sessionName: session.sessionName || "Unknown Device",
    userAgent: session.userAgent || "",
    loginTimestamp: session.loginTimestamp || session.lastActivity || now,
    lastActivity: session.lastActivity || now
  };
};

