const urlInput = document.getElementById('urlInput');
const generateBtn = document.getElementById('generateBtn');
const downloadBtn = document.getElementById('downloadBtn');
const qrFrame = document.getElementById('qrFrame');
const qrContainer = document.getElementById('qrContainer');
const statusText = document.getElementById('statusText');
const resultLink = document.getElementById('resultLink');
const chips = document.querySelectorAll('.chip');

function setStatus(message = '', type = '') {
  statusText.textContent = message;
  statusText.className = 'status-text';
  if (type) statusText.classList.add(type);
}

function normalizeUrl(rawValue) {
  const value = rawValue.trim();
  if (!value) {
    throw new Error('请输入网址后再生成二维码。');
  }

  let candidate = value;
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = 'https://' + candidate;
  }

  let parsed;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error('请输入合法的网址，例如 https://www.baidu.com');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('目前仅支持 http 或 https 链接。');
  }

  if (!parsed.hostname || !parsed.hostname.includes('.')) {
    throw new Error('请输入完整且可访问的网址。');
  }

  return parsed.toString();
}

function renderQRCode() {
  try {
    const url = normalizeUrl(urlInput.value);

    if (typeof QRCode === 'undefined') {
      throw new Error('二维码生成库加载失败，请刷新页面后重试。');
    }

    qrContainer.innerHTML = '';

    new QRCode(qrContainer, {
      text: url,
      width: 280,
      height: 280,
      colorDark: '#111827',
      colorLight: '#FFFFFF',
      correctLevel: QRCode.CorrectLevel.H
    });
    
    qrFrame.classList.remove('empty');
    qrFrame.classList.add('ready');
    downloadBtn.disabled = false;
    resultLink.textContent = url;
    resultLink.href = url;
    resultLink.classList.remove('muted');
    setStatus('二维码已生成，可以直接扫码访问。', 'success');
    urlInput.value = url;
  } catch (error) {
    qrContainer.innerHTML = '';
    qrFrame.classList.remove('ready');
    qrFrame.classList.add('empty');
    downloadBtn.disabled = true;
    resultLink.textContent = '暂未生成';
    resultLink.href = '#';
    resultLink.classList.add('muted');
    setStatus(error.message || '生成失败，请检查输入后重试。', 'error');
  }
}

function downloadQRCode() {
  if (downloadBtn.disabled) return;
  
  const canvas = qrFrame.querySelector('canvas');
  if (canvas) {
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
}

generateBtn.addEventListener('click', renderQRCode);
downloadBtn.addEventListener('click', downloadQRCode);
urlInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') renderQRCode();
});
urlInput.addEventListener('input', () => {
  if (statusText.classList.contains('error')) setStatus('');
});
chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    urlInput.value = chip.dataset.url || '';
    renderQRCode();
  });
});
