# AIMEX Frontend

AI Influencer Model Management System의 프론트엔드 애플리케이션입니다.

## 설정


### 1. 백엔드 서버 실행

백엔드 서버가 실행 중이어야 합니다. `back/backend` 폴더에서 다음 명령어를 실행하세요:

```bash
# 가상환경 활성화 (선택사항)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 데이터베이스 마이그레이션
python migrate.py

# 서버 실행
python run.py
```

### 2. 프론트엔드 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## 주요 기능

- **AI 인플루언서 관리**: AI 모델 생성, 수정, 삭제
- **게시글 관리**: 콘텐츠 작성 및 스케줄링
- **Instagram 연동**: Instagram 계정 연결 및 포스팅
- **사용자 관리**: 그룹 기반 권한 관리
- **실시간 대시보드**: 모델 상태 및 성과 모니터링

## 기술 스택

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Context
- **Authentication**: JWT + 소셜 로그인

## API 연동

프론트엔드는 백엔드 API와 통신하여 데이터를 가져오고 저장합니다. 주요 API 엔드포인트:

- `/api/v1/influencers/` - AI 인플루언서 관리
- `/api/v1/boards/` - 게시글 관리
- `/api/v1/auth/` - 인증 관련
- `/api/v1/users/` - 사용자 관리
- `/api/v1/groups/` - 그룹 관리

## 데이터베이스 스키마

실제 MySQL 데이터베이스를 사용하며, 주요 테이블:

- `AI_INFLUENCER` - AI 인플루언서 모델
- `BOARD` - 게시글 데이터
- `USER` - 사용자 정보
- `GROUP` - 그룹 정보
- `STYLE_PRESET` - 스타일 프리셋
- `MODEL_MBTI` - MBTI 성격 데이터

## 개발 가이드

### 새로운 페이지 추가

1. `app/` 폴더에 새 페이지 생성
2. 필요한 컴포넌트를 `components/` 폴더에 추가
3. API 엔드포인트를 `app/api/` 폴더에 추가
4. 타입 정의를 `lib/types.ts`에 추가

### 컴포넌트 스타일링

shadcn/ui 컴포넌트를 사용하여 일관된 디자인을 유지하세요:

```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
```

### API 호출

`lib/api-client.ts`의 함수들을 사용하여 백엔드와 통신하세요:

```tsx
import { api } from "@/lib/api-client"

const models = await api.getModels()
``` 