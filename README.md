# 디지바이스 LAB

`디지몬 스토리 타임 스트레인저`의 한글 진화 트리와 도감을 탐색하는 팬 프로젝트입니다.

## DB 설계 결정 메모

- Flyway 마이그레이션은 현재 `digimon_kr`, `item_kr`, `evolution_kr` 테이블을 사용한다.
- `evolution_kr`은 방향이 있는 진화 관계를 저장한다.
  - 다음 진화: `from_digimon_id`로 조회한다.
  - 이전 진화/퇴화: `to_digimon_id`로 조회한다.
- 다국어(i18n)는 현재 구현하지 않는다.
- 추후 사용자 언어 설정에 따라 언어 접미사가 붙은 테이블을 선택하는 방식으로 확장한다.
  - 한국어: `_kr`
  - 영어: `_en`
  - 일본어: `_jp`
- `digimon_translation_kr`은 추후 다국어 데이터 확장 시 재검토한다. 언어별 테이블 방식을 채택하면 테이블 안의 번역 전용 데이터가 중복될 수 있다.

## 성격 분류 체계

디지몬의 성격은 대분류와 세부 성격으로 구성한다. `digimon_kr.personality`에는 아래 세부 성격 값을 저장하고, 대분류는 세부 성격을 기준으로 판별한다.

| 대분류 | 세부 성격                          |
| ------ | ---------------------------------- |
| 박애   | 자애, 헌신적, 포용력, 과보호       |
| 용맹   | 열혈, 용감, 만용, 대담             |
| 지계   | 계시, 잔머리, 지혜로움, 전략가     |
| 우호   | 기회주의자, 친근함, 사교적, 따뜻함 |

## 디지몬 데이터 입력 규칙

- 사용자가 게임 화면의 디지몬 캡처를 제공하면, 캡처의 영문 이름·등급·속성·성격을 기준으로 `digimon_kr` INSERT SQL을 작성한다.
- 한글 이름과 `digimon_type`은 공식 한국어 도감의 개별 상세 페이지를 가능한 범위에서 대조한다.
- 공식 도감은 대량 자동 크롤링이나 이미지 수집에 사용하지 않고, 개별 항목 검수 및 `source_url` 기록에만 사용한다.
- 게임 화면 표기 매핑:
  - `Baby` → `유년기1`
  - `No Data` → `attribute` 값 `'No Data'` (NULL이 아님)
- 성격 영문값은 성격 분류 체계의 세부 성격 한글값으로 변환한다.
- `stage`, `attribute`, `digimon_type`을 `NULL`로 작성하기 전에는 다음 재검증을 반드시 수행한다.
  1. 게임 캡처의 표기를 먼저 반영한다. 예: `Baby`와 `No Data`는 각각 `유년기1`, `'No Data'`로 저장한다.
  2. 공식 영어 도감에서 정확한 `directory_name`을 확인한다.
  3. 같은 `directory_name`으로 공식 한국어 도감을 다시 조회해 한글 이름과 유형을 확인한다.
  4. 영문 이름과 도감 URL 식별자가 다른 경우를 고려해 철자 및 대체 표기를 재확인한다. 예: `Pabumon`의 도감 식별자는 `bubbmon`이다.
- 위 절차를 마친 뒤에도 확인할 수 없는 공식 정보만 `NULL` 또는 보류로 남긴다.

## Flyway SQL 주의사항

Flyway SQL 파일에는 Markdown 기호를 포함하지 않는다. 아래처럼 작성한다.

```sql
created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

`*CURRENT_TIMESTAMP*`처럼 별표가 들어가면 SQL 문법 오류가 발생한다.
