export const getSessionFingerprint = () => {
  const ua = navigator.userAgent;
  
  // Basic OS detection
  let os = "Unknown OS";
  if (ua.indexOf("Win") !== -1) os = "Windows";
  if (ua.indexOf("Mac") !== -1) os = "macOS";
  if (ua.indexOf("Linux") !== -1) os = "Linux";
  if (ua.indexOf("Android") !== -1) os = "Android";
  if (ua.indexOf("like Mac") !== -1) os = "iOS";

  // Basic Browser detection
  let browser = "Unknown Browser";
  if (ua.indexOf("Chrome") !== -1) browser = "Chrome";
  else if (ua.indexOf("Safari") !== -1) browser = "Safari";
  else if (ua.indexOf("Firefox") !== -1) browser = "Firefox";
  else if (ua.indexOf("MSIE") !== -1 || !!document.documentMode === true) browser = "IE";

  // Basic Device type
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const deviceType = isMobile ? "Mobile" : "Desktop";

  return {
    sessionId: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    loginTimestamp: new Date().toISOString(),
    deviceType,
    browserName: browser,
    operatingSystem: os,
    userAgent: ua.substring(0, 100) + "..."
  };
};
