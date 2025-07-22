import { projectFiles, mockData } from './data_files.js';

document.addEventListener('DOMContentLoaded', () => {
    loadReadme();
    buildFileStructure();
    buildCodeBlocks('source-code-content', projectFiles, 'Source Code Files');
    buildCodeBlocks('mock-data-content', mockData, 'Mock Data');
    
    lucide.createIcons();
    setTimeout(() => hljs.highlightAll(), 0);
});

async function loadReadme() {
    try {
        const response = await fetch('README.md');
        if (!response.ok) throw new Error('Network response was not ok');
        const markdown = await response.text();
        document.getElementById('readme-content').innerHTML = marked.parse(markdown);
    } catch (error) {
        document.getElementById('readme-content').innerHTML = '<p class="text-red-400">Error loading README.md</p>';
        console.error('Error fetching README:', error);
    }
}

function buildFileStructure() {
    const container = document.getElementById('file-structure-content');
    const structure = {};

    Object.keys(projectFiles).forEach(path => {
        let currentLevel = structure;
        path.split('/').forEach((part, index, arr) => {
            if (!currentLevel[part]) {
                currentLevel[part] = (index === arr.length - 1) ? null : {};
            }
            currentLevel = currentLevel[part];
        });
    });

    const treeHtml = createTreeHtml(structure, 'offerspy');
    container.innerHTML = `<ul class="file-tree">${treeHtml}</ul>`;
    lucide.createIcons();
}

function createTreeHtml(node, name) {
    let html = `<li><i data-lucide="${Object.keys(node).length > 0 ? 'folder' : 'file-text'}" class="icon w-4 h-4 text-[#8B949E]"></i>${name}`;
    if (Object.keys(node).length > 0) {
        html += '<ul>';
        for (const key in node) {
            html += createTreeHtml(node[key], key);
        }
        html += '</ul>';
    }
    html += '</li>';
    return html;
}

function buildCodeBlocks(containerId, dataObject, title) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const files = Object.entries(dataObject);

    if (files.length === 0) {
        container.innerHTML = `<p>No ${title.toLowerCase()} found.</p>`;
        return;
    }
    
    container.innerHTML = files.map(([filePath, content]) => createCodeBlock(filePath, content)).join('');
    
    addCopyButtonListeners();
}

function getLanguage(filePath) {
    const extension = filePath.split('.').pop();
    switch (extension) {
        case 'js': return 'javascript';
        case 'py': return 'python';
        case 'html': return 'html';
        case 'css': return 'css';
        case 'json': return 'json';
        case 'md': return 'markdown';
        default: return 'plaintext';
    }
}

function createCodeBlock(filePath, content) {
    const language = getLanguage(filePath);
    return `
        <div class="code-container rounded-lg border border-[#30363D] bg-[#161B22]">
            <div class="flex justify-between items-center px-4 py-2 border-b border-[#30363D]">
                <div class="flex items-center gap-2">
                    <i data-lucide="file-text" class="text-[#8B949E] w-4 h-4"></i>
                    <span class="text-sm font-medium text-white font-mono">${filePath}</span>
                </div>
                <button class="copy-btn flex items-center gap-2 text-sm text-[#8B949E] hover:text-white transition-colors">
                    <i data-lucide="clipboard" class="w-4 h-4"></i>
                    <span class="copy-text">Copy</span>
                </button>
            </div>
            <div class="overflow-x-auto">
                <pre><code class="language-${language}">${escapeHtml(content.trim())}</code></pre>
            </div>
        </div>
    `;
}

function addCopyButtonListeners() {
    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const codeContainer = button.closest('.code-container');
            const codeElement = codeContainer.querySelector('code');
            const textToCopy = codeElement.innerText;

            navigator.clipboard.writeText(textToCopy).then(() => {
                const copyText = button.querySelector('.copy-text');
                const icon = button.querySelector('i');
                
                if (copyText) copyText.textContent = 'Copied!';
                icon.setAttribute('data-lucide', 'check-circle');
                lucide.createIcons();

                setTimeout(() => {
                    if (copyText) copyText.textContent = 'Copy';
                    icon.setAttribute('data-lucide', 'clipboard');
                    lucide.createIcons();
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        });
    });
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
