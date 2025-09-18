// pagespeed-diagnostic.js
// Script pour identifier tous les problèmes PageSpeed potentiels

import { existsSync, readdirSync, statSync, readFileSync } from 'fs';
import { join, extname } from 'path';

console.log('🔍 DIAGNOSTIC PAGESPEED COMPLET - BeautyDiscount\n');

// 1. Analyser les images dans public/
function analyzeImages() {
  console.log('📸 ANALYSE DES IMAGES:');
  console.log('='.repeat(50));
  
  const publicDir = join(process.cwd(), 'public');
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.avif'];
  
  if (!existsSync(publicDir)) {
    console.log('❌ Dossier public/ non trouvé');
    return;
  }
  
  function scanImages(dir, prefix = '') {
    const items = readdirSync(dir);
    const images = [];
    
    items.forEach(item => {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        const subImages = scanImages(fullPath, `${prefix}${item}/`);
        images.push(...subImages);
      } else {
        const ext = extname(item).toLowerCase();
        if (imageExtensions.includes(ext)) {
          const sizeKB = (stat.size / 1024).toFixed(2);
          const relativePath = `${prefix}${item}`;
          
          images.push({
            name: item,
            path: relativePath,
            size: parseFloat(sizeKB),
            ext: ext
          });
        }
      }
    });
    
    return images;
  }
  
  const allImages = scanImages(publicDir);
  
  if (allImages.length === 0) {
    console.log('ℹ️  Aucune image trouvée dans public/');
    return;
  }
  
  // Trier par taille décroissante
  allImages.sort((a, b) => b.size - a.size);
  
  console.log(`📁 Total images trouvées: ${allImages.length}`);
  
  // Statistiques par format
  const formatStats = {};
  allImages.forEach(img => {
    formatStats[img.ext] = (formatStats[img.ext] || 0) + 1;
  });
  
  console.log('\n📊 RÉPARTITION PAR FORMAT:');
  Object.entries(formatStats).forEach(([ext, count]) => {
    const hasModernFormat = ['.webp', '.avif'].includes(ext);
    console.log(`${hasModernFormat ? '✅' : '⚠️ '} ${ext}: ${count} images`);
  });
  
  // Images les plus lourdes
  const heavyImages = allImages.filter(img => img.size > 100);
  if (heavyImages.length > 0) {
    console.log('\n🚨 IMAGES LOURDES (>100KB):');
    heavyImages.slice(0, 10).forEach(img => {
      console.log(`   ${img.size}KB - ${img.path}`);
    });
    
    console.log('\n🔧 RECOMMANDATIONS IMAGES:');
    console.log('   1. Compresser les images lourdes avec TinyPNG/Squoosh');
    console.log('   2. Convertir en WebP/AVIF pour ~30-50% de réduction');
    console.log('   3. Redimensionner selon les besoins réels');
    console.log('   4. Implémenter lazy loading');
  }
  
  // Formats obsolètes
  const oldFormats = allImages.filter(img => ['.png', '.jpg', '.jpeg'].includes(img.ext));
  if (oldFormats.length > 0) {
    console.log(`\n💡 ${oldFormats.length} images pourraient être converties en WebP`);
    console.log('   Économie potentielle: ~30-50% de taille');
  }
}

// 2. Analyser les fichiers CSS
function analyzeCSS() {
  console.log('\n🎨 ANALYSE DES FICHIERS CSS:');
  console.log('='.repeat(50));
  
  const nextDir = join(process.cwd(), '.next', 'static', 'css');
  
  if (!existsSync(nextDir)) {
    console.log('ℹ️  Aucun fichier CSS généré (normal avec Tailwind inline)');
    return;
  }
  
  const cssFiles = readdirSync(nextDir)
    .filter(f => f.endsWith('.css'))
    .map(f => {
      const filePath = join(nextDir, f);
      const content = readFileSync(filePath, 'utf8');
      const sizeKB = (content.length / 1024).toFixed(2);
      
      return { name: f, size: parseFloat(sizeKB), content };
    })
    .sort((a, b) => b.size - a.size);
  
  if (cssFiles.length === 0) {
    console.log('✅ CSS intégré dans JS (optimisation Tailwind)');
    return;
  }
  
  cssFiles.forEach(file => {
    console.log(`📄 ${file.name}: ${file.size}KB`);
    
    if (file.size > 100) {
      console.log('   ⚠️  Fichier CSS volumineux');
    }
  });
}

// 3. Analyser les fonts
function analyzeFonts() {
  console.log('\n🔤 ANALYSE DES FONTS:');
  console.log('='.repeat(50));
  
  // Vérifier les imports Google Fonts dans le code
  const appDir = join(process.cwd(), 'src', 'app');
  
  if (existsSync(appDir)) {
    const layoutPath = join(appDir, 'layout.tsx');
    if (existsSync(layoutPath)) {
      const content = readFileSync(layoutPath, 'utf8');
      
      if (content.includes('fonts.googleapis.com')) {
        console.log('⚠️  Google Fonts détectées - peuvent ralentir LCP');
        console.log('💡 Recommandation: Précharger avec <link rel="preload">');
      } else if (content.includes('next/font')) {
        console.log('✅ Next.js fonts utilisées (optimisées)');
      } else {
        console.log('ℹ️  Aucun système de fonts spécifique détecté');
      }
    }
  }
  
  // Vérifier les fichiers de fonts
  const publicDir = join(process.cwd(), 'public');
  const fontExtensions = ['.woff', '.woff2', '.ttf', '.otf'];
  
  if (existsSync(publicDir)) {
    function findFonts(dir) {
      const items = readdirSync(dir);
      const fonts = [];
      
      items.forEach(item => {
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          fonts.push(...findFonts(fullPath));
        } else {
          const ext = extname(item).toLowerCase();
          if (fontExtensions.includes(ext)) {
            const sizeKB = (stat.size / 1024).toFixed(2);
            fonts.push({ name: item, size: parseFloat(sizeKB), ext });
          }
        }
      });
      
      return fonts;
    }
    
    const fonts = findFonts(publicDir);
    
    if (fonts.length > 0) {
      console.log(`📁 ${fonts.length} fichiers de fonts trouvés:`);
      fonts.forEach(font => {
        const isOptimal = font.ext === '.woff2';
        console.log(`${isOptimal ? '✅' : '⚠️ '} ${font.name} (${font.size}KB)`);
      });
      
      const oldFormats = fonts.filter(f => ['.ttf', '.otf'].includes(f.ext));
      if (oldFormats.length > 0) {
        console.log('💡 Convertir TTF/OTF en WOFF2 pour ~30% de réduction');
      }
    } else {
      console.log('ℹ️  Aucun fichier de font local');
    }
  }
}

// 4. Analyser la configuration Next.js pour PageSpeed
function analyzeNextConfig() {
  console.log('\n⚙️  CONFIGURATION NEXT.JS POUR PAGESPEED:');
  console.log('='.repeat(50));
  
  const configPath = join(process.cwd(), 'next.config.ts');
  
  if (!existsSync(configPath)) {
    console.log('❌ next.config.ts non trouvé');
    return;
  }
  
  const config = readFileSync(configPath, 'utf8');
  
  const checks = [
    {
      name: 'Images optimisées',
      check: config.includes('formats: ['),
      impact: 'ÉLEVÉ'
    },
    {
      name: 'Compression activée',
      check: config.includes('compress: true'),
      impact: 'MOYEN'
    },
    {
      name: 'Source maps désactivées',
      check: config.includes('productionBrowserSourceMaps: false'),
      impact: 'FAIBLE'
    },
    {
      name: 'Headers de cache',
      check: config.includes('Cache-Control'),
      impact: 'ÉLEVÉ'
    },
    {
      name: 'Console.log supprimés',
      check: config.includes('removeConsole'),
      impact: 'FAIBLE'
    }
  ];
  
  checks.forEach(check => {
    const status = check.check ? '✅' : '❌';
    console.log(`${status} ${check.name} (Impact: ${check.impact})`);
  });
}

// 5. Recommandations prioritaires
function generateRecommendations() {
  console.log('\n🎯 RECOMMANDATIONS PRIORITAIRES:');
  console.log('='.repeat(50));
  
  console.log('1️⃣  IMPACT ÉLEVÉ (gain potentiel: 20-40 points):');
  console.log('   📸 Optimiser/compresser les images lourdes');
  console.log('   🖼️  Convertir images en WebP/AVIF');
  console.log('   ⚡ Implémenter lazy loading des images');
  console.log('   📦 Configurer un CDN (Vercel CDN automatique)');
  
  console.log('\n2️⃣  IMPACT MOYEN (gain potentiel: 10-20 points):');
  console.log('   🔤 Précharger les fonts critiques');
  console.log('   🎨 Inline critical CSS');
  console.log('   📱 Optimiser pour mobile-first');
  console.log('   🗜️  Activer la compression Brotli');
  
  console.log('\n3️⃣  IMPACT FAIBLE (gain potentiel: 5-10 points):');
  console.log('   🧹 Supprimer CSS/JS inutilisé');
  console.log('   📊 Réduire Third-party scripts');
  console.log('   🔧 Minifier HTML inline');
  
  console.log('\n🚀 PLAN D\'ACTION RECOMMANDÉ:');
  console.log('   Phase 1: Images (plus gros impact)');
  console.log('   Phase 2: Fonts et CSS critique');
  console.log('   Phase 3: Optimisations avancées');
  
  console.log('\n💡 OUTILS RECOMMANDÉS:');
  console.log('   • Squoosh.app - Compression images');
  console.log('   • next-optimized-images - Plugin Next.js');
  console.log('   • @next/bundle-analyzer - Analyse bundles');
  console.log('   • web.dev/measure - Test PageSpeed alternatif');
}

// 6. Test rapide de votre URL
function suggestTesting() {
  console.log('\n🧪 TESTS À EFFECTUER:');
  console.log('='.repeat(50));
  
  console.log('1. PageSpeed Insights officiel:');
  console.log('   https://pagespeed.web.dev/?url=https://beautydiscountnext.vercel.app');
  
  console.log('\n2. Tests alternatifs (pour comparaison):');
  console.log('   • GTmetrix: https://gtmetrix.com');
  console.log('   • WebPageTest: https://webpagetest.org');
  console.log('   • Pingdom: https://tools.pingdom.com');
  
  console.log('\n3. Métriques à surveiller:');
  console.log('   📊 LCP: < 2.5s (critique pour le score)');
  console.log('   ⚡ INP: < 200ms (réactivité)');
  console.log('   📐 CLS: < 0.1 (stabilité visuelle)');
  console.log('   🔄 FCP: < 1.8s (premier contenu)');
}

// Exécution du diagnostic
async function runDiagnostic() {
  analyzeImages();
  analyzeCSS();
  analyzeFonts();
  analyzeNextConfig();
  generateRecommendations();
  suggestTesting();
  
  console.log('\n📊 RÉSUMÉ:');
  console.log('Vos fichiers JS sont bien minifiés, mais PageSpeed Insights');
  console.log('évalue beaucoup d\'autres facteurs. Les images sont souvent');
  console.log('le facteur #1 d\'impact sur le score.');
}

runDiagnostic();