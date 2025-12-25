# Instafit - 인스타그램 이미지 리사이저

한국어 | [English](./README.md)

인스타그램에 최적화된 웹 기반 이미지 편집기입니다. 이미지를 인스타그램 호환 비율로 리사이즈하고, 배경 색상이나 블러 효과를 적용하여 일괄 처리할 수 있습니다.

## 주요 기능

- **템플릿 프리셋**: 정사각형 (1:1), 세로형 (4:5), 가로형 (1.91:1) 포맷
- **배경 옵션**: 단색 배경, 조절 가능한 블러 효과
- **일괄 처리**: 여러 이미지를 한 번에 업로드하고 처리
- **다국어 지원**: 한국어, 영어, 일본어
- **PWA 지원**: 홈 화면에 설치 가능, 오프라인 사용 지원
- **반응형 디자인**: 데스크톱, 태블릿, 모바일 지원

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript |
| UI | React 19, Tailwind CSS 4 |
| 컴포넌트 | Radix UI |
| 테스팅 | Vitest, Testing Library |
| 성능 최적화 | Web Workers, Virtual List (@tanstack/react-virtual) |

## 프로젝트 구조

```
instafit/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # 루트 레이아웃 (PWA 메타데이터 포함)
│   └── page.tsx            # 메인 페이지
├── components/
│   ├── ui/                 # 재사용 가능한 UI 컴포넌트 (Button, Card, Slider 등)
│   ├── image-editor.tsx    # 메인 에디터 컴포넌트
│   ├── image-canvas.tsx    # 캔버스 렌더링 컴포넌트
│   ├── template-selector.tsx
│   ├── background-controls.tsx
│   └── image-thumbnail-list.tsx  # 가상화된 썸네일 리스트
├── hooks/
│   ├── use-canvas-renderer.ts    # 캔버스 렌더링 로직
│   └── use-image-worker.ts       # Web Worker 통신
├── lib/
│   └── i18n/               # 국제화
│       ├── translations.ts
│       └── context.tsx
├── workers/
│   └── image-processor.worker.ts  # 이미지 처리 Web Worker
├── types/
│   └── editor.ts           # TypeScript 타입 정의
├── public/
│   ├── manifest.json       # PWA 매니페스트
│   └── offline.html        # 오프라인 폴백 페이지
└── tests/                  # 유닛 테스트
```

## 시작하기

### 요구 사항

- Node.js 18+
- npm 또는 yarn

### 설치

```bash
# 저장소 클론
git clone https://github.com/your-username/instafit.git
cd instafit

# 의존성 설치
npm install

# 개발 서버 시작
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어주세요.

### 사용 가능한 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 시작 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 시작 |
| `npm run lint` | ESLint 실행 |
| `npm run type-check` | TypeScript 타입 검사 |
| `npm run test` | 유닛 테스트 실행 |
| `npm run test:coverage` | 커버리지 리포트와 함께 테스트 실행 |

## 사용 방법

1. **이미지 업로드**: 드래그 앤 드롭 또는 클릭하여 이미지 선택
2. **템플릿 선택**: 정사각형, 세로형, 가로형 포맷 중 선택
3. **배경 설정**: 단색 배경 선택 또는 블러 효과 활성화
4. **세부 조정**: 블러 강도 및 이미지 패딩 조절
5. **다운로드**: 개별 이미지 다운로드 또는 전체 일괄 다운로드

## 브라우저 지원

- Chrome 80+
- Firefox 75+
- Safari 14+
- Edge 80+

## 라이선스

이 프로젝트는 [MIT 라이선스](./LICENSE)를 따릅니다.
