/**
 * Environment variables validation utility.
 * Asserts the presence of critical production environment variables and logs warnings
 * instead of throwing fatal errors, allowing ASTRIX to fallback to mock database
 * and local AI semantic responses gracefully.
 */
let hasValidated = false;

export function validateEnv() {
  if (hasValidated) {
    return {
      valid: !['MONGODB_URI', 'JWT_SECRET', 'GROQ_API_KEY'].some(key => !process.env[key]),
      missing: ['MONGODB_URI', 'JWT_SECRET', 'GROQ_API_KEY'].filter(key => !process.env[key])
    };
  }

  const required = ['MONGODB_URI', 'JWT_SECRET', 'GROQ_API_KEY'];
  const missing: string[] = [];

  for (const envVar of required) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  hasValidated = true;

  if (missing.length > 0) {
    console.warn('\n==================================================');
    console.warn('⚠️  ASTRIX PRODUCTION ENVIRONMENT WARNING');
    console.warn(`Missing critical environment variables: ${missing.join(', ')}`);
    console.warn('ASTRIX will fall back to local db.json and semantic local AI fallbacks.');
    console.warn('Ensure these variables are set in production (e.g., Vercel Dashboard).');
    console.warn('==================================================\n');
  } else {
    console.log('✅ ASTRIX Environment Validation: All required keys (MONGODB_URI, JWT_SECRET, GROQ_API_KEY) are configured.');
  }

  return {
    valid: missing.length === 0,
    missing
  };
}
