const BASE_URL = process.env.REACT_APP_API_URL || 'https://website-audit-tool-production-f1db.up.railway.app';

export const auditWebsite = async (url) => {
  const response = await fetch(`${BASE_URL}/api/audit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Server error: ${response.status}`);
  }

  return data;
};