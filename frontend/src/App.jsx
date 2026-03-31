import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './App.css';

const getDeviceId = () => {
  let deviceId = localStorage.getItem('chat_device_id');
  if (!deviceId) {
    deviceId = 'device-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
    localStorage.setItem('chat_device_id', deviceId);
  }
  return deviceId;
};

const DEVICE_ID = getDeviceId();

function App() {
  const [input, setInput] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/sessions', {
        headers: { 'X-Device-Id': DEVICE_ID }
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (error) {
      console.error("대화방 목록을 불러오지 못했습니다.", error);
    }
  };

  const handleSessionClick = async (sessionId) => {
    setCurrentSessionId(sessionId);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/messages`, {
        headers: { 'X-Device-Id': DEVICE_ID }
      });
      if (res.ok) {
        const messages = await res.json();
        const formattedLog = messages.map(m => ([
          { id: `${m.id}-user`, sender: 'user', message: m.userMessage },
          { id: `${m.id}-ai`, sender: 'ai', message: m.aiResponse }
        ])).flat();
        setChatLog(formattedLog);
      }
    } catch (error) {
      console.error("메시지를 불러오지 못했습니다.", error);
    }
  };

  const updateTitle = async (sessionId) => {
    if (!editTitle.trim()) {
      setEditingSessionId(null);
      return;
    }
    try {
      await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'text/plain',
          'X-Device-Id': DEVICE_ID 
        },
        body: editTitle
      });
      setEditingSessionId(null);
      fetchSessions();
    } catch (error) {
      console.error("제목 수정 실패:", error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input;
    const currentHistory = chatLog
      .filter(msg => msg.id !== 'loading')
      .map(msg => ({ sender: msg.sender, message: msg.message }));

    setChatLog((prev) => [...prev, { id: Date.now(), sender: 'user', message: userText }]);
    setInput('');
    setIsLoading(true);

    setChatLog((prev) => [...prev, { id: 'loading', sender: 'ai', message: 'AI가 답변을 생성하고 있습니다...' }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Id': DEVICE_ID
        },
        body: JSON.stringify({
          message: userText,
          history: currentHistory,
          sessionId: currentSessionId
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (!currentSessionId && data.session) {
          setCurrentSessionId(data.session.id);
        }
        setChatLog((prev) => 
          prev.filter(msg => msg.id !== 'loading').concat({
            id: Date.now() + 1,
            sender: 'ai',
            message: data.aiResponse
          })
        );
        fetchSessions();
      } else {
        throw new Error("서버 통신 오류");
      }
    } catch (error) {
      setChatLog((prev) => 
        prev.filter(msg => msg.id !== 'loading').concat({
          id: Date.now() + 1,
          sender: 'ai',
          message: '서버와 연결할 수 없습니다.'
        })
      );
    } finally {
      setIsLoading(false);
    }
  };
  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <button 
            className="new-chat-btn" 
            onClick={() => { 
              setChatLog([]); 
              setCurrentSessionId(null); 
              setSearchKeyword('');
            }}
          >
            + 새 대화
          </button>
        </div>
        
        <div className="sidebar-search">
          <input 
            type="text" 
            placeholder="대화방 검색..." 
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>

        <ul className="history-list">
          {filteredSessions.length === 0 ? (
             <li className="history-item" style={{ textAlign: 'center', color: '#888', cursor: 'default' }}>
               결과가 없습니다.
             </li>
          ) : (
            filteredSessions.map((s) => (
              <li 
                key={s.id} 
                className={`history-item ${currentSessionId === s.id ? 'active' : ''}`}
                onClick={() => handleSessionClick(s.id)}
              >
                {editingSessionId === s.id ? (
                  <input 
                    className="edit-title-input"
                    value={editTitle} 
                    onChange={(e) => setEditTitle(e.target.value)} 
                    onBlur={() => updateTitle(s.id)} 
                    onKeyDown={(e) => e.key === 'Enter' && updateTitle(s.id)} 
                    autoFocus 
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <div className="session-title-container">
                    <span className="session-title-text">💬 {s.title}</span>
                    <button 
                      className="edit-btn" 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setEditingSessionId(s.id); 
                        setEditTitle(s.title); 
                      }}
                    >
                      ✏️
                    </button>
                  </div>
                )}
              </li>
            ))
          )}
        </ul>
      </aside>

      <main className="chat-main">
        <header className="chat-header">
          <h1>AI Chat & Summarizer</h1>
        </header>
        
        <div className="chat-messages">
          {chatLog.length === 0 && (
            <div className="message-wrapper ai">
              <div className="message-bubble">
                <ReactMarkdown>
                  안녕하세요! 백엔드 아키텍처 및 코드 리뷰, 혹은 텍스트 요약을 도와드립니다.
                </ReactMarkdown>
              </div>
            </div>
          )}
          {chatLog.map((chat) => (
            <div key={chat.id} className={`message-wrapper ${chat.sender}`}>
              <div className="message-bubble">
                <ReactMarkdown>{chat.message}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>

        <div className="chat-input-area">
          <div className="input-box">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isLoading ? "AI가 답변을 작성 중입니다..." : "메시지를 입력하세요..."}
              disabled={isLoading}
            />
            <button onClick={handleSend} className="send-btn" disabled={isLoading}>
              전송
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;