// Node.js script to automate static case studies grid generation for case-studies.html
// Run this after updating case studies in the admin panel and generating HTML files

const fs = require('fs');
const path = require('path');

// Path to your admin case studies data (exported from localStorage or a JSON file)
const caseStudiesDataPath = path.join(__dirname, '../data/adminCaseStudies.json');
// Path to your main case-studies.html file
const caseStudiesHtmlPath = path.join(__dirname, '../case-studies.html');

// Read case studies data
const caseStudies = JSON.parse(fs.readFileSync(caseStudiesDataPath, 'utf-8'));

// Generate the HTML for the grid
function generateCaseStudiesGrid(studies) {
  return studies.filter(cs => cs.status === 'published').map(cs => `
    <div class="case-study-card" data-category="${String(cs.industry || cs.category || 'general').toLowerCase().replace(/\s+/g, '-')}">
      <img src="assets/images/${cs.image || 'placeholder.svg'}" alt="${cs.title}" class="case-study-image" loading="lazy">
      <div class="case-study-content">
        <p class="case-study-category">${cs.industry || cs.category || 'General'}</p>
        <h3 class="case-study-title">${cs.title}</h3>
        <p class="case-study-description">${cs.excerpt || cs.description}</p>
        <div class="case-study-results">
          <h4>Technologies:</h4>
          <ul>
            ${(cs.technologies || cs.tags || []).filter(tech => tech && tech.trim()).map(tech => `<li>${tech}</li>`).join('') || '<li>N/A</li>'}
          </ul>
        </div>
        <a href="case-studies/${cs.slug || 'details'}.html" class="case-study-link" style="color: #ffffff !important;">View Case Study</a>
      </div>
    </div>
  `).join('\n');
}

// Read the original HTML file
let html = fs.readFileSync(caseStudiesHtmlPath, 'utf-8');

// Replace the grid content between special comments (add these to your HTML for safe replacement)
const gridStart = '<!-- CASE_STUDY_GRID_START -->';
const gridEnd = '<!-- CASE_STUDY_GRID_END -->';
const gridHtml = generateCaseStudiesGrid(caseStudies);

const newHtml = html.replace(
  new RegExp(`${gridStart}[\s\S]*?${gridEnd}`),
  `${gridStart}\n${gridHtml}\n${gridEnd}`
);

fs.writeFileSync(caseStudiesHtmlPath, newHtml, 'utf-8');
console.log('✅ case-studies.html updated with latest case studies!');
