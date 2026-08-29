export type PatchNoteLocale = 'ko' | 'en' | 'jp'
export type ReleaseSectionType = 'added' | 'improved' | 'fixed' | 'mainFeatures' | 'uiImprovements' | 'imageSources' | 'notes'

type LocalizedReleaseNote = {
  title: string
  summary?: string
  sections: Array<{ type: ReleaseSectionType; items: string[] }>
}

export type ReleaseNote = {
  version: string
  content: Record<PatchNoteLocale, LocalizedReleaseNote>
}

const changes = (type: 'added' | 'improved' | 'fixed', ko: string[], en: string[], jp: string[]) => ({
  ko: { title: ko[0], sections: [{ type, items: ko.slice(1) }] },
  en: { title: en[0], sections: [{ type, items: en.slice(1) }] },
  jp: { title: jp[0], sections: [{ type, items: jp.slice(1) }] },
})

export const patchNotes: ReleaseNote[] = [
  { version: 'v1.3.002', content: changes('added', ['릴리즈 노트 추가', '릴리즈 노트 추가'], ['Release Notes Added', 'Added release notes'], ['リリースノート追加', 'リリースノートを追加']) },
  { version: 'v1.3.001', content: changes('added', ['퀘스트 정보 게시판 추가', '퀘스트 정보 게시판 추가'], ['Quest Guide Board Added', 'Added the quest guide board'], ['クエスト情報掲示板追加', 'クエスト情報掲示板を追加']) },
  { version: 'v1.2.004', content: changes('fixed', ['모바일 진화 섹션 수정', '모바일 진화 섹션 라인 픽셀 사이즈 수정'], ['Mobile Evolution Section Fix', 'Adjusted evolution tree line pixels on mobile'], ['モバイル進化セクション修正', 'モバイル進化セクションの接続線ピクセルサイズを修正']) },
  { version: 'v1.2.003', content: changes('added', ['진화 섹션 디지몬 성격 추가', '진화 섹션 디지몬 성격 추가'], ['Digimon Personalities Added', 'Added Digimon personalities to the evolution section'], ['進化セクションにデジモン性格追加', '進化セクションにデジモンの性格を追加']) },
  { version: 'v1.2.002', content: changes('improved', ['속성 필터 개선', '속성 필터 추가', '필터 박스 사이즈 변경'], ['Attribute Filter Improvements', 'Added the attribute filter', 'Adjusted the filter box size'], ['属性フィルター改善', '属性フィルターを追加', 'フィルターボックスのサイズを変更']) },
  { version: 'v1.2.001', content: changes('fixed', ['모바일 및 반응형 화면 수정', '모바일 및 반응형 화면 수정'], ['Mobile and Responsive Layout Fixes', 'Improved mobile and responsive layouts'], ['モバイル・レスポンシブ画面修正', 'モバイルおよびレスポンシブ画面を修正']) },
  { version: 'v1.1.001', content: changes('added', ['일본어 서비스 제공', '일본어 서비스 제공'], ['Japanese Service Added', 'Added Japanese language support'], ['日本語サービス提供', '日本語サービスを追加']) },
  {
    version: 'v1.0.001',
    content: {
      ko: {
        title: 'DIGIVOLUTION 최초 릴리즈',
        sections: [
          { type: 'mainFeatures', items: ['디지몬 이름 및 성장 단계별 검색', '이전·다음 진화 경로 트리 제공', '모든 진화 조건 상시 표시', '진화 트리 접기·펼치기 지원', '디지몬 상세 정보 제공', '스페셜 스킬 및 어태치먼트 스킬 표시', '게임 도감 이미지 및 스킬 이미지 표시', '관련 디지몬을 선택해 상세 페이지로 이동', '한국어 및 영어 UI 지원', '공식 디지몬 도감 다국어 링크 지원', '요청게시판 글 작성 및 이미지 첨부', '작성자명과 게시글 비밀번호를 이용한 본인 요청 확인', '관리자 인증 및 요청 관리 화면', '요청 상태 및 관리자 답변 확인', '시스템/API 연결 상태 표시', '검색 및 진화 경로 섹션 내비게이션', '반응형 화면 구성'] },
          { type: 'uiImprovements', items: ['세로형 진화 트리와 명확한 연결선 적용', '디지몬 카드와 진화 조건 영역의 가독성 개선', '픽셀 이미지 및 상세 이미지 표시 최적화', '페이지 단위 지연 로딩 적용', '초기 JavaScript 번들 크기 최적화', 'DATA, ROUTE, LANG 통계 영역 제공', '확인된 진화 경로 수를 서버 데이터 기준으로 표시'] },
          { type: 'imageSources', items: ['게임 도감 및 스킬 관련 이미지 사용은 원저작자의 허락을 받아 제공됩니다.'] },
          { type: 'notes', items: ['일본어 서비스는 추후 제공될 예정입니다.'] },
        ],
      },
      en: {
        title: 'Initial DIGIVOLUTION Release',
        sections: [
          { type: 'mainFeatures', items: ['Search by Digimon name and growth stage', 'Previous and next evolution route trees', 'Always-visible evolution requirements', 'Collapsible evolution trees', 'Detailed Digimon information', 'Special and attachment skill information', 'In-game encyclopedia and skill images', 'Navigation to related Digimon detail pages', 'Korean and English interfaces', 'Multilingual official encyclopedia links', 'Request board posts with image attachments', 'Private request lookup using author name and post password', 'Administrator authentication and request management', 'Request status and administrator responses', 'System and API connection status', 'Search and evolution route navigation', 'Responsive layouts'] },
          { type: 'uiImprovements', items: ['Vertical evolution trees with clear connecting lines', 'Improved readability for cards and evolution requirements', 'Optimized pixel and detail images', 'Page-level lazy loading', 'Optimized initial JavaScript bundle size', 'DATA, ROUTE, and LANG statistics', 'Server-based verified evolution route count'] },
          { type: 'imageSources', items: ['In-game encyclopedia and skill images are provided with permission from their original creator.'] },
          { type: 'notes', items: ['Japanese support was planned for a future release.'] },
        ],
      },
      jp: {
        title: 'DIGIVOLUTION 初回リリース',
        sections: [
          { type: 'mainFeatures', items: ['デジモン名・成長段階別検索', '進化前・進化後のルートツリー', 'すべての進化条件を常時表示', '進化ツリーの折りたたみ・展開', 'デジモン詳細情報', 'スペシャルスキルとアタッチメントスキル表示', 'ゲーム図鑑画像とスキル画像表示', '関連デジモンから詳細ページへ移動', '韓国語・英語UI', '公式デジモン図鑑の多言語リンク', 'リクエスト掲示板への投稿と画像添付', '投稿者名とパスワードによる本人リクエスト確認', '管理者認証とリクエスト管理画面', 'リクエスト状態と管理者回答の確認', 'システム・API接続状態表示', '検索・進化ルートナビゲーション', 'レスポンシブ画面'] },
          { type: 'uiImprovements', items: ['縦型進化ツリーと明確な接続線', 'カードと進化条件の視認性改善', 'ピクセル画像と詳細画像の表示最適化', 'ページ単位の遅延読み込み', '初期JavaScriptバンドルサイズ最適化', 'DATA・ROUTE・LANG統計エリア', '確認済み進化ルート数をサーバーデータ基準で表示'] },
          { type: 'imageSources', items: ['ゲーム図鑑およびスキル関連画像は、原作者の許可を得て提供しています。'] },
          { type: 'notes', items: ['日本語サービスは今後提供予定でした。'] },
        ],
      },
    },
  },
]
