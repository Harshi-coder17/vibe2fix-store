/**
 * Application-Level Security Firewall & Scanner Blocker
 * 
 * Intercepts malicious reconnaissance probes, directory traversal attempts,
 * and null-byte injection before they reach application routing logic.
 */

const PROHIBITED_PATTERNS = [
  /\.\./,                             // Directory traversal (..)
  /%2e%2e/i,                         // Encoded traversal (%2e%2e)
  /\0/,                              // Null byte
  /%00/i,                            // Encoded null byte
  /\.(env|git|aws|config|ini|bak)($|\/|\?)/i, // Sensitive configuration file probes
  /(^|\/)(\.git|\.env|\.aws|\.svn|\.hg)($|\/)/i, // Version control or root config directories
  /(wp-admin|wp-login|xmlrpc|phpmyadmin|cgi-bin|actuator|\.well-known\/security)/i // Common vulnerability scanner targets
];

const securityFirewall = (req, res, next) => {
  let target = '';
  try {
    const rawUrl = (req.originalUrl || req.url || '').split(/[?#]/)[0];
    target = decodeURIComponent(rawUrl);
  } catch (err) {
    // Malformed URI encoding is itself an attack indicator
    return res.status(400).json({ message: 'Malformed request URL' });
  }

  for (const pattern of PROHIBITED_PATTERNS) {
    if (pattern.test(target)) {
      if (process.env.NODE_ENV !== 'test') {
        console.warn(`[FIREWALL BLOCKED] ${req.ip} -> Prohibited path attempt: ${target}`);
      }
      return res.status(403).json({
        message: 'Access denied by application security firewall',
      });
    }
  }

  next();
};

module.exports = securityFirewall;
