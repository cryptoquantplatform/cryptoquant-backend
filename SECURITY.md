# 🔒 Security Features - CryptoQuant Platform

## Overview
This document outlines all security measures implemented to protect the platform against various attacks.

---

## 🛡️ Implemented Security Features

### 1. DDoS Protection

#### Global Rate Limiting
- **100 requests per minute** per IP address
- Protects against basic flooding attacks
- Health check endpoints are exempted

#### Authentication Rate Limiting
- **10 login attempts** per 15 minutes per IP
- Successful logins don't count against the limit
- Prevents brute force password attacks

#### Registration Rate Limiting
- **3 registrations** per hour per IP
- Prevents spam account creation
- Protects against automated bot registration

#### Password Reset Rate Limiting
- **5 password reset attempts** per hour per IP
- Prevents password reset abuse
- Protects user accounts from reset spam

#### Admin Panel Rate Limiting
- **100 requests** per 15 minutes per IP
- Extra protection for admin operations
- Prevents unauthorized access attempts

---

### 2. SQL Injection Protection

#### Input Sanitization
- All user inputs are automatically sanitized
- Removes dangerous SQL characters: `'`, `"`, `;`, `--`, `/*`, `*/`
- Removes SQL keywords: `exec`, `execute`, `xp_`
- Applied to: body, query parameters, URL parameters

#### Parameterized Queries
- All database queries use parameterized statements
- PostgreSQL prepared statements prevent injection
- Never concatenates user input into SQL strings

---

### 3. XSS (Cross-Site Scripting) Protection

#### Security Headers
- `X-XSS-Protection: 1; mode=block`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Content-Security-Policy: default-src 'self'`

#### Input Sanitization
- Removes `<script>` tags from all inputs
- Escapes HTML special characters
- Validates and cleans all user-submitted data

---

### 4. Request Size Limiting

#### Payload Protection
- Maximum request size: **1MB**
- Prevents memory exhaustion attacks
- Blocks large payload DoS attempts
- Connection destroyed if limit exceeded

---

### 5. CORS (Cross-Origin Resource Sharing)

#### Restricted Origins
- Only allowed origins can access the API
- Configured via `FRONTEND_URL` environment variable
- Allowed methods: GET, POST, PUT, DELETE
- Allowed headers: Content-Type, Authorization

---

### 6. IP Blocking (Optional)

#### Manual IP Blocking
- Admins can block specific IP addresses
- Blocked IPs receive 403 Forbidden
- Can be used for severe abuse cases
- Persistent across server restarts

---

### 7. Security Headers (Helmet.js)

#### Comprehensive Protection
- Hides `X-Powered-By` header
- DNS prefetch control
- Frameguard protection
- HSTS (HTTP Strict Transport Security)
- IE no open protection
- No sniff protection
- XSS filter

---

### 8. HTTPS Enforcement

#### Production Security
- All requests should use HTTPS in production
- HTTP requests should be redirected to HTTPS
- Configured at reverse proxy level (Render.com)

---

### 9. Input Validation

#### Email Validation
- Must be valid email format
- Maximum 255 characters
- Normalized to lowercase

#### Password Validation
- Minimum 8 characters
- Maximum 128 characters
- Must contain: uppercase, lowercase, and number

#### Name Validation
- 2-255 characters
- Only letters and spaces allowed

#### Crypto Address Validation
- 26-120 characters
- Alphanumeric characters only

#### Amount Validation
- Minimum: 0.00000001
- Maximum: 1,000,000
- Must be a valid float

---

## 🚨 Attack Prevention Summary

### Prevented Attacks:

✅ **DDoS Attacks** - Rate limiting on all endpoints  
✅ **Brute Force** - Limited login attempts with cooldown  
✅ **SQL Injection** - Input sanitization + parameterized queries  
✅ **XSS Attacks** - Security headers + input cleaning  
✅ **CSRF Attacks** - CORS restrictions  
✅ **Large Payload Attacks** - Request size limits  
✅ **Account Spam** - Registration rate limiting  
✅ **Password Reset Abuse** - Reset rate limiting  
✅ **Admin Panel Abuse** - Extra rate limiting + authentication  

---

## 📊 Rate Limits Overview

| Endpoint Type | Limit | Window | Notes |
|--------------|-------|--------|-------|
| Global API | 100 req | 1 min | All endpoints |
| Login | 10 attempts | 15 min | Brute force protection |
| Registration | 3 accounts | 1 hour | Spam prevention |
| Password Reset | 5 attempts | 1 hour | Abuse prevention |
| Admin Panel | 100 req | 15 min | Extra security |

---

## 🔐 Best Practices

### For Administrators:

1. **Use strong admin passwords** (12+ characters, mixed case, numbers, symbols)
2. **Monitor failed login attempts** in logs
3. **Review rate limit violations** regularly
4. **Use IP blocking** for persistent attackers
5. **Keep dependencies updated** (`npm audit` regularly)
6. **Use environment variables** for sensitive data
7. **Enable HTTPS** in production
8. **Regular security audits**

### For Users:

1. **Use unique, strong passwords**
2. **Enable 2FA** (if available)
3. **Don't share account credentials**
4. **Verify withdrawal addresses carefully**
5. **Report suspicious activity**

---

## 🛠️ Maintenance

### Regular Security Tasks:

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update

# Check for outdated packages
npm outdated
```

---

## 📝 Security Logs

### What to Monitor:

- Failed login attempts
- Rate limit violations
- Blocked IPs
- SQL injection attempts (sanitized inputs)
- Large payload attempts
- Admin panel access

### Log Locations:

- Application logs: Console output
- Error logs: `console.error`
- Security events: Logged with 🚫 emoji

---

## 🔄 Updates

### Version History:

- **v1.0.0** (2025-01-22): Initial security implementation
  - DDoS protection
  - SQL injection prevention
  - XSS protection
  - Rate limiting
  - Input validation

---

## 📞 Security Contact

If you discover a security vulnerability, please email:
- **Email:** security@cryptoquant.info
- **Response Time:** Within 24 hours

---

## ⚖️ License

This security implementation is part of the CryptoQuant platform.
© 2025 CryptoQuant. All rights reserved.

