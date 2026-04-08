# AI Chat & Summarizer Service
> **Google Gemini API를 활용한 맞춤형 AI 대화 및 텍스트 요약 웹 서비스**

단순한 1회성 API 호출을 넘어, 사용자의 문맥을 기억하는 다중 턴(Multi-turn) 대화와 디바이스별 세션(Session) 관리 아키텍처를 구현한 풀스택 웹 애플리케이션입니다.

## Tech Stack
- **Backend**: Java 17, Spring Boot, Spring Data JPA, MySQL
- **Frontend**: React (Vite), 순수 CSS, `react-markdown`
- **AI & API**: Google Gemini 2.5 Flash API, RESTful API
- **Collaboration & VC**: Git / Github

## Key Features
- **실시간 AI 대화 및 요약**: 프론트엔드와 백엔드 간 비동기(`fetch`) 통신을 통한 실시간 채팅 구현
- **다중 턴(Multi-turn) 문맥 유지**: 이전 대화 내역(Context)을 상태로 관리하고 LLM에 전달하여 이어서 질문하기 기능 지원
- **대화방(Session) CRUD 관리**: 
  - 여러 번의 질문-답변을 하나의 대화방으로 묶어 생성 및 관리
  - JPA 영속성 전이(Cascade)를 활용한 안전한 대화방 삭제(Delete) 및 제목 수정(Update) 기능 구현
- **대화방 제목 동적 수정 및 검색**: 사이드바 내 실시간 텍스트 필터링 및 인플레이스(In-place) 제목 편집
- **반응형 UI 및 마크다운 렌더링**: AI의 응답을 `react-markdown`으로 파싱하여 코드 블록, 리스트 등 높은 가독성 제공

---

## Technical Decisions & Troubleshooting

### 1. 프롬프트 자산화 및 동적 관리
- **문제**: 초기에는 AI의 페르소나(System Instruction)를 코드 내부에 하드코딩함. 하지만 프롬프트를 수정할 때마다 서버를 재빌드하고 배포해야 하는 문제가 발생.
- **해결**: 프롬프트를 중요 자산으로 취급하여 소스코드와 분리. 데이터베이스(`SystemPrompt` 엔티티)를 통해 관리하도록 개선하여, 서버 재기동 없이 운영 중에도 AI의 역할과 성격을 즉각적으로 튜닝할 수 있는 유연한 아키텍처를 구축함.

### 2. 기기 식별 기반 데이터 격리
- **문제**: 로컬 네트워크(0.0.0.0)를 개방하여 스마트폰 등 타 디바이스에서 접속 테스트를 진행할 때, 모든 사용자의 대화가 한 화면에 섞여서 노출되는 Privacy 문제 발생.
- **해결**: 무거운 인증(Spring Security, JWT 등)을 도입하여 아키텍처 복잡도를 높이는 대신, 프론트엔드 `localStorage`를 활용해 기기별 고유 UUID(`X-Device-Id`)를 발급. 백엔드에서 이를 HTTP 헤더로 받아 DB 쿼리 레벨에서 데이터를 안전하게 필터링 및 격리함.

### 3. 데이터 무결성 보장 및 순환 참조 해결
- **문제**: 대화방(ChatSession) 삭제 시 하위 메시지(ChatMessage)들이 고아 객체로 남아 무결성이 깨질 위험이 있었음. 또한, 양방향 연관관계를 설정한 후 프론트엔드로 JSON 응답을 보낼 때 무한 루프가 발생하는 직렬화 에러를 겪음.
- **해결**:
  - `ChatSession` 엔티티의 메시지 리스트에 `CascadeType.ALL` 및 `orphanRemoval = true` 옵션을 적용하여 대화방 삭제 시 연관된 메시지가 연쇄 삭제되도록 영속성 전이(Cascade)를 완벽히 구현함.
  - 순환 참조를 끊어내기 위해 양방향 매핑 필드에 `@JsonIgnore` 어노테이션을 선언하여, 무거운 DTO 변환 작업 없이도 깔끔하게 JSON 직렬화 문제를 해결함.

### 4. 검색 기능의 오버엔지니어링 지양
- **고민**: 과거 대화 기록을 검색하는 기능을 구현할 때, Elasticsearch 같은 검색 엔진 도입을 고려함.
- **결정**: 현재 프로젝트의 데이터 규모와 인프라 리소스(Docker 미사용 로컬 환경)를 고려했을 때, 외부 검색 엔진 도입은 오버엔지니어링이라 판단. Spring Data JPA의 쿼리 메서드(`LIKE` 검색)를 활용하여 가장 실용적이고 빠른 방법으로 구현함. 추후 대용량 트래픽 발생 시 역색인 기반으로 확장이 가능하도록 레포지토리 계층을 분리해 둠.

### 5. CORS 이슈 및 다중 턴 대화(Context) 처리
- **문제**: LLM 자체는 상태(Stateless)를 기억하지 못해 대화의 문맥이 끊기는 문제와, 모바일 디바이스 접근 시 Spring Boot의 CORS 정책 차단 문제 발생.
- **해결**: 
  - 백엔드의 `@CrossOrigin` 설정을 전면 개방(`*`)하고 프론트엔드에서 Vite Proxy를 설정하여 모바일 접속 환경 구축.
  - 프론트엔드 단에서 유지 중인 대화 내역(`chatLog`)을 `ChatRequest` DTO의 JSON 배열로 묶어 전송함으로써, DB 구조를 무겁게 바꾸지 않고도 효율적으로 다중 턴 대화 문맥을 유지함.

---

## How to Run

### 1. Backend Setup
1. 로컬 환경에 MySQL을 설치하고 `chatbot_db` 데이터베이스를 생성합니다. (`CREATE DATABASE chatbot_db;`)
2. IDE(IntelliJ 등)의 Environment Variables에 아래 값을 설정합니다.
   - `DB_PASSWORD=본인의_DB_비밀번호`
   - `AI_API_KEY=발급받은_Gemini_API_Key`
3. Spring Boot Application을 실행합니다. (Port: 8080)
   - *실행 시 JPA `ddl-auto=update` 속성에 의해 테이블 및 기본 프롬프트가 자동 생성됩니다.*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev