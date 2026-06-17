const els = {
  urlInput: document.getElementById('urlInput'),
  generatorForm: document.getElementById('generatorForm'),
  titleInput: document.getElementById('titleInput'),
  generateBtn: document.getElementById('generateBtn'),
  resetStyleBtn: document.getElementById('resetStyleBtn'),
  downloadBtn: document.getElementById('downloadBtn'),
  copyImageBtn: document.getElementById('copyImageBtn'),
  copyLinkBtn: document.getElementById('copyLinkBtn'),
  shareBtn: document.getElementById('shareBtn'),
  openTargetBtn: document.getElementById('openTargetBtn'),
  qrFrame: document.getElementById('qrFrame'),
  qrContainer: document.getElementById('qrContainer'),
  qrCaption: document.getElementById('qrCaption'),
  statusText: document.getElementById('statusText'),
  resultLink: document.getElementById('resultLink'),
  qrStateBadge: document.getElementById('qrStateBadge'),
  sizeRange: document.getElementById('sizeRange'),
  sizeValue: document.getElementById('sizeValue'),
  levelHint: document.getElementById('levelHint'),
  fgColor: document.getElementById('fgColor'),
  bgColor: document.getElementById('bgColor'),
  fgValue: document.getElementById('fgValue'),
  bgValue: document.getElementById('bgValue'),
  showLabel: document.getElementById('showLabel'),
  domainText: document.getElementById('domainText'),
  protocolText: document.getElementById('protocolText'),
  qrSizeMeta: document.getElementById('qrSizeMeta'),
  levelMeta: document.getElementById('levelMeta'),
  historyList: document.getElementById('historyList'),
  clearHistoryBtn: document.getElementById('clearHistoryBtn'),
  toast: document.getElementById('toast')
};

const STORAGE_KEYS = {
  settings: 'warmingQr.settings.v1',
  history: 'warmingQr.history.v1'
};

const DEFAULTS = {
  size: 320,
  fg: '#111827',
  bg: '#ffffff',
  level: 'H',
  showLabel: true
};

const LEVEL_META = {
  L: { label: '低' },
  M: { label: '中' },
  Q: { label: '较高' },
  H: { label: '高' }
};

let currentUrl = '';
let toastTimer = null;

function setStatus(message = '', type = '') {
  els.statusText.textContent = message;
  els.statusText.className = 'status-text';
  if (type) els.statusText.classList.add(type);
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add('show');
  toastTimer = window.setTimeout(() => {
    els.toast.classList.remove('show');
  }, 2400);
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

  if (!isValidHost(parsed.hostname)) {
    throw new Error('请输入完整且可访问的网址。');
  }

  return parsed.toString();
}

function isValidHost(hostname) {
  const host = hostname.replace(/^\[|\]$/g, '');
  const isLocalhost = host === 'localhost';
  const hasDot = host.includes('.');
  const isIpv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(host)
    && host.split('.').every((part) => Number(part) <= 255);
  const isIpv6 = host.includes(':');
  return isLocalhost || hasDot || isIpv4 || isIpv6;
}

function getSelectedLevel() {
  return document.querySelector('input[name="ecLevel"]:checked')?.value || DEFAULTS.level;
}

function getLevelValue(level) {
  return LEVEL_META[level]?.value ?? QRCode.CorrectLevel.H;
}

function getSettings() {
  return {
    size: Number(els.sizeRange.value),
    fg: els.fgColor.value,
    bg: els.bgColor.value,
    level: getSelectedLevel(),
    showLabel: els.showLabel.checked
  };
}

function setSettings(settings) {
  const next = { ...DEFAULTS, ...settings };
  els.sizeRange.value = String(next.size);
  els.fgColor.value = next.fg;
  els.bgColor.value = next.bg;
  els.showLabel.checked = Boolean(next.showLabel);
  const levelInput = document.querySelector(`input[name="ecLevel"][value="${next.level}"]`);
  if (levelInput) levelInput.checked = true;
  syncControls();
}

function syncControls() {
  const settings = getSettings();
  els.sizeValue.textContent = `${settings.size} px`;
  els.fgValue.textContent = settings.fg.toUpperCase();
  els.bgValue.textContent = settings.bg.toUpperCase();
  els.levelHint.textContent = LEVEL_META[settings.level]?.label || '高';
  els.qrContainer.style.setProperty('--preview-size', `${Math.min(settings.size, 360)}px`);
  els.qrContainer.style.setProperty('--qr-bg', settings.bg);
  saveSettings();
}

function resetPreview() {
  currentUrl = '';
  els.qrContainer.innerHTML = '';
  els.qrCaption.textContent = '';
  els.qrCaption.classList.remove('has-text');
  els.qrFrame.classList.remove('ready');
  els.qrFrame.classList.add('empty');
  els.qrStateBadge.textContent = '待生成';
  els.qrStateBadge.classList.remove('ready');
  setButtonsEnabled(false);
  els.resultLink.textContent = '暂未生成';
  els.resultLink.href = '#';
  els.resultLink.classList.add('muted');
  setMeta();
}

function setButtonsEnabled(enabled) {
  els.downloadBtn.disabled = !enabled;
  els.copyImageBtn.disabled = !enabled;
  els.copyLinkBtn.disabled = !enabled;
  els.shareBtn.disabled = !enabled;
  els.openTargetBtn.disabled = !enabled;
}

function setMeta(url = null, settings = null) {
  if (!url || !settings) {
    els.domainText.textContent = '-';
    els.protocolText.textContent = '-';
    els.qrSizeMeta.textContent = '-';
    els.levelMeta.textContent = '-';
    return;
  }

  const parsed = new URL(url);
  els.domainText.textContent = parsed.hostname;
  els.protocolText.textContent = parsed.protocol.replace(':', '').toUpperCase();
  els.qrSizeMeta.textContent = `${settings.size}px`;
  els.levelMeta.textContent = `${settings.level} ${LEVEL_META[settings.level]?.label || ''}`.trim();
}

function getCaption(url) {
  const title = els.titleInput.value.trim();
  if (title) return title;
  return new URL(url).hostname;
}

function renderQRCode(options = {}) {
  const { saveHistoryEntry = true } = options;

  try {
    if (typeof QRCode === 'undefined') {
      throw new Error('二维码生成库加载失败，请刷新页面后重试。');
    }

    const url = normalizeUrl(els.urlInput.value);
    const settings = getSettings();
    currentUrl = url;
    els.qrContainer.innerHTML = '';

    new QRCode(els.qrContainer, {
      text: url,
      width: settings.size,
      height: settings.size,
      colorDark: settings.fg,
      colorLight: settings.bg,
      correctLevel: getLevelValue(settings.level)
    });

    els.qrFrame.classList.remove('empty');
    els.qrFrame.classList.add('ready');
    els.qrStateBadge.textContent = '已生成';
    els.qrStateBadge.classList.add('ready');
    setButtonsEnabled(true);
    els.resultLink.textContent = url;
    els.resultLink.href = url;
    els.resultLink.classList.remove('muted');
    els.urlInput.value = url;
    setMeta(url, settings);
    updateCaption(url);
    setStatus('二维码已生成，可以扫码访问。', 'success');
    saveSettings();

    if (saveHistoryEntry) {
      addHistory({
        url,
        title: els.titleInput.value.trim(),
        createdAt: new Date().toISOString(),
        ...settings
      });
    }
  } catch (error) {
    resetPreview();
    setStatus(error.message || '生成失败，请检查输入后重试。', 'error');
  }
}

function updateCaption(url = currentUrl) {
  if (!url || !els.showLabel.checked) {
    els.qrCaption.textContent = '';
    els.qrCaption.classList.remove('has-text');
    return;
  }

  els.qrCaption.textContent = getCaption(url);
  els.qrCaption.classList.add('has-text');
}

function getQrCanvas() {
  return els.qrContainer.querySelector('canvas');
}

function buildExportCanvas() {
  const source = getQrCanvas();
  if (!source) throw new Error('请先生成二维码。');

  const settings = getSettings();
  const padding = Math.max(24, Math.round(settings.size * 0.08));
  const label = els.showLabel.checked ? getCaption(currentUrl) : '';
  const labelHeight = label ? 46 : 0;
  const canvas = document.createElement('canvas');
  const width = settings.size + padding * 2;
  const height = settings.size + padding * 2 + labelHeight;
  const ctx = canvas.getContext('2d');

  canvas.width = width;
  canvas.height = height;
  ctx.fillStyle = settings.bg;
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(source, padding, padding, settings.size, settings.size);

  if (label) {
    ctx.fillStyle = settings.fg;
    ctx.font = '700 18px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(truncateText(ctx, label, width - padding * 2), width / 2, height - labelHeight / 2);
  }

  return canvas;
}

function truncateText(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let next = text;
  while (next.length > 1 && ctx.measureText(next + '...').width > maxWidth) {
    next = next.slice(0, -1);
  }
  return next + '...';
}

function downloadQRCode() {
  try {
    const exportCanvas = buildExportCanvas();
    const link = document.createElement('a');
    link.download = `warming-qr-${safeFileName(currentUrl)}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
    showToast('PNG 已开始下载');
  } catch (error) {
    setStatus(error.message, 'error');
  }
}

async function copyImage() {
  try {
    const exportCanvas = buildExportCanvas();
    if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
      throw new Error('当前浏览器不支持复制图片，请使用下载 PNG。');
    }

    const blob = await new Promise((resolve) => exportCanvas.toBlob(resolve, 'image/png'));
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    showToast('二维码图片已复制');
  } catch (error) {
    setStatus(error.message, 'error');
  }
}

async function copyLink() {
  if (!currentUrl) return;
  try {
    await navigator.clipboard.writeText(currentUrl);
    showToast('链接已复制');
  } catch {
    fallbackCopyText(currentUrl);
    showToast('链接已复制');
  }
}

function fallbackCopyText(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
}

async function shareCurrent() {
  if (!currentUrl) return;
  const title = els.titleInput.value.trim() || 'Warming QR';
  if (navigator.share) {
    await navigator.share({ title, text: '分享一个二维码链接', url: currentUrl });
  } else {
    await copyLink();
  }
}

function openTarget() {
  if (currentUrl) {
    window.open(currentUrl, '_blank', 'noopener,noreferrer');
  }
}

function safeFileName(url) {
  try {
    return new URL(url).hostname.replace(/[^a-z0-9.-]/gi, '-').slice(0, 50) || 'link';
  } catch {
    return 'link';
  }
}

function saveSettings() {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(getSettings()));
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.settings);
    setSettings(raw ? JSON.parse(raw) : DEFAULTS);
  } catch {
    setSettings(DEFAULTS);
  }
}

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.history)) || [];
  } catch {
    return [];
  }
}

function addHistory(item) {
  const normalized = [item, ...getHistory().filter((historyItem) => historyItem.url !== item.url)].slice(0, 8);
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(normalized));
  renderHistory();
}

function clearHistory() {
  localStorage.removeItem(STORAGE_KEYS.history);
  renderHistory();
  showToast('最近记录已清空');
}

function renderHistory() {
  const history = getHistory();
  if (!history.length) {
    els.historyList.innerHTML = '<p class="history-empty">还没有生成记录。</p>';
    return;
  }

  els.historyList.innerHTML = history.map((item, index) => {
    const parsed = new URL(item.url);
    const title = escapeHtml(item.title || parsed.hostname);
    const url = escapeHtml(item.url);
    const date = new Date(item.createdAt).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
    return `
      <button class="history-item" type="button" data-history-index="${index}">
        <strong>${title}</strong>
        <span>${url}</span>
        <div class="history-footer">
          <span>${date} · ${item.size}px · ${item.level}</span>
          <i class="mini-swatch" style="--fg: ${item.fg}; --bgc: ${item.bg}" aria-hidden="true"></i>
        </div>
      </button>
    `;
  }).join('');
}

function useHistoryItem(index) {
  const item = getHistory()[index];
  if (!item) return;
  els.urlInput.value = item.url;
  els.titleInput.value = item.title || '';
  setSettings(item);
  renderQRCode({ saveHistoryEntry: false });
  showToast('已载入最近记录');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function bindEvents() {
  els.generatorForm.addEventListener('submit', (event) => {
    event.preventDefault();
    renderQRCode();
  });
  els.downloadBtn.addEventListener('click', downloadQRCode);
  els.copyImageBtn.addEventListener('click', copyImage);
  els.copyLinkBtn.addEventListener('click', copyLink);
  els.shareBtn.addEventListener('click', () => {
    shareCurrent().catch((error) => setStatus(error.message || '分享失败。', 'error'));
  });
  els.openTargetBtn.addEventListener('click', openTarget);
  els.clearHistoryBtn.addEventListener('click', clearHistory);
  els.resetStyleBtn.addEventListener('click', () => {
    setSettings(DEFAULTS);
    if (currentUrl) renderQRCode({ saveHistoryEntry: false });
    showToast('样式已恢复默认');
  });

  els.urlInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') renderQRCode();
  });
  els.urlInput.addEventListener('input', () => {
    if (els.statusText.classList.contains('error')) setStatus('');
    if (!els.urlInput.value.trim() && currentUrl) resetPreview();
  });
  els.titleInput.addEventListener('input', () => updateCaption());

  [els.sizeRange, els.fgColor, els.bgColor, els.showLabel].forEach((control) => {
    control.addEventListener('input', () => {
      syncControls();
      updateCaption();
      if (currentUrl) renderQRCode({ saveHistoryEntry: false });
    });
  });

  document.querySelectorAll('input[name="ecLevel"]').forEach((input) => {
    input.addEventListener('change', () => {
      syncControls();
      if (currentUrl) renderQRCode({ saveHistoryEntry: false });
    });
  });

  document.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      els.urlInput.value = chip.dataset.url || '';
      els.titleInput.value = chip.dataset.title || '';
      renderQRCode();
    });
  });

  document.querySelectorAll('.swatch').forEach((swatch) => {
    swatch.addEventListener('click', () => {
      els.fgColor.value = swatch.dataset.fg || DEFAULTS.fg;
      els.bgColor.value = swatch.dataset.bg || DEFAULTS.bg;
      syncControls();
      if (currentUrl) renderQRCode({ saveHistoryEntry: false });
    });
  });

  els.historyList.addEventListener('click', (event) => {
    const item = event.target.closest('[data-history-index]');
    if (!item) return;
    useHistoryItem(Number(item.dataset.historyIndex));
  });
}

loadSettings();
syncControls();
renderHistory();
bindEvents();
