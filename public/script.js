// ========== СОСТОЯНИЕ ПРИЛОЖЕНИЯ ==========
const state = {
  sessionId: generateSessionId(),
  isLoading: false,
  messageCount: 0
};

// ========== DOM ЭЛЕМЕНТЫ ==========
const $ = (sel) => document.querySelector(sel);
const chatContainer = $('#chatContainer');
const messagesDiv = $('#messages');
const messageInput = $('#messageInput');
const sendBtn = $('#sendBtn');
const newChatBtn = $('#newChatBtn');
const welcome = $('#welcome');

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  messageInput.focus();
});

function setupEventListeners() {
  // Отправка сообщения
  sendBtn.addEventListener('click', sendMessage);
  
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Активация кнопки отправки
  messageInput.addEventListener('input', () => {
    adjustTextareaHeight();
    toggleSendButton();
  });

  // Быстрые темы
  document.querySelectorAll('.topic-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const msg = btn.dataset.msg;
      messageInput.value = msg;
      toggleSendButton();
      sendMessage();
    });
  });

  // Новый чат
  newChatBtn.addEventListener('click', startNewChat);
}

// ========== ОТПРАВКА СООБЩЕНИЯ ==========
async function sendMessage() {
  const text = messageInput.value.trim();
  if (!text || state.isLoading) return;

  // Скрываем приветствие
  if (welcome) {
    welcome.style.display = 'none';
  }

  state.isLoading = true;
  state.messageCount++;

  // Добавляем сообщение пользователя
  addMessage(text, 'user');

  // Очищаем инпут
  messageInput.value = '';
  adjustTextareaHeight();
  toggleSendButton();

  // Показываем индикатор набора
  showTypingIndicator();

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        sessionId: state.sessionId
      })
    });

    const data = await response.json();

    // Убираем индикатор
    hideTypingIndicator();

    if (response.ok) {
      addMessage(data.reply, 'bot');
    } else {
      addMessage(data.error || 'Что-то пошло не так. Попробуй ещё раз.', 'bot');
    }
  } catch (error) {
    hideTypingIndicator();
    addMessage('Не удалось подключиться к серверу. Проверь интернет и попробуй снова.', 'bot');
  }

  state.isLoading = false;
  messageInput.focus();
}

// ========== ДОБАВЛЕНИЕ СООБЩЕНИЯ ==========
function addMessage(text, type) {
  const messageEl = document.createElement('div');
  messageEl.className = `message ${type}`;

  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.textContent = type === 'bot' ? '🧠' : '👤';

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';

  if (type === 'bot') {
    bubble.innerHTML = formatBotMessage(text);
  } else {
    bubble.textContent = text;
  }

  messageEl.appendChild(avatar);
  messageEl.appendChild(bubble);
  messagesDiv.appendChild(messageEl);

  // Прокрутка вниз
  scrollToBottom();
}

// ========== ФОРМАТИРОВАНИЕ ТЕКСТА БОТА ==========
function formatBotMessage(text) {
  // Простой markdown-подобный парсер
  let formatted = text
    // Экранируем HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Жирный текст
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Курсив
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Эмодзи-заголовки (строки начинающиеся с эмодзи)
    // Ссылки в тексте
    .replace(/`(.*?)`/g, '<code>$1</code>')
    // Цитаты
    .replace(/^&gt;\s(.+)$/gm, '<blockquote>$1</blockquote>')
    // Нумерованные списки
    .replace(/^\d+\.\s(.+)$/gm, '<li>$1</li>')
    // Маркированные списки
    .replace(/^[-•]\s(.+)$/gm, '<li>$1</li>')
    // Параграфы
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  // Оборачиваем li в ul
  formatted = formatted.replace(/(<li>.*?<\/li>)+/gs, (match) => `<ul>${match}</ul>`);

  return `<p>${formatted}</p>`;
}

// ========== TYPING INDICATOR ==========
function showTypingIndicator() {
  const indicator = document.createElement('div');
  indicator.className = 'typing-indicator';
  indicator.id = 'typingIndicator';
  indicator.innerHTML = `
    <div class="typing-avatar">🧠</div>
    <div class="typing-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;
  messagesDiv.appendChild(indicator);
  scrollToBottom();
}

function hideTypingIndicator() {
  const indicator = document.getElementById('typingIndicator');
  if (indicator) indicator.remove();
}

// ========== НОВЫЙ ЧАТ ==========
function startNewChat() {
  state.sessionId = generateSessionId();
  state.messageCount = 0;
  messagesDiv.innerHTML = '';
  
  if (welcome) {
    welcome.style.display = 'flex';
  }

  messageInput.value = '';
  adjustTextareaHeight();
  messageInput.focus();
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function adjustTextareaHeight() {
  messageInput.style.height = 'auto';
  messageInput.style.height = Math.min(messageInput.scrollHeight, 150) + 'px';
}

function toggleSendButton() {
  const hasText = messageInput.value.trim().length > 0;
  sendBtn.classList.toggle('active', hasText && !state.isLoading);
  sendBtn.disabled = !hasText || state.isLoading;
}

function scrollToBottom() {
  requestAnimationFrame(() => {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  });
}
