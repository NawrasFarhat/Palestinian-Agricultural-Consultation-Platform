import React, { useState, useEffect } from 'react';
import styles from '../styles/ChatBot.module.css';
import AuthService from '../services/AuthService';

export default function ChatBot() {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  useEffect(() => {
    const fetchFirstQuestion = async () => {
      try {
        console.log("Fetching first question...");
        const res = await fetch("http://localhost:8000/start");
        const data = await res.json();
        console.log("Received first question data:", data);
        setMessages([{ text: data.question, sender: 'bot' }]);
        setSuggestions(data.suggestions || []);
        setSessionId(data.session_id);
        console.log("Set session ID to:", data.session_id);
      } catch (err) {
        console.error("Error fetching start question:", err);
      }
    };

    fetchFirstQuestion();
    setIsLoggedIn(AuthService.isLoggedIn());
  }, []);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    setMessages(prev => [...prev, { text, sender: 'user' }]);
    setInputValue('');
    setSuggestions([]);

    try {
      console.log("Sending message with session ID:", sessionId);
      
      if (!sessionId) {
        console.error("Session ID is missing! Attempting to get a new session...");
        // Try to get a new session if missing
        const startRes = await fetch("http://localhost:8000/start");
        const startData = await startRes.json();
        setSessionId(startData.session_id);
        console.log("Created new session ID:", startData.session_id);
        // Use this new session ID
        var currentSessionId = startData.session_id;
      } else {
        var currentSessionId = sessionId;
      }

      const requestBody = {
        session_id: currentSessionId,
        user_answer: text
      };
      console.log("Sending request body:", requestBody);
      
      const res = await fetch("http://localhost:8000/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Server responded with ${res.status}: ${errorText}`);
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      console.log("Received answer data:", data);

      setMessages(prev => [...prev, { text: data.question, sender: 'bot' }]);
      setSuggestions(data.suggestions || []);

      if (data.is_final) {
        setIsDiagnosing(true);
        // في المستقبل: يمكنك هنا ربط ApiService للتشخيص الكامل بعد نهاية الأسئلة
      }
    } catch (err) {
      console.error("Error sending answer:", err);
      // Show error message to user
      setMessages(prev => [...prev, { 
        text: "Sorry, there was an error connecting to the chatbot. Please try again later.", 
        sender: 'bot' 
      }]);
    }
  };

  const handleLoginToggle = () => {
    if (isLoggedIn) {
      AuthService.logout();
      setIsLoggedIn(false);
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <div className={styles['chat-landing-container']}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>🌿</div>
        {isLoggedIn && (
          <nav>
            <button title="Home">🏠</button>
            <button title="History">📜</button>
            <button title="Saved">💾</button>
            <button title="Settings">⚙️</button>
          </nav>
        )}
      </aside>

      <main className={styles['main-panel']}>
        <div style={{ marginBottom: '20px', textAlign: 'right' }}>
          <button
            style={{
              backgroundColor: '#4d684f',
              color: 'white',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
            onClick={handleLoginToggle}
          >
            {isLoggedIn ? '🔒 تسجيل خروج' : '🔓 تسجيل دخول'}
          </button>
        </div>

        <h1>
          Welcome, <span className={styles['highlight-name']}>
            {isLoggedIn ? AuthService.getCurrentUser()?.username || 'Farmer' : 'Farmer'}
          </span><br />
          <span className={styles['highlight-question']}>Let's diagnose your olive tree</span>
        </h1>

        <p className={styles['prompt-desc']}>
          اختر إجابة مقترحة أو أدخل إجابتك أدناه 👇
        </p>

        {!isDiagnosing && suggestions.length > 0 && (
          <div className={styles.prompts}>
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={styles['prompt-card']}
                onClick={() => sendMessage(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}

        {isDiagnosing && (
          <div className={styles['diagnosis-loading']}>
            <p>🔍 جاري التشخيص...</p>
          </div>
        )}

        <div className={styles['chat-display']}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`${styles['chat-bubble']} ${msg.sender === 'user' ? styles['user-msg'] : styles['bot-msg']}`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        <div className={styles['input-area']}>
          <input
            type="text"
            className={styles['diagnosis-input']}
            placeholder="اكتب الأعراض أو اختر من الأعلى..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isDiagnosing}
          />
          <button
            className={styles['diagnosis-send']}
            onClick={() => sendMessage(inputValue)}
            disabled={isDiagnosing || !inputValue.trim()}
          >
            {isDiagnosing ? 'جاري...' : 'إرسال'}
          </button>
        </div>
      </main>
    </div>
  );
}
