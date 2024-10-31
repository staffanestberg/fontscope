let popup = null;
let lastClickedElement = null;

function initializePopup() {
  if (!popup) {
    popup = document.createElement('div');
    popup.className = 'fontscope-popup';
    document.body.appendChild(popup);
  }
}

function getComputedFontDetails(element) {
  const computed = window.getComputedStyle(element);
  return {
    family: computed.fontFamily.split(',')[0].replace(/['"]/g, ''),
    size: computed.fontSize,
    weight: computed.fontWeight,
    style: computed.fontStyle,
    height: computed.lineHeight,
    letterSpacing: computed.letterSpacing,
    color: computed.color
  };
}

function copyToClipboard(value) {
  navigator.clipboard.writeText(value).then(() => {
    showCopyFeedback();
  });
}

function showCopyFeedback() {
  const feedback = document.createElement('div');
  feedback.className = 'fontscope-copied';
  feedback.textContent = 'Copied!';
  document.body.appendChild(feedback);
  
  const popupRect = popup.getBoundingClientRect();
  feedback.style.left = `${popupRect.left + popupRect.width/2 - 40}px`;
  feedback.style.top = `${popupRect.top - 40}px`;
  
  setTimeout(() => feedback.remove(), 1500);
}

function createPropertyElement(label, value, type = 'text') {
  const div = document.createElement('div');
  div.className = 'fontscope-property';
  
  const labelSpan = document.createElement('span');
  labelSpan.className = 'fontscope-property-label';
  labelSpan.textContent = label;
  
  const valueSpan = document.createElement('span');
  valueSpan.className = 'fontscope-property-value';
  
  if (type === 'color') {
    div.className += ' fontscope-color-property';
    const dot = document.createElement('span');
    dot.className = 'fontscope-color-dot';
    dot.style.backgroundColor = value;
    valueSpan.appendChild(dot);
    
    // Only add click handler for color
    div.addEventListener('click', () => copyToClipboard(value));
  }
  
  valueSpan.appendChild(document.createTextNode(value));
  
  div.appendChild(labelSpan);
  div.appendChild(valueSpan);
  
  return div;
}

function showPopup() {
  initializePopup();
  
  if (!lastClickedElement) return;
  
  try {
    const details = getComputedFontDetails(lastClickedElement);
    popup.innerHTML = '';
    
    // Create header with close button
    const header = document.createElement('div');
    header.className = 'fontscope-header';
    
    const title = document.createElement('span');
    title.className = 'fontscope-title';
    title.textContent = details.family;
    
    const closeBtn = document.createElement('span');
    closeBtn.className = 'fontscope-close';
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => {
      popup.style.display = 'none';
    });
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    popup.appendChild(header);
    
    // Add properties
    popup.appendChild(createPropertyElement('Family', details.family));
    popup.appendChild(createPropertyElement('Style', details.style));
    popup.appendChild(createPropertyElement('Weight', details.weight));
    popup.appendChild(createPropertyElement('Size', details.size));
    popup.appendChild(createPropertyElement('Line Height', details.height));
    popup.appendChild(createPropertyElement('Letter Spacing', details.letterSpacing || 'normal'));
    popup.appendChild(createPropertyElement('Color', details.color, 'color'));
    
    // Position the popup
    const rect = lastClickedElement.getBoundingClientRect();
    popup.style.left = `${rect.left + window.scrollX}px`;
    popup.style.top = `${rect.bottom + window.scrollY + 10}px`;
    popup.style.display = 'block';
  } catch (error) {
    console.error('Error showing popup:', error);
  }
}

// Store the element when right-clicking
document.addEventListener('contextmenu', function(e) {
  lastClickedElement = e.target;
});

// Listen for the context menu message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "inspectFont") {
    showPopup();
  }
});

// Close popup when clicking outside
document.addEventListener('click', (e) => {
  if (popup && !popup.contains(e.target)) {
    popup.style.display = 'none';
  }
});

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePopup);
} else {
  initializePopup();
}