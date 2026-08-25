/* Static "사용자 가이드" view — function-flow reference for the certificate ledger. No role
   split (unlike the COMP Voucher app): this is a shared department login, so the guide is
   organized by accounting flow instead (issue -> redeem -> void/refund -> expiry -> grace ->
   extend -> integrity/misc). Content mirrors user_manual.md, condensed to numbered steps. */
window.CertApp = window.CertApp || {};
CertApp.viewGuide = (function () {
  var t = CertApp.i18n.t;

  function topic(cls, title, steps, note) {
    var stepsHtml = steps.map(function (s) {
      return '<li><div class="gt">' + s[0] + '</div><div class="gd">' + s[1] + '</div></li>';
    }).join('');
    return '<div class="panel">'
      + '<h3><span class="guide-tag ' + cls + '"></span>' + title + '</h3>'
      + '<ol class="gsteps ' + cls + '">' + stepsHtml + '</ol>'
      + (note ? '<div class="gnote">' + note + '</div>' : '')
      + '</div>';
  }

  function render(container) {
    var html = '<div class="view-guide">';
    html += '<div class="panel muted">' + t('guide.intro') + '</div>';

    html += topic('gt-issue', t('guide.issue.title'), [
      ['증서 목록 → + 새 증서 발행', '연번 여러 장(권장) 또는 1장씩 발행을 선택합니다.'],
      ['연번 여러 장: 종류 선택 → 시작 증서번호 + 수량 입력', '예상 번호 대역이 실시간으로 표시됩니다. 금액·발행일·결제수단·비고를 입력한 뒤 [생성].'],
      ['자동 계산 · 자동 제안', '발행일을 고르면 종류별 유효기간이 자동 지정됩니다(서비스 1년 · 상품권 5년). 번호 입력칸에서 <b>Tab</b>을 누르면 마지막 번호 다음 번호가 자동으로 채워집니다.'],
      ['목록 검토 후 [전체 등록]', '하단 목록의 내용을 확인하고 최종 저장합니다.']
    ]);

    html += topic('gt-redeem', t('guide.redeem.title'), [
      ['증서 목록에서 대상 선택 → [사용 처리]', '체크박스로 선택 후 상단 툴바에서 진행합니다.'],
      ['정상 사용', '사용일을 입력하면 매출금액(B) = 면가(A), 잡이익(C) = 0원으로 처리됩니다.'],
      ['만료 후 사용 (Late Use)', '유효기간이 지난 서비스 증서는 매출(B) 90% / 잡이익(C) 10%로 자동 분할됩니다. <b>매출등록일</b> 입력 필수.'],
      ['잔액 환급 (금액권, 60% 이상 사용 시)', '사용액은 매출금액(B)에, 남은 잔액은 환불액(D)에 입력합니다(면가 A = B + C + D).'],
      ['비고 입력 후 [일괄 처리]', '영수증 번호나 객실 번호 등 식별 값을 비고(Bill No.)에 남깁니다.']
    ]);

    html += topic('gt-void', t('guide.void.title'), [
      ['ACTIVE(유효) 증서 선택 → [취소/환불]', ''],
      ['미판매 취소 (Misprint)', '오발행 파기용입니다. 금액 이동이 없으므로 환불액은 0원 처리됩니다.'],
      ['판매 후 환불 (Refund)', '전액 환불하거나, 위약금 10%를 차감해 면가의 90%만 환불액(D)으로 지급하고 10%는 잡이익(C)으로 계상합니다(미리보기로 확인 가능).'],
      ['환불일 선택 후 [일괄 처리]', '']
    ]);

    html += topic('gt-expiry', t('guide.expiry.title'), [
      ['만료 대기열 메뉴로 이동', 'FORECAST 테이블에서 올해 누적 전환 · 대기 중 · 향후 만료 예정 현황을 확인합니다.'],
      ['선택 처리 또는 전체 일괄 처리', '특정 건만 [선택 항목 인식 처리]하거나, [전체 연말 일괄 인식 처리]로 대기 중인 모든 건을 100% 잡이익(C)으로 일괄 마감합니다(상태 = \'잡이익 전환\').']
    ], '주로 분기 · 연말 회계 마감 시 수행하는 작업입니다.');

    html += topic('gt-grace', t('guide.grace.title'), [
      ['대상: 잡이익 전환된 서비스 증서', '이미 연말 잡이익으로 100% 마감된 서비스 증서에 한해, 발행일로부터 5년(소멸시효) 이내 고객이 예외적으로 사용을 요청하는 경우 적용합니다.'],
      ['증서 목록에서 대상 선택(상태 = \'잡이익 전환\') → [잡이익 환원]', '고객 사용일을 입력하면 완료됩니다.'],
      ['회계 처리 결과', '기존 100% 잡이익(C) 중 90%는 매출(B)로 반제 전환, 10%만 잡이익(C)으로 최종 확정됩니다. 원장(잡이익 원장)에 자동 기록되며 상태는 \'잡이익 환원\'으로 바뀝니다.']
    ], '⚠ Gift 상품권은 예외 규정이 없어 환원 불가하며, 발행일로부터 5년이 완전히 지난 서비스 증서도 소멸시효 완성으로 환원할 수 없습니다.');

    html += topic('gt-extend', t('guide.extend.title'), [
      ['만료 대기열 또는 증서 목록에서 [유효기간 연장]', '부득이한 사유로 만료 전 유효기간을 늘려줘야 할 때 사용합니다.'],
      ['새 만료일(미래 날짜) + Mate Approval # 입력', '관리자 승인번호를 함께 입력한 뒤 [연장]을 클릭합니다.'],
      ['결과', '만료 대기열에서 제외되며 다시 ACTIVE(유효) 상태로 복원됩니다.']
    ]);

    html += topic('gt-misc', t('guide.misc.title'), [
      ['정합성 점검', '차액 불일치 · 날짜 누락 등 회계 오류를 실시간으로 감지합니다. 오류 항목의 [수정]을 누르면 해당 증서 잠금이 풀려 즉시 고칠 수 있습니다.'],
      ['되돌리기 (Undo)', '상단 정보바의 [되돌리기]로 직전 작업(발행 · 사용 · 취소 등) 1단계를 즉시 복구합니다.'],
      ['감사 로그 · 이력 관리', '모든 데이터 변경은 전후 스냅샷과 함께 감사 로그에 영구 기록됩니다. 수동 수정 시 변경 사유 입력이 필수이며, 부서 공용 로그인으로 운영됩니다.'],
      ['가져오기 / 내보내기', '엑셀 원장을 업로드하거나 현재 데이터를 내보냅니다. 업로드 중 오류가 있는 건은 \'검토 필요\'로 자동 분류됩니다.']
    ]);

    html += '</div>';
    container.innerHTML = html;
  }

  return { render: render };
})();
