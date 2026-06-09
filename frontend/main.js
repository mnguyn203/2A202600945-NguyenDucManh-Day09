import { marked } from 'marked';

const chatForm = document.getElementById('chatForm');
const promptInput = document.getElementById('promptInput');
const chatArea = document.getElementById('chatArea');
const sendBtn = document.getElementById('sendBtn');
const systemStatus = document.getElementById('systemStatus');

// Graph Elements
const nodeCust = document.getElementById('node-customer');
const nodeLaw = document.getElementById('node-law');
const nodeTax = document.getElementById('node-tax');
const nodeComp = document.getElementById('node-compliance');
const nodeAgg = document.getElementById('node-aggregate');

const lines = document.querySelectorAll('.connector');

// Auto-resize textarea
promptInput.addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = (this.scrollHeight) + 'px';
});

// Handle Enter key
promptInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    chatForm.dispatchEvent(new Event('submit'));
  }
});

function appendMessage(role, text, isLoading = false) {
  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${role === 'user' ? 'user-msg' : 'bot-msg'} ${isLoading ? 'loading' : ''}`;
  
  const avatarDiv = document.createElement('div');
  avatarDiv.className = 'avatar';
  avatarDiv.textContent = role === 'user' ? '👤' : '🤖';

  const bubbleDiv = document.createElement('div');
  bubbleDiv.className = 'bubble';
  
  if (isLoading) {
    bubbleDiv.innerHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;
  } else {
    bubbleDiv.innerHTML = role === 'bot' ? marked.parse(text) : `<p>${text}</p>`;
  }

  msgDiv.appendChild(avatarDiv);
  msgDiv.appendChild(bubbleDiv);
  chatArea.appendChild(msgDiv);
  chatArea.scrollTop = chatArea.scrollHeight;
  return msgDiv;
}

// ---- Visualization Simulator ----
let simInterval = null;

function resetGraph() {
  clearInterval(simInterval);
  document.querySelectorAll('.agent-node, .connector').forEach(el => el.classList.remove('active'));
  systemStatus.className = 'status-badge';
  systemStatus.innerHTML = '<span class="pulse"></span> Ready';
}

function simulateGraphFlow() {
  resetGraph();
  systemStatus.className = 'status-badge processing';
  systemStatus.innerHTML = '<span class="pulse"></span> Routing...';

  // 1. Customer Agent activates
  nodeCust.classList.add('active');

  // 2. Transmit to Parallel branches (Law, Tax, Compliance) after 2 seconds
  simInterval = setTimeout(() => {
    lines.forEach(l => l.classList.add('active')); // Light up all wires
    systemStatus.innerHTML = '<span class="pulse"></span> Parallel Processing...';
    
    nodeLaw.classList.add('active');
    nodeTax.classList.add('active');
    nodeComp.classList.add('active');

    // 3. Aggregate starts taking over after ~20 seconds
    simInterval = setTimeout(() => {
      systemStatus.innerHTML = '<span class="pulse"></span> Aggregating...';
      nodeCust.classList.remove('active');
      nodeLaw.classList.remove('active');
      nodeTax.classList.remove('active');
      nodeComp.classList.remove('active');
      
      nodeAgg.classList.add('active');
    }, 20000);

  }, 2000);
}

// ---------------------------------

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = promptInput.value.trim();
  if (!text) return;

  appendMessage('user', text);
  promptInput.value = '';
  promptInput.style.height = 'auto';
  promptInput.disabled = true;
  sendBtn.disabled = true;
  
  const loadingMsg = appendMessage('bot', '', true);

  // Start Visual Flow
  simulateGraphFlow();

  try {
    const payload = {
      id: crypto.randomUUID(),
      jsonrpc: "2.0",
      method: "message/send",
      params: {
        message: {
          kind: "message",
          messageId: crypto.randomUUID(),
          parts: [{ kind: "text", text: text }],
          role: "user"
        }
      }
    };

    const response = await fetch('/api/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    const data = await response.json();
    
    let replyText = "No response text found.";
    if (data.result && data.result.parts) {
       for (const part of data.result.parts) {
         if (part.text) replyText = part.text;
       }
    } else if (data.result && data.result.artifacts) {
       for (const artifact of data.result.artifacts) {
         for (const part of artifact.parts) {
           if (part.text) replyText = part.text;
         }
       }
    }

    loadingMsg.remove();
    appendMessage('bot', replyText);

    // Done state
    resetGraph();
    systemStatus.className = 'status-badge done';
    systemStatus.innerHTML = '✔ Success';
    setTimeout(() => { resetGraph(); }, 5000); // Return to ready after 5s

  } catch (error) {
    loadingMsg.remove();
    appendMessage('bot', `**Error:** Could not connect to Customer Agent. Make sure \`./start_all.sh\` is running.\n\nDetails: ${error.message}`);
    resetGraph();
  } finally {
    promptInput.disabled = false;
    sendBtn.disabled = false;
    promptInput.focus();
  }
});
