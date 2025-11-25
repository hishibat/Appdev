document.addEventListener('DOMContentLoaded', () => {
  const uploadArea = document.getElementById('uploadArea');
  const fileInput = document.getElementById('fileInput');
  const previewContainer = document.getElementById('previewContainer');
  const previewImage = document.getElementById('previewImage');
  const removeBtn = document.getElementById('removeBtn');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const resultSection = document.getElementById('resultSection');
  const resultContent = document.getElementById('resultContent');
  const errorMessage = document.getElementById('errorMessage');

  let selectedFile = null;

  // Click to upload
  uploadArea.addEventListener('click', () => {
    fileInput.click();
  });

  // File input change
  fileInput.addEventListener('change', (e) => {
    handleFile(e.target.files[0]);
  });

  // Drag and drop events
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    handleFile(file);
  });

  // Handle file selection
  function handleFile(file) {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showError('対応していないファイル形式です。JPEG, PNG, GIF, WebP のみ対応しています。');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      showError('ファイルサイズが大きすぎます。10MB以下の画像をアップロードしてください。');
      return;
    }

    selectedFile = file;
    hideError();

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.src = e.target.result;
      uploadArea.style.display = 'none';
      previewContainer.style.display = 'block';
      analyzeBtn.disabled = false;
    };
    reader.readAsDataURL(file);
  }

  // Remove image
  removeBtn.addEventListener('click', () => {
    selectedFile = null;
    fileInput.value = '';
    previewContainer.style.display = 'none';
    uploadArea.style.display = 'block';
    analyzeBtn.disabled = true;
    resultSection.style.display = 'none';
    hideError();
  });

  // Analyze button click
  analyzeBtn.addEventListener('click', async () => {
    if (!selectedFile) return;

    setLoading(true);
    hideError();
    resultSection.style.display = 'none';

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Analysis failed');
      }

      // Parse and display result
      displayResult(data.analysis);
    } catch (error) {
      console.error('Error:', error);
      showError('分析中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  });

  // Display result with markdown parsing
  function displayResult(analysis) {
    // Simple markdown to HTML conversion
    let html = analysis
      // Headers
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Tables
      .replace(/\|(.+)\|/g, (match) => {
        const cells = match.split('|').filter(cell => cell.trim());
        if (cells.every(cell => cell.trim().match(/^-+$/))) {
          return ''; // Skip separator row
        }
        const isHeader = match.includes('食品名') || match.includes('推定量');
        const tag = isHeader ? 'th' : 'td';
        const cellsHtml = cells.map(cell => `<${tag}>${cell.trim()}</${tag}>`).join('');
        return `<tr>${cellsHtml}</tr>`;
      })
      // Wrap table rows
      .replace(/(<tr>.*<\/tr>\n?)+/g, '<table>$&</table>')
      // Lists
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
      // Wrap lists
      .replace(/(<li>.*<\/li>\n?)+/g, (match) => {
        if (match.includes('1.')) {
          return `<ol>${match}</ol>`;
        }
        return `<ul>${match}</ul>`;
      })
      // Paragraphs
      .replace(/\n\n/g, '</p><p>')
      // Line breaks
      .replace(/\n/g, '<br>');

    // Clean up extra tags
    html = html.replace(/<br><(h[23]|ul|ol|table|li)/g, '<$1');
    html = html.replace(/<\/(h[23]|ul|ol|table|li)><br>/g, '</$1>');
    html = html.replace(/<table><br>/g, '<table>');
    html = html.replace(/<br><\/table>/g, '</table>');

    resultContent.innerHTML = `<p>${html}</p>`;
    resultSection.style.display = 'block';

    // Scroll to results
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Set loading state
  function setLoading(loading) {
    analyzeBtn.disabled = loading;
    const btnText = analyzeBtn.querySelector('.btn-text');
    const btnLoading = analyzeBtn.querySelector('.btn-loading');

    if (loading) {
      btnText.style.display = 'none';
      btnLoading.style.display = 'inline';
    } else {
      btnText.style.display = 'inline';
      btnLoading.style.display = 'none';
      analyzeBtn.disabled = !selectedFile;
    }
  }

  // Show error message
  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
  }

  // Hide error message
  function hideError() {
    errorMessage.style.display = 'none';
  }
});
