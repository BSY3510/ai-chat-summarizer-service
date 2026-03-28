import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown'
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 1. 화면이 처음 렌더링될 때 백엔드에서 과거 대화 기록(히스토리) 가져오기
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/history');
      if (res.ok) {
        const data = await res.json();
        const formattedHistory = data.map(item => ({
          id: item.id,
          title: item.userMessage
        }));
        setHistory(formattedHistory);
      }
    } catch (error) {
      console.error("대화 기록을 불러오지 못했습니다.", error);
    }
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
      // 2. 백엔드 API 호출 (질문 전송)
      const res = await fetch('http://localhost:8080/api/chat', {
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
        
        fetchHistory();
      } else {
        throw new Error("서버 통신 오류");
      }
    } catch (error) {
      console.error("메시지 전송 실패:", error);
      setChatLog((prev) => 
        prev.filter(msg => msg.id !== 'loading').concat({
          id: Date.now() + 1,
          sender: 'ai',
          message: '서버와 연결할 수 없습니다. 백엔드 서버가 켜져 있는지 확인해주세요.'
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* 1. 좌측 사이드바 */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={() => setChatLog([])}>+ 새 대화</button>
        </div>
        <ul className="history-list">
          {history.map((item) => (
            <li key={item.id} className="history-item">
              💬 {item.title}
            </li>
          ))}
        </ul>
      </aside>

      {/* 2. 우측 메인 채팅 영역 */}
      <main className="chat-main">
        <header className="chat-header">
          <h1>AI Chat & Summarizer</h1>
        </header>
        
        <div className="chat-messages">
          {chatLog.length === 0 && (
            <div className="message-wrapper ai">
              <div className="message-bubble">
                안녕하세요! 무엇을 도와드릴까요? 긴 글을 주시면 요약해 드립니다.
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