import { useState } from 'react';

function App() {
  // 테스트를 위한 초기 질문 세팅
  const [input, setInput] = useState('명량해전을 승리로 이끈 장군은 누구야?');
  const [response, setResponse] = useState('');

  const handleSend = async () => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: input,
      });
      const data = await res.text();
      setResponse(data);
    } catch (error) {
      console.error('API 호출 에러:', error);
      setResponse('서버와 통신할 수 없습니다.');
    }
  };

  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif' }}>
      <h2>미니 챗봇 서비스 테스트</h2>
      <input 
        type="text" 
        value={input} 
        onChange={(e) => setInput(e.target.value)} 
        style={{ width: '300px', padding: '10px' }}
      />
      <button onClick={handleSend} style={{ padding: '10px 20px', marginLeft: '10px' }}>
        전송
      </button>
      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
        <strong>AI 응답:</strong> {response}
      </div>
    </div>
  );
}

export default App;