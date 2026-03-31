import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (error) {
      console.error("대화 기록을 불러오지 못했습니다.", error);
    }
  };

  const searchHistory = async () => {
    try {
      const url = searchKeyword.trim()
        ? `/api/history/search?keyword=${encodeURIComponent(searchKeyword)}`
        : '/api/history';
        
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (error) {
      console.error("검색 중 오류 발생:", error);
    }
  };

  const handleHistoryClick = (item) => {
    setChatLog([
      { id: `${item.id}-user`, sender: 'user', message: item.userMessage },
      { id: `${item.id}-ai`, sender: 'ai', message: item.aiResponse }
    ]);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input;
    const newUserMsg = { id: Date.now(), sender: 'user', message: userText };
    
    setChatLog((prev) => [...prev, newUserMsg]);
    setInput('');
    setIsLoading(true);

    const loadingMsg = { id: 'loading', sender: 'ai', message: 'AI가 답변을 생성하고 있습니다...' };
    setChatLog((prev) => [...prev, loadingMsg]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: userText
      });

      if (res.ok) {
        const aiReply = await res.text();
        
        setChatLog((prev) => 
          prev.filter(msg => msg.id !== 'loading').concat({
            id: Date.now() + 1,
            sender: 'ai',
            message: aiReply
          })
        );
        setSearchKeyword('');
        fetchHistory();
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

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={() => setChatLog([])}>+ 새 대화</button>
        </div>
        
        <div className="sidebar-search">
          <input 
            type="text" 
            placeholder="과거 대화 검색..." 
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchHistory()}
          />
        </div>

        <ul className="history-list">
          {history.length === 0 ? (
             <li className="history-item" style={{ textAlign: 'center', color: '#888' }}>결과가 없습니다.</li>
          ) : (
            history.map((item) => (
              <li 
                key={item.id} 
                className="history-item"
                onClick={() => handleHistoryClick(item)}
              >
                💬 {item.userMessage}
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