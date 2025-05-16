document.addEventListener('DOMContentLoaded', () => {
    // Initialize elements
    const generateBtn = document.getElementById('generateBtn');
    const inputText = document.getElementById('inputText');
    const md5Result = document.getElementById('md5Result');
    const sha256Result = document.getElementById('sha256Result');
    const themeToggle = document.getElementById('themeToggle');
    const clearBtn = document.getElementById('clearBtn');
    const pasteBtn = document.getElementById('pasteBtn');
    const charCount = document.getElementById('charCount');
    const hashHistory = document.getElementById('hashHistory');
    const toast = document.getElementById('toast');

    // Load theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    // Theme toggle
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    // Character count
    inputText.addEventListener('input', () => {
        const count = inputText.value.length;
        charCount.textContent = `${count} character${count !== 1 ? 's' : ''}`;
    });

    // Clear button
    clearBtn.addEventListener('click', () => {
        inputText.value = '';
        md5Result.textContent = '';
        sha256Result.textContent = '';
        charCount.textContent = '0 characters';
        showToast('Input cleared');
    });

    // Paste button
    pasteBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            inputText.value = text;
            charCount.textContent = `${text.length} character${text.length !== 1 ? 's' : ''}`;
            showToast('Text pasted from clipboard');
        } catch (err) {
            showToast('Failed to paste from clipboard', true);
        }
    });

    // Generate hashes
    generateBtn.addEventListener('click', () => {
        const text = inputText.value.trim();
        
        if (!text) {
            showToast('Please enter some text to generate hashes', true);
            return;
        }

        // Generate MD5 hash
        const md5Hash = CryptoJS.MD5(text).toString();
        md5Result.textContent = md5Hash;

        // Generate SHA256 hash
        const sha256Hash = CryptoJS.SHA256(text).toString();
        sha256Result.textContent = sha256Hash;

        // Add to history
        addToHistory(text, md5Hash, sha256Hash);
        showToast('Hashes generated successfully');
    });

    // Load history
    loadHistory();
});

function updateThemeIcon(theme) {
    const icon = document.querySelector('#themeToggle i');
    icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.backgroundColor = isError ? '#f44336' : '#4CAF50';
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    const text = element.textContent;

    if (!text) {
        showToast('No hash to copy!', true);
        return;
    }

    navigator.clipboard.writeText(text).then(() => {
        showToast('Hash copied to clipboard');
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        showToast('Failed to copy to clipboard', true);
    });
}

function verifyHash(type) {
    const inputText = document.getElementById('inputText').value.trim();
    const hashElement = document.getElementById(`${type}Result`);
    const hash = hashElement.textContent;

    if (!inputText || !hash) {
        showToast('No text or hash to verify', true);
        return;
    }

    const generatedHash = type === 'md5' 
        ? CryptoJS.MD5(inputText).toString()
        : CryptoJS.SHA256(inputText).toString();

    if (generatedHash === hash) {
        showToast('Hash verification successful');
    } else {
        showToast('Hash verification failed', true);
    }
}

function addToHistory(text, md5Hash, sha256Hash) {
    const history = JSON.parse(localStorage.getItem('hashHistory') || '[]');
    const newEntry = {
        text,
        md5Hash,
        sha256Hash,
        timestamp: new Date().toISOString()
    };

    // Keep only last 10 entries
    history.unshift(newEntry);
    if (history.length > 10) {
        history.pop();
    }

    localStorage.setItem('hashHistory', JSON.stringify(history));
    loadHistory();
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem('hashHistory') || '[]');
    const historyContainer = document.getElementById('hashHistory');
    
    if (history.length === 0) {
        historyContainer.innerHTML = '<p class="empty-history">No recent hashes</p>';
        return;
    }

    historyContainer.innerHTML = history.map(entry => `
        <div class="history-item">
            <div class="history-text">${truncateText(entry.text, 50)}</div>
            <div class="history-hashes">
                <div class="history-hash">
                    <strong>MD5:</strong> ${truncateText(entry.md5Hash, 20)}
                </div>
                <div class="history-hash">
                    <strong>SHA256:</strong> ${truncateText(entry.sha256Hash, 20)}
                </div>
            </div>
            <div class="history-timestamp">${formatDate(entry.timestamp)}</div>
        </div>
    `).join('');
}

function truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
} 