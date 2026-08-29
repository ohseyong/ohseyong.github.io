const tripDays=[
{date:'2026-08-28',day:'D1 · 금',place:'삿포로',lat:43.0618,lon:141.3545},
{date:'2026-08-29',day:'D2 · 토',place:'비에이',lat:43.5883,lon:142.4669},
{date:'2026-08-30',day:'D3 · 일',place:'샤코탄',lat:43.3000,lon:140.6000},
{date:'2026-08-31',day:'D4 · 월',place:'도야호',lat:42.6036,lon:140.8650},
{date:'2026-09-01',day:'D5 · 화',place:'노보리베츠',lat:42.4923,lon:141.1445}
];

const schedule=[
{key:'d1-flight',date:'2026-08-28',time:'11:10',title:'✈️ WE531 · 신치토세로 출발',desc:'PARATA AIR · ICN 11:10 → CTS 13:45',nav:false},
{key:'d1-arrive',date:'2026-08-28',time:'13:45',title:'🛬 신치토세공항 도착',desc:'입국·수하물 후 렌터카 셔틀',dest:'New Chitose Airport, Hokkaido, Japan',lat:42.7752,lon:141.6923,nav:false},
{key:'d1-rental',date:'2026-08-28',time:'15:00',title:'🚙 렌터카 수령 · 삿포로 출발',desc:'ETC·NOC 확인 후 출발',dest:'Sapporo, Hokkaido, Japan',lat:43.0618,lon:141.3545,nav:true},
{key:'d1-hotel',date:'2026-08-28',time:'16:30',title:'🏨 삿포로 숙소 체크인',desc:'차를 두고 중심가로 이동',dest:'Chateau Hiragishi Sapporo',lat:43.0324,lon:141.3740,nav:true},
{key:'d1-bic',date:'2026-08-28',time:'17:30',title:' 비ック카메라 삿포로 Apple Shop',desc:'현재 영업 중인 Apple Shop · 5층',dest:'Bic Camera Sapporo Apple Shop, Hokkaido',lat:43.0680,lon:141.3510,nav:true},
{key:'d1-oldapple',date:'2026-08-28',time:'18:10',title:' 구 Apple Store Sapporo 자리',desc:'2006–2016 직영점이 있던 자리',dest:'3-8-20 Minami 1 Jonishi, Chuo Ward, Sapporo, Hokkaido',lat:43.0589,lon:141.3519,nav:true,optional:true},
{key:'d1-city',date:'2026-08-28',time:'18:30',title:'🍜 오도리 · 다누키코지 · 스스키노',desc:'첫날 저녁과 야간 산책',dest:'Susukino, Sapporo, Hokkaido',lat:43.0554,lon:141.3534,nav:true},
{key:'d1-moiwa',date:'2026-08-28',time:'21:00',title:'🌃 모이와산 야경',desc:'시야가 좋고 체력이 남으면 선택',dest:'Mt. Moiwa Ropeway, Sapporo, Hokkaido',lat:43.0246,lon:141.3227,nav:true,optional:true},
{key:'d2-depart',date:'2026-08-29',time:'06:30',title:'🌅 삿포로 출발',desc:'핵심 코스는 사계채의 언덕으로 직행',dest:'Shikisai-no-Oka, Biei, Hokkaido',lat:43.5290,lon:142.4650,nav:true},
{key:'d2-tomita',date:'2026-08-29',time:'09:00',title:'🌼 Farm Tomita',desc:'계절 꽃과 후라노 풍경',dest:'Farm Tomita, Hokkaido',lat:43.4173,lon:142.4253,nav:true},
{key:'d2-shikisai',date:'2026-08-29',time:'10:30',title:'🌈 Shikisai-no-Oka',desc:'8월 말 꽃밭 핵심 포인트',dest:'Shikisai-no-Oka, Biei, Hokkaido',lat:43.5290,lon:142.4650,nav:true},
{key:'d2-lunch',date:'2026-08-29',time:'12:00',title:'🍛 비에이 점심',desc:'점심 후 핵심은 청의 호수 방향',dest:'Biei, Hokkaido',lat:43.5883,lon:142.4669,nav:true},
{key:'d2-patchwork',date:'2026-08-29',time:'13:00',title:'🌾 패치워크 로드',desc:'목적지보다 길 자체를 즐기기',dest:'Patchwork Road Biei, Hokkaido',lat:43.6044,lon:142.4446,nav:true},
{key:'d2-bluepond',date:'2026-08-29',time:'15:00',title:'💎 청의 호수',desc:'빛에 따라 달라지는 물빛',dest:'Shirogane Blue Pond, Biei, Hokkaido',lat:43.4935,lon:142.6140,nav:true},
{key:'d2-falls',date:'2026-08-29',time:'15:45',title:'💦 시라히게 폭포',desc:'청의 호수와 함께 묶기',dest:'Shirahige Falls, Biei, Hokkaido',lat:43.4743,lon:142.6391,nav:true},
{key:'d2-checkin',date:'2026-08-29',time:'17:30',title:'🏨 Furano Natulux Hotel 체크인',desc:'예약 확정 · JR 후라노역 앞 · 무료 주차',dest:'Furano Natulux Hotel, 1-35 Asahimachi, Furano, Hokkaido 076-0026, Japan',lat:43.347608,lon:142.390155,nav:true},
{key:'d2-ningle',date:'2026-08-29',time:'18:30',title:'🌲 Ningle Terrace',desc:'불 켜진 숲속 오두막 산책',dest:'Ningle Terrace, Furano, Hokkaido',lat:43.3235,lon:142.3573,nav:true},
{key:'d3-depart',date:'2026-08-30',time:'08:00',title:'☕ Furano Natulux Hotel 출발',desc:'아침을 늦추고 우니 영업시간에 맞춰 샤코탄으로',dest:'Bikuni, Shakotan, Hokkaido',lat:43.2950,lon:140.5960,nav:true},
{key:'d3-uni',date:'2026-08-30',time:'10:45',title:'🟠 샤코탄 생우니 점심',desc:'우니 영업·품절 변수가 있어 신카무이곶보다 먼저',dest:'Shakotan Uni Don, Bikuni, Hokkaido',lat:43.2985,lon:140.5988,nav:true},
{key:'d3-kamui',date:'2026-08-30',time:'12:10',title:'🌊 신카무이곶',desc:'12:10~13:20 핵심 풍경 · 강풍 통제 여부 먼저 확인',dest:'Cape Kamui, Shakotan, Hokkaido',lat:43.3340,lon:140.3470,nav:true},
{key:'d3-shimamui',date:'2026-08-30',time:'13:30',title:'🪨 시마무이 해안',desc:'기본 생략 · 체력과 시간이 충분할 때만',dest:'Shimamui Coast, Shakotan, Hokkaido',lat:43.2760,lon:140.4640,nav:true,optional:true},
{key:'d3-sakaimachi',date:'2026-08-30',time:'15:00',title:'🛍️ 오타루 사카이마치',desc:'15:00~16:30 · 르타오·롯카테이·키타카로 등 먼저',dest:'Sakaimachi Street, Otaru, Hokkaido',lat:43.1906,lon:141.0075,nav:true},
{key:'d3-canal',date:'2026-08-30',time:'17:15',title:'🌆 오타루 운하 · 일몰',desc:'17:15~18:30 · 해질 무렵부터 조명까지',dest:'Otaru Canal, Hokkaido',lat:43.1987,lon:140.9947,nav:true},
{key:'d3-dinner',date:'2026-08-30',time:'19:00',title:'🍣 오타루 스시 · 숙박',desc:'19:00 저녁 → 20:30 전후 운하 도보권 숙소 체크인',dest:'Sushi Otaru Hokkaido',lat:43.1907,lon:140.9947,nav:true},
{key:'d4-depart',date:'2026-08-31',time:'08:30',title:'🚙 오타루 출발',desc:'핵심 코스는 도야호로 바로 이동',dest:'Lake Toya, Hokkaido',lat:42.6036,lon:140.8650,nav:true},
{key:'d4-fukidashi',date:'2026-08-31',time:'10:15',title:'🏔️ 후키다시 공원',desc:'요테이산 자락에서 휴식',dest:'Fukidashi Park, Kyogoku, Hokkaido',lat:42.8582,lon:140.8707,nav:true},
{key:'d4-niseko',date:'2026-08-31',time:'11:30',title:'🥪 니세코 · 요테이산 드라이브',desc:'전망 좋은 길과 점심',dest:'Niseko, Hokkaido',lat:42.8048,lon:140.6874,nav:true},
{key:'d4-toya',date:'2026-08-31',time:'13:30',title:'💙 도야호',desc:'호숫가와 전망 포인트',dest:'Lake Toya, Hokkaido',lat:42.6036,lon:140.8650,nav:true},
{key:'d4-jigoku',date:'2026-08-31',time:'16:30',title:'🌋 노보리베츠 지옥계곡',desc:'체크인 전 가볍게 산책',dest:'Noboribetsu Jigokudani, Hokkaido',lat:42.4970,lon:141.1435,nav:true},
{key:'d4-ryokan',date:'2026-08-31',time:'17:30',title:'♨️ 노보리베츠 료칸',desc:'가이세키 + 노천탕으로 마무리',dest:'Noboribetsu Onsen, Hokkaido',lat:42.4923,lon:141.1445,nav:true},
{key:'d5-breakfast',date:'2026-09-01',time:'07:30',title:'🍚 조식 · 마지막 온천',desc:'체크아웃 준비',nav:false},
{key:'d5-morning',date:'2026-09-01',time:'08:30',title:'🌋 지옥계곡 · 오유누마',desc:'전날 못 봤다면 짧게',dest:'Oyunuma Pond, Noboribetsu, Hokkaido',lat:42.5017,lon:141.1550,nav:true,optional:true},
{key:'d5-depart',date:'2026-09-01',time:'09:45',title:'🚙 노보리베츠 출발',desc:'주유와 반납시간 확보',dest:'New Chitose Airport, Hokkaido',lat:42.7752,lon:141.6923,nav:true},
{key:'d5-returncar',date:'2026-09-01',time:'10:50',title:'⛽ 주유 · 렌터카 반납',desc:'영수증 보관 후 셔틀 이동',dest:'New Chitose Airport Rental Car, Hokkaido',lat:42.7752,lon:141.6923,nav:true},
{key:'d5-airport',date:'2026-09-01',time:'11:20',title:'🧳 신치토세공항 · 체크인',desc:'점심·쇼핑 후 탑승',dest:'New Chitose Airport, Hokkaido',lat:42.7752,lon:141.6923,nav:true},
{key:'d5-flight',date:'2026-09-01',time:'14:10',title:'✈️ WE532 · 인천으로 출발',desc:'CTS 14:10 → ICN 17:10',nav:false},
{key:'d5-arrive',date:'2026-09-01',time:'17:10',title:'🇰🇷 인천 도착',desc:'4박 5일 홋카이도 로드트립 종료',nav:false}
];

const stopMeta={
'd1-flight':{stay:'비행 2시간 35분',next:'입국·수하물 약 1시간 15분',nextName:'신치토세 도착'},
'd1-arrive':{stay:'약 1시간 15분',next:'약 15분',nextName:'렌터카 수령'},
'd1-rental':{stay:'약 30분',next:'🚗 약 1시간 10분',nextName:'삿포로 숙소'},
'd1-hotel':{stay:'약 30분',next:'🚇 약 25분',nextName:'BIC Apple Shop'},
'd1-bic':{stay:'약 30분',next:'🚶 약 15분',nextName:'구 Apple Store 자리'},
'd1-oldapple':{stay:'약 10분',next:'🚶 약 10분',nextName:'오도리·스스키노'},
'd1-city':{stay:'약 2시간',next:'🚇/🚕 약 30분',nextName:'모이와산'},
'd1-moiwa':{stay:'약 1시간',next:'🚕 약 25분',nextName:'숙소 복귀'},
'd2-depart':{stay:'-',next:'🚗 약 2시간 30분',nextName:'사계채의 언덕'},
'd2-tomita':{stay:'약 1시간',next:'🚗 약 35분',nextName:'사계채의 언덕'},
'd2-shikisai':{stay:'약 1시간 10분',next:'🚗 약 20분',nextName:'비에이 점심'},
'd2-lunch':{stay:'약 50분',next:'🚗 약 25분',nextName:'청의 호수'},
'd2-patchwork':{stay:'약 1시간 20분',next:'🚗 약 35분',nextName:'청의 호수'},
'd2-bluepond':{stay:'약 40분',next:'🚗 약 10분',nextName:'흰수염 폭포'},
'd2-falls':{stay:'약 25분',next:'🚗 약 50분',nextName:'Furano Natulux Hotel'},
'd2-checkin':{stay:'약 30분',next:'🚗 약 15분',nextName:'닝구르테라스'},
'd2-ningle':{stay:'약 1시간',next:'🚗 약 15분',nextName:'Furano Natulux Hotel 복귀'},
'd3-depart':{stay:'-',next:'🚗 약 2시간 45분',nextName:'샤코탄 우니'},
'd3-uni':{stay:'약 1시간',next:'🚗 약 25분',nextName:'신카무이곶'},
'd3-kamui':{stay:'약 1시간 10분',next:'🚗 약 1시간 40분',nextName:'오타루 사카이마치'},
'd3-shimamui':{stay:'약 25분',next:'🚗 약 1시간 30분',nextName:'오타루'},
'd3-sakaimachi':{stay:'약 1시간 30분',next:'🚶 약 10분',nextName:'오타루 운하'},
'd3-canal':{stay:'약 1시간 15분',next:'🚶 약 10분',nextName:'오타루 스시'},
'd3-dinner':{stay:'약 1시간 15분',next:'🚶/🚗 약 10분',nextName:'20:30 전후 숙소'},
'd4-depart':{stay:'-',next:'🚗 약 2시간 10분',nextName:'도야호'},
'd4-fukidashi':{stay:'약 45분',next:'🚗 약 30분',nextName:'니세코'},
'd4-niseko':{stay:'약 1시간 30분',next:'🚗 약 1시간 10분',nextName:'도야호'},
'd4-toya':{stay:'약 1시간 10분',next:'🚗 약 1시간 10분',nextName:'노보리베츠'},
'd4-jigoku':{stay:'약 45분',next:'🚗 약 10분',nextName:'료칸'},
'd4-ryokan':{stay:'저녁~숙박',next:'-',nextName:'다음날'},
'd5-breakfast':{stay:'약 1시간',next:'-',nextName:'노보리베츠 출발 준비'},
'd5-morning':{stay:'약 45분',next:'🚗 약 1시간',nextName:'신치토세 방향'},
'd5-depart':{stay:'-',next:'🚗 약 1시간',nextName:'렌터카 반납'},
'd5-returncar':{stay:'약 30분',next:'🚌 약 30분',nextName:'공항 터미널'},
'd5-airport':{stay:'약 2시간 30분',next:'✈️ 14:10 출발',nextName:'WE532'},
'd5-flight':{stay:'비행 약 3시간',next:'17:10',nextName:'인천 도착'},
'd5-arrive':{stay:'여행 종료',next:'-',nextName:''}
};

const optionMeta={
'd1-oldapple':{minutes:10,extra:'약 +10분',detour:'동선 변화 거의 없음',why:'개인 취향 성지순례라 시간이 없으면 바로 생략 가능'},
'd1-moiwa':{minutes:80,extra:'약 +1시간 20분',detour:'도심에서 별도 왕복',why:'야경은 좋지만 첫날 피로를 생각하면 선택'},
'd2-tomita':{minutes:70,extra:'약 +1시간 10분',detour:'우회 소',why:'8월 말에는 라벤더 절정이 지나 사계채의 언덕보다 우선순위가 낮음'},
'd2-patchwork':{minutes:80,extra:'약 +1시간 20분',detour:'우회 소',why:'드라이브 풍경은 좋지만 핵심 관광지 사이에서 가장 시간을 줄이기 쉬운 구간'},
'd3-shimamui':{minutes:35,extra:'약 +35분',detour:'동선 변화 거의 없음',why:'기본 생략 권장. 신카무이곶과 풍경 성격이 겹치고 오타루 시간을 확보하는 편이 이득'},
'd4-fukidashi':{minutes:45,extra:'약 +45분',detour:'우회 소',why:'요테이산 풍경은 좋지만 도야호·노보리베츠보다 우선순위는 낮음'},
'd4-niseko':{minutes:60,extra:'약 +1시간',detour:'우회 중',why:'드라이브 취향이면 좋지만 빼면 온천 도착이 훨씬 여유로워짐'},
'd5-morning':{minutes:45,extra:'약 +45분',detour:'우회 소',why:'귀국일은 공항 여유가 더 중요. 전날 지옥계곡을 봤다면 생략 권장'}
};

const bookingNights=[
{dayId:'day1',label:'삿포로',place:'Sapporo, Hokkaido, Japan',checkin:'2026-08-28',checkout:'2026-08-29'},
{dayId:'day2',label:'후라노',place:'Furano, Hokkaido, Japan',checkin:'2026-08-29',checkout:'2026-08-30'},
{dayId:'day3',label:'오타루',place:'Otaru Canal, Otaru, Hokkaido, Japan',checkin:'2026-08-30',checkout:'2026-08-31'},
{dayId:'day4',label:'노보리베츠',place:'Noboribetsu Onsen, Hokkaido, Japan',checkin:'2026-08-31',checkout:'2026-09-01'}
];

const routePoints=[
['신치토세공항',42.7752,141.6923],['삿포로',43.0618,141.3545],['BIC Apple Shop',43.0680,141.3510],['Farm Tomita',43.4173,142.4253],['Shikisai-no-Oka',43.5290,142.4650],['청의 호수',43.4935,142.6140],['Furano Natulux Hotel',43.347608,142.390155],['Ningle Terrace',43.3235,142.3573],['샤코탄 우니',43.2985,140.5988],['신카무이곶',43.3340,140.3470],['오타루',43.1987,140.9947],['후키다시 공원',42.8582,140.8707],['니세코',42.8048,140.6874],['도야호',42.6036,140.8650],['노보리베츠',42.4923,141.1445],['신치토세공항',42.7752,141.6923]
];

let map=null,myMarker=null,wakeLock=null,deferredPrompt=null,currentStop=null,toastTimer=null;
const $=id=>document.getElementById(id);
const todayISO=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const japanClock=()=>new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Tokyo',month:'short',day:'numeric',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date());
const dt=s=>new Date(`${s.date}T${s.time}:00+09:00`);
const isDone=s=>localStorage.getItem('hk-'+s.key)==='1';
const isOptional=s=>!!optionMeta[s.key];
function toast(msg){const el=$('toast');if(!el)return;el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2200)}
function wx(c){if(c===0)return['☀️','맑음'];if([1,2].includes(c))return['🌤️','대체로 맑음'];if(c===3)return['☁️','흐림'];if([45,48].includes(c))return['🌫️','안개'];if([51,53,55,56,57].includes(c))return['🌦️','이슬비'];if([61,63,65,66,67,80,81,82].includes(c))return['🌧️','비'];if([71,73,75,77,85,86].includes(c))return['🌨️','눈'];if([95,96,99].includes(c))return['⛈️','뇌우'];return['🌥️','변동']}
function renderWeatherLoading(){const now=todayISO();$('weatherGrid').innerHTML=tripDays.map((d,i)=>`<div class="weather ${d.date===now?'today':''}"><div class="day">${d.day}</div><div class="place">${d.place}</div><div class="loading" id="w${i}">불러오는 중…</div></div>`).join('')}
async function loadOneWeather(d,i){const url=`https://api.open-meteo.com/v1/forecast?latitude=${d.lat}&longitude=${d.lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset&timezone=Asia%2FTokyo&forecast_days=16`;try{const r=await fetch(url);if(!r.ok)throw new Error();const j=await r.json();const x=j.daily.time.indexOf(d.date);if(x<0)throw new Error();const [icon,label]=wx(j.daily.weather_code[x]),wind=Math.round(j.daily.wind_speed_10m_max[x]),rain=j.daily.precipitation_probability_max[x],sun=(j.daily.sunset[x]||'').slice(11,16);let risk='';if(d.place==='샤코탄'&&wind>=25)risk='<div class="risk">💨 강풍 가능 · 곶 개방 확인</div>';else if(rain>=60)risk='<div class="risk">☔ 우천 대비</div>';$('w'+i).outerHTML=`<div id="w${i}"><div class="wx" title="${label}">${icon}</div><div class="temp">${Math.round(j.daily.temperature_2m_max[x])}° / ${Math.round(j.daily.temperature_2m_min[x])}°</div><div class="rain">☔ ${rain}% · ${label}</div><div class="wind">💨 ${wind} km/h</div><div class="sun">🌇 ${sun}</div>${risk}</div>`}catch(e){$('w'+i).innerHTML='날씨 조회 실패<br><small>다시 갱신해보세요</small>'}}
function refreshWeather(){renderWeatherLoading();tripDays.forEach(loadOneWeather)}
function restoreDone(){document.querySelectorAll('.stop[data-key]').forEach(el=>{if(localStorage.getItem('hk-'+el.dataset.key)==='1')el.classList.add('done')})}
function toggleDone(btn){const el=btn.closest('.stop');el.classList.toggle('done');localStorage.setItem('hk-'+el.dataset.key,el.classList.contains('done')?'1':'0');updateNowCard();updateProgress()}
function markToday(){const now=todayISO();document.querySelectorAll('.day-card').forEach(c=>c.classList.toggle('current',c.dataset.date===now))}
function daySchedule(date){return schedule.filter(s=>s.date===date).sort((a,b)=>dt(a)-dt(b))}
function getCurrentStop(){const now=new Date(),today=todayISO();if(today<'2026-08-28')return schedule.find(s=>!isOptional(s))||schedule[0];if(today>'2026-09-01')return null;const list=daySchedule(today).filter(s=>!isDone(s)&&!isOptional(s));if(!list.length)return null;return list.find(s=>dt(s)>=new Date(now.getTime()-45*60000))||list[list.length-1]}
function countdownTo(date){let ms=date-new Date();if(ms<=0)return '지금';const min=Math.floor(ms/60000),d=Math.floor(min/1440),h=Math.floor((min%1440)/60),m=min%60;if(d)return `${d}일 ${h}시간`;if(h)return `${h}시간 ${m}분`;return `${m}분`}
function updateNowCard(){currentStop=getCurrentStop();$('nowClock').textContent=japanClock();if(!currentStop){$('nowTitle').textContent=todayISO()>'2026-09-01'?'🏁 여행 완료':'✅ 오늘 핵심 일정 완료';$('nowDesc').textContent=todayISO()>'2026-09-01'?'홋카이도 로드트립 종료.':'핵심 일정은 끝났습니다. OPTION은 체력·날씨가 좋을 때만 추가하세요.';$('nowNavBtn').style.display='none';$('nowJumpBtn').style.display='none'}else{$('nowTitle').textContent=currentStop.title;$('nowDesc').textContent=`${currentStop.time} · ${countdownTo(dt(currentStop))} · ${currentStop.desc}`;$('nowNavBtn').style.display=currentStop.nav?'inline-block':'none';$('nowJumpBtn').style.display='inline-block'}const ret=new Date('2026-09-01T14:10:00+09:00');$('returnCountdown').textContent=new Date()<ret?`귀국편까지 ${countdownTo(ret)}`:'출발 시간 경과'}
function updateProgress(){const core=schedule.filter(s=>!isOptional(s)),done=core.filter(isDone).length,pct=Math.round(done/core.length*100);$('progressFill').style.width=pct+'%';$('progressText').textContent=`핵심 일정 ${done}/${core.length} 완료 · ${pct}%`}
function jumpToday(e){if(e)e.preventDefault();const card=[...document.querySelectorAll('.day-card')].find(c=>c.dataset.date===todayISO())||$('day1');card.scrollIntoView({behavior:'smooth',block:'start'})}
function jumpToCurrentStop(){if(!currentStop)currentStop=getCurrentStop();if(!currentStop)return;const el=$('stop-'+currentStop.key);if(el)el.scrollIntoView({behavior:'smooth',block:'center'})}
function haversine(a,b,c,d){const R=6371,rad=x=>x*Math.PI/180,p=rad(c-a),q=rad(d-b),v=Math.sin(p/2)**2+Math.cos(rad(a))*Math.cos(rad(c))*Math.sin(q/2)**2;return 2*R*Math.asin(Math.sqrt(v))}
function navigateNext(){currentStop=getCurrentStop();if(!currentStop){toast('남은 핵심 일정이 없습니다');return}if(!currentStop.nav){jumpToCurrentStop();return}const fallback=()=>window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(currentStop.dest)}&travelmode=driving`,'_blank');if(!navigator.geolocation){fallback();return}$('gpsNote').textContent='현재 위치 확인 중…';navigator.geolocation.getCurrentPosition(p=>{const a=p.coords.latitude,b=p.coords.longitude,km=(currentStop.lat&&currentStop.lon)?haversine(a,b,currentStop.lat,currentStop.lon):null;$('gpsNote').textContent=km?`다음 핵심 목적지까지 직선거리 약 ${km.toFixed(km<10?1:0)} km`:'현재 위치 반영됨';window.open(`https://www.google.com/maps/dir/?api=1&origin=${a},${b}&destination=${encodeURIComponent(currentStop.dest)}&travelmode=driving`,'_blank')},()=>{toast('위치 권한 없이 목적지만 엽니다');fallback()},{enableHighAccuracy:true,timeout:7000,maximumAge:60000})}
async function showMyWeather(){if(!navigator.geolocation){toast('위치 기능을 지원하지 않습니다');return}const box=$('liveWeather');box.classList.add('show');box.textContent='현재 날씨 확인 중…';navigator.geolocation.getCurrentPosition(async p=>{try{const lat=p.coords.latitude,lon=p.coords.longitude,r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation&timezone=Asia%2FTokyo`),j=await r.json(),[icon,label]=wx(j.current.weather_code);box.innerHTML=`<b>${icon} ${label}</b> · ${Math.round(j.current.temperature_2m)}°C · 체감 ${Math.round(j.current.apparent_temperature)}°C · 바람 ${Math.round(j.current.wind_speed_10m)} km/h`}catch(e){box.textContent='현재 날씨를 불러오지 못했습니다.'}},()=>box.textContent='위치 권한이 필요합니다.',{enableHighAccuracy:true,timeout:7000,maximumAge:60000})}
function openNearby(query){const go=(a,b)=>window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query+' near '+a+','+b)}`,'_blank');if(!navigator.geolocation){window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query+' near me')}`,'_blank');return}navigator.geolocation.getCurrentPosition(p=>go(p.coords.latitude,p.coords.longitude),()=>window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query+' near me')}`,'_blank'),{timeout:5000,maximumAge:60000})}
function googleSearchUrl(query){return `https://www.google.com/search?q=${encodeURIComponent(query)}`}
function bookingSearchUrl(night){const u=new URL('https://www.booking.com/searchresults.html');u.searchParams.set('ss',night.place);u.searchParams.set('checkin',night.checkin);u.searchParams.set('checkout',night.checkout);u.searchParams.set('group_adults','2');u.searchParams.set('no_rooms','1');u.searchParams.set('group_children','0');return u.toString()}
function formatMinutes(min){if(min<60)return `${min}분`;const h=Math.floor(min/60),m=min%60;return m?`${h}시간 ${m}분`:`${h}시간`}
function injectOptionStyles(){if(document.getElementById('option-style'))return;const style=document.createElement('style');style.id='option-style';style.textContent=`.option-stop{background:#fafafa}.option-strip{display:flex;gap:5px;flex-wrap:wrap;align-items:center;margin:6px 0 5px}.option-strip .ob{font-size:8px;font-weight:900;letter-spacing:.05em;color:#fff;background:#6b7280;border-radius:5px;padding:4px 6px}.option-strip .oe{font-size:9px;font-weight:850;color:#92400e;background:#fff7ed;border-radius:6px;padding:4px 6px}.option-strip .od{font-size:9px;color:#6b7280;background:#f3f4f6;border-radius:6px;padding:4px 6px}.option-why{font-size:9px;line-height:1.45;color:#737373;margin:0 0 7px}.day-option-summary{font-size:9px;color:#525252;background:#f7f7f7;border-radius:7px;padding:7px 8px;margin-top:8px}.day-option-summary b{color:#111827}.day-option-summary .saved{color:#92400e;font-weight:850}.option-legend{font-size:9px;color:#6b7280;margin:4px 0 7px}.option-legend b{color:#111827}`;document.head.appendChild(style)}
function initOptionPlan(){injectOptionStyles();const head=document.querySelector('#itinerary .section-head');if(head){const p=head.querySelector('p');if(p)p.textContent='핵심 우선 · OPTION은 선택';if(!document.querySelector('.option-legend')){const l=document.createElement('div');l.className='option-legend';l.innerHTML='<b>기본은 핵심 코스만.</b> OPTION은 추가시간과 우회 정도를 보고 현장에서 결정하세요.';head.insertAdjacentElement('afterend',l)}}Object.entries(optionMeta).forEach(([key,m])=>{const el=$('stop-'+key);if(!el)return;el.classList.add('option-stop');const main=el.querySelector('.stop-main');if(!main||main.querySelector('.option-strip'))return;const strip=document.createElement('div');strip.className='option-strip';strip.innerHTML=`<span class="ob">OPTION</span><span class="oe">${m.extra}</span><span class="od">${m.detour}</span>`;const title=main.querySelector('.stop-title');if(title)title.insertAdjacentElement('afterend',strip);const why=document.createElement('div');why.className='option-why';why.textContent=m.why;strip.insertAdjacentElement('afterend',why)});document.querySelectorAll('.day-card').forEach(day=>{if(day.querySelector('.day-option-summary'))return;const date=day.dataset.date,opts=schedule.filter(s=>s.date===date&&optionMeta[s.key]);if(!opts.length)return;const minutes=opts.reduce((sum,s)=>sum+optionMeta[s.key].minutes,0);const names=opts.map(s=>s.title.replace(/^[^\w가-힣]+\s*/,'')).join(' · ');const box=document.createElement('div');box.className='day-option-summary';box.innerHTML=`<b>핵심만 가면</b> OPTION ${opts.length}개 생략 → <span class="saved">약 ${formatMinutes(minutes)} 여유</span><br>${names}`;const actions=day.querySelector('.day-actions');if(actions)actions.insertAdjacentElement('afterend',box)})}
function initTimingMeta(){const byKey=Object.fromEntries(schedule.map(s=>[s.key,s]));const head=document.querySelector('#itinerary .section-head');if(head&&!document.querySelector('.timing-note')){const note=document.createElement('div');note.className='timing-note';note.textContent='체류·이동시간은 평시 기준 예상치 · 실제 교통은 Google Maps 우선';const legend=document.querySelector('.option-legend');(legend||head).insertAdjacentElement('afterend',note)}document.querySelectorAll('.stop[data-key]').forEach(el=>{const s=byKey[el.dataset.key],m=stopMeta[el.dataset.key],main=el.querySelector('.stop-main');if(!s||!m||!main||main.querySelector('.timing-row'))return;const row=document.createElement('div');row.className='timing-row';const stay=m.stay&&m.stay!=='-'?`<span class="timing-stay">⏱ 체류 ${m.stay}</span>`:'';const move=m.next&&m.next!=='-'?`<span class="timing-move">→ ${m.nextName} · ${m.next}</span>`:'';row.innerHTML=stay+move;const anchor=main.querySelector('.option-why')||main.querySelector('.stop-title');if(anchor)anchor.insertAdjacentElement('afterend',row);else main.prepend(row)})}
function initSearchButtons(){const byKey=Object.fromEntries(schedule.map(s=>[s.key,s]));document.querySelectorAll('.stop[data-key]').forEach(el=>{const s=byKey[el.dataset.key];if(!s||!s.dest)return;const main=el.querySelector('.stop-main');if(!main)return;let links=main.querySelector('.map-links');if(!links){links=document.createElement('div');links.className='map-links';main.appendChild(links)}if(!links.querySelector('[data-google-search]')){const a=document.createElement('a');a.dataset.googleSearch='1';a.target='_blank';a.rel='noopener';a.href=googleSearchUrl(s.dest);a.textContent='검색';links.appendChild(a)}});bookingNights.forEach(n=>{const day=$(n.dayId),actions=day&&day.querySelector('.day-actions');if(!actions||actions.querySelector('[data-booking-search]'))return;const a=document.createElement('a');a.dataset.bookingSearch='1';a.className='pill booking-btn';a.target='_blank';a.rel='noopener';a.href=bookingSearchUrl(n);a.textContent=`🏨 ${n.label} 숙소`;a.title=`Booking.com · ${n.checkin} → ${n.checkout} · 성인 2명`;actions.appendChild(a)})}
function applyDay3Revision(){const order=['d3-depart','d3-uni','d3-kamui','d3-shimamui','d3-sakaimachi','d3-canal','d3-dinner'],box=$('day3')&&$('day3').querySelector('.stops');if(box)order.forEach(k=>{const el=$('stop-'+k);if(el)box.appendChild(el)});const byKey=Object.fromEntries(schedule.map(s=>[s.key,s]));order.forEach(k=>{const el=$('stop-'+k),s=byKey[k];if(!el||!s)return;const t=el.querySelector('.time'),h=el.querySelector('.stop-title h3'),d=el.querySelector('.desc');if(t)t.textContent=s.time;if(h)h.textContent=s.title;if(d)d.textContent=s.desc});const day=$('day3');if(day){const sub=day.querySelector('.day-sub');if(sub)sub.textContent='08:00 출발 · 우니 먼저 → 신카무이곶 → 오타루. 시마무이는 기본 생략.';const route=day.querySelector('.day-actions .pill.primary');if(route){route.href='https://www.google.com/maps/dir/?api=1&origin=Furano+Natulux+Hotel&destination=Otaru+Canal&waypoints=Bikuni+Shakotan%7CCape+Kamui%7CSakaimachi+Street+Otaru&travelmode=driving';route.textContent='오늘 핵심 경로'}}}
function applyConfirmedHotels(){const el=$('stop-d2-checkin');if(el){const h=el.querySelector('.stop-title h3');const d=el.querySelector('.desc');if(h)h.textContent='🏨 Furano Natulux Hotel 체크인';if(d)d.textContent='예약 확정 · JR 후라노역 도보 1~2분 · 무료 주차 · 체크인 15:00 / 체크아웃 10:00.';const main=el.querySelector('.stop-main');let links=main&&main.querySelector('.map-links');if(main&&!links){links=document.createElement('div');links.className='map-links';main.appendChild(links)}if(links&&!links.querySelector('[data-hotel-map]')){const a=document.createElement('a');a.dataset.hotelMap='1';a.target='_blank';a.rel='noopener';a.href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent('Furano Natulux Hotel, 1-35 Asahimachi, Furano, Hokkaido');a.textContent='지도';links.prepend(a)}}const hotel2=document.querySelector('[data-field="hotel2"]');const memo2=document.querySelector('[data-field="hotel2memo"]');if(hotel2&&!localStorage.getItem('hk-field-hotel2'))hotel2.value='Furano Natulux Hotel · 예약 확정';if(memo2&&!localStorage.getItem('hk-field-hotel2memo'))memo2.value='8/29 체크인 · 무료 주차 · JR 후라노역 앞 · 체크아웃 10:00'}
function initMap(){map=L.map('map',{scrollWheelZoom:false}).setView([43.05,141.4],7);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap'}).addTo(map);const ll=[];routePoints.forEach((p,i)=>{ll.push([p[1],p[2]]);const icon=L.divIcon({className:'',html:`<div class="num-marker">${i+1}</div>`,iconSize:[28,28],iconAnchor:[14,14]});L.marker([p[1],p[2]],{icon}).addTo(map).bindPopup(`<b>${p[0]}</b><br><a target="_blank" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p[0]+' Hokkaido')}">지도</a> · <a target="_blank" href="${googleSearchUrl(p[0]+' Hokkaido')}">검색</a>`)});L.polyline(ll,{color:'#334155',weight:3,opacity:.65,dashArray:'7 7'}).addTo(map);map.fitBounds(ll,{padding:[24,24]})}
function locateOnMap(){if(!navigator.geolocation){toast('위치 기능 미지원');return}navigator.geolocation.getCurrentPosition(p=>{const ll=[p.coords.latitude,p.coords.longitude];if(myMarker)myMarker.setLatLng(ll);else myMarker=L.circleMarker(ll,{radius:7,color:'#111827',fillColor:'#fff',fillOpacity:1}).addTo(map).bindPopup('현재 위치');map.setView(ll,11);myMarker.openPopup()},()=>toast('위치 권한이 필요합니다'),{enableHighAccuracy:true,timeout:7000,maximumAge:60000})}
async function sharePlan(){const data={title:'홋카이도 4박 5일 여행 플래너',text:'홋카이도 렌터카 여행 일정',url:location.href};try{if(navigator.share)await navigator.share(data);else{await navigator.clipboard.writeText(location.href);toast('링크를 복사했습니다')}}catch(e){}}
async function copyText(text){try{await navigator.clipboard.writeText(text);toast('복사했습니다')}catch(e){toast('복사하지 못했습니다')}}
async function toggleWakeLock(){if(!('wakeLock' in navigator)){toast('화면 유지 기능 미지원');return}try{if(wakeLock){await wakeLock.release();wakeLock=null;$('wakeBtn').innerHTML='<span>☀️</span>화면 유지'}else{wakeLock=await navigator.wakeLock.request('screen');$('wakeBtn').innerHTML='<span>🌞</span>유지 중';toast('화면을 켜둡니다')}}catch(e){toast('화면 유지 권한을 얻지 못했습니다')}}
function initNotes(){document.querySelectorAll('[data-note]').forEach(el=>{const k='hk-note-'+el.dataset.note;el.value=localStorage.getItem(k)||'';el.addEventListener('input',()=>localStorage.setItem(k,el.value))});document.querySelectorAll('[data-field]').forEach(el=>{const k='hk-field-'+el.dataset.field,existing=localStorage.getItem(k);if(existing!==null)el.value=existing;el.addEventListener('input',()=>localStorage.setItem(k,el.value))})}
function resetTrip(){if(!confirm('방문 체크와 메모를 모두 초기화할까요?'))return;Object.keys(localStorage).filter(k=>k.startsWith('hk-')).forEach(k=>localStorage.removeItem(k));location.reload()}
function onlineState(){const on=navigator.onLine;$('onlineDot').classList.toggle('off',!on);$('onlineText').textContent=on?'온라인':'오프라인'}
function installApp(){if(deferredPrompt){deferredPrompt.prompt();deferredPrompt.userChoice.finally(()=>deferredPrompt=null)}else toast('브라우저 메뉴에서 홈 화면에 추가할 수 있습니다')}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('installBtn').style.display='block'});
window.addEventListener('online',onlineState);window.addEventListener('offline',onlineState);
document.addEventListener('visibilitychange',async()=>{if(wakeLock&&document.visibilityState==='visible')try{wakeLock=await navigator.wakeLock.request('screen')}catch(e){}});
document.addEventListener('DOMContentLoaded',()=>{refreshWeather();restoreDone();markToday();applyDay3Revision();initOptionPlan();initTimingMeta();initSearchButtons();initNotes();applyConfirmedHotels();initMap();updateNowCard();updateProgress();onlineState();setInterval(updateNowCard,60000);if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{})});