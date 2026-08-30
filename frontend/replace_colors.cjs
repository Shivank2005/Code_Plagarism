const fs = require('fs');
const path = require('path');

const directory = 'c:/Users/shiva/OneDrive/Desktop/Code_Plagarism/frontend/src';

const colorMap = {
    '#0d1117': 'var(--bg-primary)',
    '#010409': 'var(--bg-primary)',
    '#161b22': 'var(--bg-secondary)',
    '#30363d': 'var(--border-default)',
    '#e6edf3': 'var(--text-primary)',
    '#c9d1d9': 'var(--text-secondary)',
    '#8b949e': 'var(--text-tertiary)',
    '#58a6ff': 'var(--accent)',
    '#f85149': 'var(--danger)',
    '#d29922': 'var(--warning)',
    '#238636': 'var(--success)',
    '#22c55e': 'var(--success)',
    '#7ee787': 'var(--success)',
    '#484f58': 'var(--border-default)',
    '#6e7681': 'var(--text-tertiary)'
};

function walkDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            for (const [hex, cssVar] of Object.entries(colorMap)) {
                // Replace in tailwind classes e.g. text-[#0d1117] -> text-[var(--bg-primary)]
                const tailwindRegex = new RegExp(`\\[${hex}\\]`, 'gi');
                if (tailwindRegex.test(content)) {
                    content = content.replace(tailwindRegex, `[${cssVar}]`);
                    modified = true;
                }
                
                // Replace inline styles e.g. '#0d1117' -> 'var(--bg-primary)'
                const inlineRegex = new RegExp(`'${hex}'`, 'gi');
                if (inlineRegex.test(content)) {
                    content = content.replace(inlineRegex, `'${cssVar}'`);
                    modified = true;
                }
                
                const inlineRegexDouble = new RegExp(`"${hex}"`, 'gi');
                if (inlineRegexDouble.test(content)) {
                    content = content.replace(inlineRegexDouble, `"${cssVar}"`);
                    modified = true;
                }
            }

            if (modified) {
                fs.writeFileSync(fullPath, content);
                console.log(`Updated ${fullPath}`);
            }
        }
    });
}

walkDir(directory);
