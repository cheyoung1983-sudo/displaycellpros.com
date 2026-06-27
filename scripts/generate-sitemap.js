import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const routes = [
  { path: '', priority: 1.0, freq: 'daily' },
  { path: '?tab=services', priority: 0.8, freq: 'weekly' },
  { path: '?tab=b2b', priority: 0.7, freq: 'monthly' },
  { path: '?tab=csp', priority: 0.7, freq: 'monthly' },
  { path: '?tab=legal', priority: 0.9, freq: 'monthly' }, // Spokane WA Compliance & Legal target
  { path: '?tab=store', priority: 0.8, freq: 'weekly' },
  { path: '?tab=lab', priority: 0.8, freq: 'weekly' },
  { path: '?tab=customer-hub', priority: 0.6, freq: 'monthly' }
];

const generateSitemap = () => {
  const baseUrl = 'https://displaycellpros.com/';
  const today = new Date().toISOString().split('T')[0];

  // Note: the original '?' needs to remain '?' for the search param, unless escaping inside XML
  // Since '?tab=legal' is valid URL encoding standard, we can use it directly, but strictly speaking 
  // ampersands should be escaped if there are multiple parameters.
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(route => `  <url>
    <loc>${baseUrl}${route.path.replace('&', '&amp;')}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.freq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  const publicDir = path.resolve(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml);
  console.log(`[SEO] Sitemap successfully generated at /public/sitemap.xml for Spokane WA target targeting ${routes.length} core and compliance routes.`);
};

generateSitemap();
