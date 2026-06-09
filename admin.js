// ── Supabase 설정 (game.js와 동일하게 입력하세요) ──
var SUPABASE_URL = 'https://ypdiwxklslaeqxjcwtzs.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwZGl3eGtsc2xhZXF4amN3dHpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5ODA0ODUsImV4cCI6MjA5NjU1NjQ4NX0.xkUGLsL8WKwskm0kqZymsdawowZvn2N9lBVj1e2-eB4';

function openAdmin(){
  var id = prompt('아이디');
  if(id !== 'kill'){ alert('아이디 또는 비밀번호가 틀렸습니다.'); return; }
  var pw = prompt('비밀번호');
  if(pw !== 'thecompany'){ alert('아이디 또는 비밀번호가 틀렸습니다.'); return; }
  // 로그인 상태 저장 (24시간)
  var expire = Date.now() + 24*60*60*1000;
  sessionStorage.setItem('ktc_admin', expire);
  showAdminPage();
}
 
function showAdminPage(){
  fetch(SUPABASE_URL + '/rest/v1/ktc_logs?order=start_time.desc', {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY
    }
  })
  .then(function(res){ return res.json(); })
  .then(function(logs){ renderAdmin(logs); })
  .catch(function(e){
    alert('데이터를 불러오지 못했습니다. Supabase 설정을 확인하세요.');
    console.error(e);
  });
}
 
function renderAdmin(logs){
  function gc(g){ return g==='S'||g==='A'?'#00aa44':g==='B'?'#ff9900':'#cc3333'; }
 
  function clueInfo(l){
    var c = typeof l.collected === 'string' ? JSON.parse(l.collected||'{}') : (l.collected||{});
    var correct = Object.keys(c).filter(function(id){ return c[id].correct; });
    var wrong = Object.keys(c).filter(function(id){ return !c[id].correct; });
    return '정답 '+correct.length+'개('+correct.join(',')+') / 오답 '+wrong.length+'개';
  }
 
  function choiceInfo(l){
    var ch = typeof l.choices === 'string' ? JSON.parse(l.choices||'{}') : (l.choices||{});
    return Object.entries(ch).map(function(e){
      var label = e[1] && e[1].score>0 ? '혁신O' : '혁신X';
      return 'CLU-'+e[0]+':'+label;
    }).join(' / ');
  }
 
  var rows = logs.map(function(l,i){
    return [
      '<tr>',
      '<td>'+(i+1)+'</td>',
      '<td style="font-weight:700">'+l.name+'</td>',
      '<td>'+(l.start_time?new Date(l.start_time).toLocaleString('ko-KR'):'-')+'</td>',
      '<td>'+Math.floor((l.total_sec||0)/60)+'분 '+((l.total_sec||0)%60)+'초</td>',
      '<td style="font-size:24px;font-weight:900;color:'+gc(l.grade)+'">'+l.grade+'</td>',
      '<td style="font-weight:700">'+l.score+'점</td>',
      '<td style="font-size:11px">'+clueInfo(l)+'</td>',
      '<td style="font-size:11px;line-height:1.8">'+choiceInfo(l)+'</td>',
      '</tr>'
    ].join('');
  }).join('');
 
  var adminHtml = [
    '<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    '<title>Kill The Company — 관리자</title>',
    '<style>',
    'body{font-family:sans-serif;padding:16px;background:#f4f4f4;font-size:14px}',
    'h1{font-size:18px;margin-bottom:4px}',
    '.sub{font-size:12px;color:#888;margin-bottom:14px}',
    'table{border-collapse:collapse;width:100%;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.1)}',
    'th{background:#222;color:#fff;padding:9px 11px;text-align:left;font-size:12px;letter-spacing:.04em;white-space:nowrap}',
    'td{padding:9px 11px;border-bottom:1px solid #eee;vertical-align:top}',
    'tr:hover td{background:#f9f9f9}',
    '.summary{display:flex;gap:12px;margin-bottom:14px;flex-wrap:wrap}',
    '.sum-box{background:#fff;border-radius:8px;padding:12px 16px;box-shadow:0 1px 4px rgba(0,0,0,.08);min-width:100px;text-align:center}',
    '.sum-num{font-size:24px;font-weight:700}',
    '.sum-lbl{font-size:11px;color:#888;margin-top:2px}',
    '.btn-refresh{margin-bottom:14px;padding:8px 18px;background:#222;color:#fff;border:none;cursor:pointer;border-radius:6px;font-size:13px;margin-right:8px}',
    '.btn-logout{margin-bottom:14px;padding:8px 18px;background:#888;color:#fff;border:none;cursor:pointer;border-radius:6px;font-size:13px}',
    '</style></head><body>',
    '<h1>Kill The Company — 플레이 로그</h1>',
    '<div class="sub">총 '+logs.length+'건의 플레이 기록</div>',
  ].join('');
 
  if(logs.length > 0){
    var avg = Math.round(logs.reduce(function(a,b){return a+(b.score||0);},0)/logs.length);
    var sCount = logs.filter(function(l){return l.grade==='S'||l.grade==='A';}).length;
    adminHtml += [
      '<div class="summary">',
      '<div class="sum-box"><div class="sum-num">'+logs.length+'</div><div class="sum-lbl">총 플레이</div></div>',
      '<div class="sum-box"><div class="sum-num" style="color:#00aa44">'+sCount+'</div><div class="sum-lbl">성공(S/A)</div></div>',
      '<div class="sum-box"><div class="sum-num">'+(logs.length-sCount)+'</div><div class="sum-lbl">실패(B~D)</div></div>',
      '<div class="sum-box"><div class="sum-num">'+avg+'</div><div class="sum-lbl">평균 점수</div></div>',
      '</div>'
    ].join('');
  }
 
  adminHtml += [
    '<button class="btn-refresh" onclick="location.reload()">🔄 새로고침</button>',
    '<button class="btn-logout" onclick="sessionStorage.removeItem(\'ktc_admin\');location.reload()">로그아웃</button>',
    '<table><thead><tr>',
    '<th>#</th><th>이름</th><th>접속시각</th><th>플레이시간</th><th>등급</th><th>점수</th><th>클루 수집</th><th>해결 선택</th>',
    '</tr></thead><tbody>',
    (rows || '<tr><td colspan="8" style="text-align:center;color:#999;padding:20px">아직 플레이 기록이 없습니다</td></tr>'),
    '</tbody></table>',
    '</body></html>'
  ].join('');
 
  document.open(); document.write(adminHtml); document.close();
}
 
// ── URL 파라미터로 관리자 직접 접근: ?smilevalue ──
(function(){
  if(location.search.indexOf('smilevalue') < 0) return;
  // 이미 로그인된 상태면 바로 진입
  var saved = sessionStorage.getItem('ktc_admin');
  if(saved && Date.now() < parseInt(saved)){
    showAdminPage();
    return;
  }
  var id = prompt('아이디');
  if(id !== 'kill'){ alert('아이디 또는 비밀번호가 틀렸습니다.'); return; }
  var pw = prompt('비밀번호');
  if(pw !== 'thecompany'){ alert('아이디 또는 비밀번호가 틀렸습니다.'); return; }
  var expire = Date.now() + 24*60*60*1000;
  sessionStorage.setItem('ktc_admin', expire);
  showAdminPage();
})();
