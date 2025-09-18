// scripts/check-minification.js
// Script pour vérifier spécifiquement les fichiers qui posent problème

import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { get } from 'https';

console.log('🔍 Vérification de la minification Next.js...\n');

// 1. Vérifier la configuration de build
function checkBuildConfig() {
  console.log('📋 Vérification de la configuration...');
  
  // Vérifier NODE_ENV
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'non défini'}`);
  
  // Vérifier next.config.ts
  const nextConfigPath = join(process.cwd(), 'next.config.ts');
  if (existsSync(nextConfigPath)) {
    const config = readFileSync(nextConfigPath, 'utf8');
    const hasSwcMinify = config.includes('swcMinify');
    const hasProductionSourceMaps = config.includes('productionBrowserSourceMaps: false');
    const hasCompress = config.includes('compress: true');
    
    console.log(`✅ next.config.ts trouvé`);
    console.log(`${hasSwcMinify ? '✅' : '❌'} swcMinify configuré`);
    console.log(`${hasProductionSourceMaps ? '✅' : '❌'} Source maps désactivées`);
    console.log(`${hasCompress ? '✅' : '❌'} Compression activée`);
  } else {
    console.log('❌ next.config.ts non trouvé');
  }
  console.log();
}

// 2. Vérifier les fichiers du build
function checkBuildFiles() {
  console.log('📁 Vérification des fichiers de build...');
  
  const nextDir = join(process.cwd(), '.next');
  const staticDir = join(nextDir, 'static', 'chunks');
  
  if (!existsSync(nextDir)) {
    console.log('❌ Dossier .next non trouvé. Lancez "npm run build" d\'abord');
    return;
  }
  
  if (!existsSync(staticDir)) {
    console.log('❌ Dossier .next/static/chunks non trouvé');
    return;
  }
  
  // Lister les fichiers JS
  const files = readdirSync(staticDir)
    .filter(f => f.endsWith('.js'))
    .map(f => {
      const filePath = join(staticDir, f);
      const stats = statSync(filePath);
      const content = readFileSync(filePath, 'utf8');
      
      // Analyse simple de minification
      const lines = content.split('\n').length;
      const avgLineLength = content.length / lines;
      const size = (stats.size / 1024).toFixed(2);
      
      return {
        name: f,
        size: `${size}KB`,
        lines,
        avgLineLength: avgLineLength.toFixed(1),
        minified: avgLineLength > 100 && lines < 50
      };
    })
    .sort((a, b) => parseFloat(b.size) - parseFloat(a.size));
  
  console.log('🔍 Top 10 des fichiers JS:');
  files.slice(0, 10).forEach(file => {
    const status = file.minified ? '✅' : '❌';
    console.log(`${status} ${file.name} - ${file.size} (${file.lines} lignes)`);
  });
  
  const unminified = files.filter(f => !f.minified && parseFloat(f.size) > 5);
  if (unminified.length > 0) {
    console.log('\n⚠️  FICHIERS PROBLÉMATIQUES (>5KB non-minifiés):');
    unminified.forEach(file => {
      console.log(`   ❌ ${file.name} - ${file.size}`);
    });
  }
  console.log();
}

// 3. Vérifier l'URL spécifique mentionnée
function checkSpecificURL() {
  console.log('🌐 Vérification de l\'URL spécifique...');
  
  const problematicFile = 'https://beautydiscountnext.vercel.app/_next/static/chunks/7508b87c-9dcb5816c35c4689.js';
  
  console.log('📥 Téléchargement du fichier problématique...');
  
  get(problematicFile, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      const lines = data.split('\n').length;
      const size = (data.length / 1024).toFixed(2);
      const avgLineLength = data.length / lines;
      
      console.log(`📊 Analyse du fichier distant:`);
      console.log(`   Taille: ${size}KB`);
      console.log(`   Lignes: ${lines}`);
      console.log(`   Longueur moyenne: ${avgLineLength.toFixed(1)} caractères/ligne`);
      
      const minified = avgLineLength > 100 && lines < 50;
      console.log(`   Status: ${minified ? '✅ Minifié' : '❌ NON minifié'}`);
      
      if (!minified) {
        console.log('\n🔧 SOLUTIONS:');
        console.log('1. Utilisez "npm run build:clean" au lieu de "npm run build"');
        console.log('2. Vérifiez que NODE_ENV=production');
        console.log('3. Mettez à jour next.config.ts avec les optimisations');
        console.log('4. Redéployez sur Vercel après les changements');
      }
    });
  }).on('error', (err) => {
    console.log(`❌ Erreur lors du téléchargement: ${err.message}`);
    console.log('ℹ️  Cela peut être normal si le fichier n\'existe plus après un nouveau build');
  });
}

// 4. Recommandations
function showRecommendations() {
  console.log('\n💡 PLAN D\'ACTION:');
  console.log('');
  console.log('1️⃣  Mise à jour de la configuration:');
  console.log('   - Copiez la nouvelle configuration next.config.ts');
  console.log('   - Installez les dépendances: npm install');
  console.log('');
  console.log('2️⃣  Build optimisé:');
  console.log('   - Lancez: npm run build:clean');
  console.log('   - Ou: NODE_ENV=production npm run build');
  console.log('');
  console.log('3️⃣  Vérification:');
  console.log('   - Lancez: npm run analyze:bundle');
  console.log('   - Vérifiez les fichiers dans .next/static/chunks/');
  console.log('');
  console.log('4️⃣  Déploiement:');
  console.log('   - Redéployez sur Vercel après les modifications');
  console.log('   - Vercel utilisera automatiquement NODE_ENV=production');
  console.log('');
}

// Exécution des vérifications
async function main() {
  checkBuildConfig();
  checkBuildFiles();
  
  // Vérification de l'URL seulement si demandé
  if (process.argv.includes('--check-url')) {
    checkSpecificURL();
    // Attendre un peu pour laisser le temps à la requête HTTP
    setTimeout(showRecommendations, 2000);
  } else {
    showRecommendations();
  }
}

main().catch(console.error);