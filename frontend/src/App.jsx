import { useState } from 'react';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  
  // 더미 채팅 데이터 (나중에 백엔드와 연동)
  const [chatLog, setChatLog] = useState([
    { id: 1, sender: 'ai', message: '안녕하세요! 요약이 필요한 텍스트나 질문을 입력해주세요.' }
  ]);

  // 더미 과거 대화 기록 (나중에 백엔드와 연동)
  const [history, setHistory] = useState([
    { id: 1, title: '명량해전을 승리로 이끈...' },
    { id: 2, title: '리액트 상태관리란?' },
  ]);

  const handleSend = () => {
    if (!input.trim()) return;

    // 1. 사용자 메시지 화면에 추가
    const newUserMsg = { id: Date.now(), sender: 'user', message: input };
    setChatLog((prev) => [...prev, newUserMsg]);
    setInput('');

    // 2. 임시 AI 응답
    setTimeout(() => {
      const newAiMsg = { 
        id: Date.now() + 1, 
        sender: 'ai', 
        message: `[더미 응답] "${newUserMsg.message}"에 대한 요약/답변입니다.` 
      };
      setChatLog((prev) => [...prev, newAiMsg]);
    }, 600);
  };

  return (
    <div className="app-container">
      {/* 1. 좌측 사이드바 (과거 대화 기록) */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <button className="new-chat-btn">+ 새 대화</button>
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
        
        {/* 대화 내용 출력부 */}
        <div className="chat-messages">
          {chatLog.map((chat) => (
            <div key={chat.id} className={`message-wrapper ${chat.sender}`}>
              <div className="message-bubble">
                {chat.message}
              </div>
            </div>
          ))}
        </div>

        {/* 메시지 입력부 */}
        <div className="chat-input-area">
          <div className="input-box">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="메시지를 입력하세요..."
            />
            <button onClick={handleSend} className="send-btn">전송</button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;