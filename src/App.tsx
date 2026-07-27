import { useEffect, useRef, useState } from "react";
import {
  ArrowRight, BarChart3, CalendarDays, Check, ChevronRight,
  Crown, Gauge, Image as ImageIcon, Info, Medal, RotateCcw, Share2,
  Shield, Sparkles, Swords, Trophy, Users
} from "lucide-react";
import { Link, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { formations, playerById } from "./data/football";
import attributions from "./data/imageAttributions.json";
import {
  calculateScore, chemistry, generateOpponent, getDraftOffer, nextStage,
  reachedStage, squadMetrics
} from "./game/engine";
import type {
  FormationId, Intensity, MatchResult, Player, PlayMode, Position, TacticStyle, TournamentStage
} from "./game/types";
import { copy, positionLabels, positionShortLabels } from "./i18n/ru";
import { fetchLeaderboard, isCloudLeaderboard, startDailyAttempt, submitRun } from "./services/leaderboard";
import { useGame } from "./state/GameContext";

const formationIds = Object.keys(formations) as FormationId[];
const stageLabels: Record<TournamentStage, string> = {
  group: "Группа", r16: "1/8 финала", qf: "1/4 финала", sf: "Полуфинал", final: "Финал", champion: "Чемпион"
};
const styleLabels: Record<TacticStyle, string> = { possession: "Контроль мяча", press: "Высокий пресс", counter: "Контратака" };
const intensityLabels: Record<Intensity, string> = { low: "Низкая", normal: "Обычная", high: "Высокая" };

function matchOutcome(match: MatchResult) {
  if (match.won) return { label: "Победа", className: "win" };
  if (match.goalsFor === match.goalsAgainst) return { label: "Ничья", className: "draw" };
  return { label: "Поражение", className: "loss" };
}

function Logo() {
  return <Link className="logo" to="/" aria-label="Era XI — на главную"><span>ERA</span><b>XI</b></Link>;
}

function Shell({ children }: { children: React.ReactNode }) {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return <div className="app-shell">
    <header className="site-header">
      <Logo />
      <nav aria-label="Основная навигация">
        <Link to="/leaderboard"><BarChart3 size={18} /> <span>Лидеры</span></Link>
        <Link to="/credits"><Info size={18} /> <span>О проекте</span></Link>
      </nav>
    </header>
    {!online && <div className="offline-banner" role="status">Офлайн-режим · тренировка и активный забег доступны</div>}
    <main>{children}</main>
    <footer><span>© 2026 Era XI</span><span>Независимый фан-проект. Не связан с FIFA, UEFA, клубами или EA.</span></footer>
  </div>;
}

function Home() {
  const { nickname, setNickname, run } = useGame();
  const validNickname = /^[\p{L}\p{N}_-]{3,16}$/u.test(nickname);
  return <Shell>
    <section className="hero">
      <div className="hero-copy">
        <span className="eyebrow"><CalendarDays size={16} /> Один seed на весь мир</span>
        <h1>Собери свою<br/><em>футбольную эпоху.</em></h1>
        <p>11 решений. Культовые клубы. Семь матчей до кубка. Здесь выигрывает не самый громкий состав, а тот, кто понимает систему.</p>
        <label className="nickname-field">
          <span>Твой ник в таблице</span>
          <input value={nickname} maxLength={16} onChange={(event) => setNickname(event.target.value)}
            placeholder="например, regista" aria-describedby="nickname-help" />
          <small id="nickname-help">{nickname && !validNickname ? "От 3 до 16 букв, цифр, _ или -" : "Без регистрации. Можно изменить позже."}</small>
        </label>
        <div className="hero-actions">
          <Link className={`button primary ${!validNickname ? "disabled" : ""}`} aria-disabled={!validNickname}
            onClick={(event) => !validNickname && event.preventDefault()} to="/formation/daily">
            <CalendarDays size={19} /> Daily Challenge <ArrowRight size={19} />
          </Link>
          <Link className={`button ghost ${!validNickname ? "disabled" : ""}`} aria-disabled={!validNickname}
            onClick={(event) => !validNickname && event.preventDefault()} to="/formation/training">
            <RotateCcw size={18} /> Тренировка
          </Link>
        </div>
        {run && !run.completed && <Link className="resume-link" to={run.pickedPlayerIds.length < 11 ? "/draft" : "/match"}>
          Продолжить забег · {run.pickedPlayerIds.length}/11 <ChevronRight size={17}/>
        </Link>}
      </div>
      <div className="hero-visual" aria-label="Пример футбольной карточки">
        <div className="stadium-ring" />
        <div className="hero-card card-back">
          <span>CLUB ERA</span><b>11</b><small>THE DRAFT</small>
        </div>
        <div className="hero-card card-front">
          <div className="card-number">10</div>
          <div className="silhouette"><Users size={120} strokeWidth={0.75}/></div>
          <span className="card-kicker">YOUR ERA</span>
          <strong>THE NEXT<br/>ICONIC XI</strong>
          <div className="card-stats"><span>FIT 94</span><span>CHEM 88</span></div>
        </div>
        <div className="floating-stat top"><Trophy size={16}/> 7 матчей</div>
        <div className="floating-stat bottom"><Sparkles size={16}/> 24 эпохи</div>
      </div>
    </section>
    <section className="feature-strip">
      <article><span>01</span><div><b>Собери состав</b><p>На каждую позицию — пять подходящих игроков из культовых эпох.</p></div></article>
      <article><span>02</span><div><b>Строй систему</b><p>Позиции, формация и реальные связи меняют силу.</p></div></article>
      <article><span>03</span><div><b>Играй турнир</b><p>Тактика и усталость решают, доберёшься ли до финала.</p></div></article>
    </section>
  </Shell>;
}

function FormationPage() {
  const { mode = "training" } = useParams();
  const playMode = mode as PlayMode;
  const { start } = useGame();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<FormationId>("4-3-3");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  async function begin() {
    setLoading(true);
    setNotice("");
    try {
      let seed: string | undefined;
      if (playMode === "daily") {
        try { seed = await startDailyAttempt(); }
        catch { setNotice("Сервер Daily недоступен — забег продолжится локально с тем же дневным seed."); }
      }
      start(playMode, selected, seed);
      navigate("/draft");
    } finally { setLoading(false); }
  }
  return <Shell><section className="page narrow">
    <span className="eyebrow">{playMode === "daily" ? "Daily Challenge" : "Свободная игра"} · Шаг 1</span>
    <h1>{copy.chooseFormation}</h1>
    <p className="lead">Это стартовый план. Перед каждым матчем его можно изменить, но знакомая футболистам система даст больше химии.</p>
    <div className="formation-grid">
      {formationIds.map((id) => <button key={id} className={`formation-card ${selected === id ? "selected" : ""}`} onClick={() => setSelected(id)}>
        <span>{selected === id && <Check size={18}/>}</span><strong>{id}</strong>
        <MiniPitch slots={formations[id].slots} />
      </button>)}
    </div>
    <button className="button primary wide" onClick={begin} disabled={loading}>
      {loading ? "Готовим общий seed…" : copy.startDraft} <ArrowRight size={19}/>
    </button>
    {notice && <p className="inline-notice" role="status">{notice}</p>}
  </section></Shell>;
}

function MiniPitch({ slots }: { slots: string[] }) {
  return <div className="mini-pitch">{slots.map((slot, index) => <i key={`${slot}-${index}`} data-line={slot === "GK" ? "gk" : ["LB","CB","RB","LWB","RWB"].includes(slot) ? "def" : ["LW","RW","ST"].includes(slot) ? "att" : "mid"} />)}</div>;
}

function PlayerPortrait({ player, compact = false }: { player: Player; compact?: boolean }) {
  const [failed, setFailed] = useState(false);
  const initials = player.name.split(" ").map((part) => part[0]).slice(0, 2).join("");
  if (failed) {
    return <span className={`portrait-fallback ${compact ? "compact" : ""}`} aria-label={`Портрет-заглушка: ${player.name}`}>
      <Users size={compact ? 22 : 54} strokeWidth={1}/>
      <b>{initials}</b>
    </span>;
  }
  return <img
    src={`${import.meta.env.BASE_URL}players/${player.id}.webp`}
    alt={`Фотография: ${player.name}`}
    loading={compact ? "lazy" : "eager"}
    decoding="async"
    onError={() => setFailed(true)}
  />;
}

function PlayerCard({ player, onPick, position, compact = false }: { player: Player; onPick?: () => void; position?: Position; compact?: boolean }) {
  const shownPosition = position ?? player.positions[0];
  const content = <>
    <div className="player-image">
      <PlayerPortrait player={player} compact={compact}/>
    </div>
    <div className="player-rating"><b>{player.rating}</b><span title={positionLabels[shownPosition]}>{positionShortLabels[shownPosition]}</span></div>
    <div className="player-info"><small>{player.country} · ERA XI RATING</small><strong>{player.name}</strong>
      {!compact && <div className="player-stats">
        <span><i>АТК</i><b>{player.attack}</b></span>
        <span><i>ЦЕН</i><b>{player.midfield}</b></span>
        <span><i>ОБР</i><b>{player.defense}</b></span>
      </div>}
    </div>
  </>;
  return onPick ? <button className={`player-card ${compact ? "compact" : ""}`} onClick={onPick}>{content}<span className="pick-label">Выбрать <ChevronRight size={16}/></span></button>
    : <article className={`player-card ${compact ? "compact" : ""}`}>{content}</article>;
}

function DraftPage() {
  const { run, pick } = useGame();
  const navigate = useNavigate();
  if (!run) return <Navigate to="/" replace />;
  if (run.pickedPlayerIds.length >= 11) return <Navigate to="/match" replace />;
  const currentRun = run;
  const { era, candidates } = getDraftOffer(run);
  const position = formations[run.formation].slots[run.round];
  function choose(id: string) {
    pick(id);
    if (currentRun.pickedPlayerIds.length === 10) navigate("/match");
  }
  return <Shell><section className="draft-page" style={{ "--club-a": era.colors[0], "--club-b": era.colors[1] } as React.CSSProperties}>
    <header className="draft-head">
      <div><span className="eyebrow">Раунд {run.round + 1} из 11</span><h1>{positionLabels[position]}</h1><p>Выбери одного из пяти подходящих игроков</p></div>
      <div className="draft-progress"><span style={{ width: `${(run.round / 11) * 100}%` }}/><small>{run.pickedPlayerIds.length}/11 выбрано</small></div>
    </header>
    <div className="candidate-grid">{candidates.map((player) => <PlayerCard key={player.id} player={player} position={position} onPick={() => choose(player.id)} />)}</div>
    <aside className="picked-rail"><b>Твой XI</b>{run.pickedPlayerIds.map((id, index) => <span key={id}>{positionShortLabels[formations[run.formation].slots[index]]} · {playerById.get(id)?.name}</span>)}</aside>
  </section></Shell>;
}

function MatchPage() {
  const { run, play, changeFormation } = useGame();
  const [style, setStyle] = useState<TacticStyle>("possession");
  const [intensity, setIntensity] = useState<Intensity>("normal");
  if (!run) return <Navigate to="/" replace />;
  if (run.pickedPlayerIds.length < 11) return <Navigate to="/draft" replace />;
  if (run.completed) return <Navigate to="/result" replace />;
  const stage = nextStage(run);
  if (!stage) return <Navigate to="/result" replace />;
  const opponent = generateOpponent(run, stage);
  const metrics = squadMetrics(run.pickedPlayerIds, run.formation);
  const lastMatch = run.matches.at(-1);
  function kickOff() {
    play({ style, intensity });
  }
  return <Shell><section className="page match-page">
    <div className="match-stage"><span>{stageLabels[stage]}</span><div>{run.matches.map((match, index) => <i key={index} className={matchOutcome(match).className}/>)}</div></div>
    <div className="versus">
      <article><small>ERA XI · {run.formation}</small><strong>{run.nickname}</strong><b>{metrics.overall}</b></article>
      <span>VS</span>
      <article><small>DREAM TEAM · {opponent.formation}</small><strong>{opponent.name}</strong><b>{opponent.rating}</b></article>
    </div>
    <div className="scouting">
      <div><Gauge size={20}/><span>Скаутский отчёт</span><b>Склонность: {styleLabels[opponent.style]}</b></div>
      <div className="opponent-stars">{opponent.stars.map((id) => <span key={id}>{playerById.get(id)?.name}</span>)}</div>
    </div>
    <div className="tactics-grid">
      <fieldset><legend>Стиль игры</legend>{(["possession","press","counter"] as TacticStyle[]).map((value) =>
        <button className={style === value ? "selected" : ""} onClick={() => setStyle(value)} key={value}><Shield size={18}/>{styleLabels[value]}{style === value && <Check size={16}/>}</button>)}</fieldset>
      <fieldset><legend>Интенсивность</legend>{(["low","normal","high"] as Intensity[]).map((value) =>
        <button className={intensity === value ? "selected" : ""} onClick={() => setIntensity(value)} key={value}>{intensityLabels[value]}{intensity === value && <Check size={16}/>}</button>)}</fieldset>
    </div>
    <div className="fatigue"><span><Gauge size={18}/> Усталость состава</span><b>{run.fatigue}%</b><i><span style={{ width: `${run.fatigue}%` }}/></i></div>
    <div className="match-formations">{formationIds.map((id) => <button className={run.formation === id ? "active" : ""} onClick={() => changeFormation(id)} key={id}>{id}</button>)}</div>
    {lastMatch && <article className={`last-result ${matchOutcome(lastMatch).className}`}>
      <span>Прошлый матч · {matchOutcome(lastMatch).label}</span><b>{lastMatch.goalsFor}:{lastMatch.goalsAgainst}</b>
      <p>{lastMatch.note}</p>
      <ul>{lastMatch.analysis?.map((item) => <li key={item}>{item}</li>)}</ul>
    </article>}
    <button className="button primary wide" onClick={kickOff}><Swords size={19}/> Играть матч</button>
  </section></Shell>;
}

function ResultPage() {
  const { run, clear } = useGame();
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);
  const submissionStarted = useRef(false);
  useEffect(() => {
    if (run?.completed && !submissionStarted.current) {
      submissionStarted.current = true;
      submitRun(run).finally(() => setSent(true));
    }
  }, [run, sent]);
  if (!run?.completed) return <Navigate to="/" replace />;
  const completedRun = run;
  const stage = reachedStage(run);
  const score = run.score ?? calculateScore(run);
  async function share() {
    const text = `Era XI: ${completedRun.nickname} — ${stageLabels[stage]}, ${score} очков. Сможешь лучше?`;
    if (navigator.share) await navigator.share({ title: "Era XI", text, url: location.href });
    else await navigator.clipboard.writeText(`${text} ${location.href}`);
  }
  return <Shell><section className="result-page">
    <div className="result-crown">{stage === "champion" ? <Crown size={44}/> : <Medal size={44}/>}</div>
    <span className="eyebrow">Забег завершён</span><h1>{stage === "champion" ? "Эпоха переписана." : `Остановка: ${stageLabels[stage]}`}</h1>
    <div className="final-score"><span>Итоговый счёт</span><b>{score.toLocaleString("ru-RU")}</b><small>{run.formation} · химия {chemistry(run.pickedPlayerIds, run.formation)}</small></div>
    <div className="journey">{run.matches.map((match, index) => <article key={index} className={matchOutcome(match).className}>
      <span>{stageLabels[match.stage]}</span><strong>{match.goalsFor}:{match.goalsAgainst}</strong><small>{match.opponent.name}</small>
    </article>)}</div>
    <section className="run-analysis">
      <h2>Почему получился такой результат</h2>
      {run.matches.map((match, index) => <article key={index} className={matchOutcome(match).className}>
        <header><span>{stageLabels[match.stage]} · {matchOutcome(match).label}</span><b>{match.goalsFor}:{match.goalsAgainst}</b></header>
        <p>{match.note}</p>
        <ul>{match.analysis?.map((item) => <li key={item}>{item}</li>)}</ul>
      </article>)}
    </section>
    <div className="result-actions"><button className="button primary" onClick={share}><Share2 size={18}/> Поделиться</button>
      <Link className="button ghost" to="/leaderboard"><BarChart3 size={18}/> Таблица</Link>
      <button className="text-button" onClick={() => { clear(); navigate("/"); }}><RotateCcw size={17}/> Новый забег</button></div>
  </section></Shell>;
}

function LeaderboardPage() {
  const [entries, setEntries] = useState<Awaited<ReturnType<typeof fetchLeaderboard>>>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchLeaderboard().then(setEntries).finally(() => setLoading(false));
  }, []);
  return <Shell><section className="page leaderboard-page">
    <div className="section-heading"><div><span className="eyebrow">Лучшие результаты всех сезонов</span><h1>Лидерборд за всё время</h1></div>
      <span className="cloud-state">{isCloudLeaderboard ? "All-time · Supabase" : "Локальный preview"}</span></div>
    <div className="leaderboard-table">
      <div className="table-head"><span>#</span><span>Менеджер</span><span>Стадия</span><span>Схема</span><span>Очки</span></div>
      {loading && <div className="table-loading" role="status">Загружаем результаты…</div>}
      {!loading && entries.map((entry) => <article key={`${entry.nickname}-${entry.rank}`}><span>{entry.rank <= 3 ? <Medal size={19}/> : entry.rank}</span>
        <strong>{entry.nickname}</strong><span>{stageLabels[entry.stage]}</span><span>{entry.formation}</span><b>{entry.score.toLocaleString("ru-RU")}</b></article>)}
    </div>
  </section></Shell>;
}

function CreditsPage() {
  const rows = attributions as Array<{
    playerName: string;
    author: string;
    license: string;
    licenseUrl: string;
    sourcePage: string;
  }>;
  return <Shell><section className="page credits-page">
    <span className="eyebrow">Прозрачность</span><h1>Фото и данные</h1>
    <p className="lead">Все доступные фотографии загружены с Wikimedia Commons и показаны по условиям открытых лицензий. Если свободного изображения нет, используется фирменный силуэт.</p>
    <div className="credits-list">{rows.length ? rows.map((row) => <article key={row.playerName}><ImageIcon size={18}/><b>{row.playerName}</b><span>{row.author}</span><div className="credit-links">
      <a href={row.sourcePage} target="_blank" rel="noreferrer">Страница файла</a>
      {row.licenseUrl ? <a href={row.licenseUrl} target="_blank" rel="noreferrer">{row.license}</a> : <span>{row.license}</span>}
    </div></article>)
      : <div className="empty-state"><ImageIcon size={28}/><b>Фотографии ещё готовятся</b><p>Игра уже работает с безопасными силуэтами.</p></div>}</div>
    <div className="legal-note"><Info size={20}/><p>Рейтинги являются редакционной оценкой Era XI. Названия клубов используются только для исторического описания. Официальные гербы, формы и графика сторонних игр не используются.</p></div>
  </section></Shell>;
}

export function App() {
  return <Routes>
    <Route path="/" element={<Home/>}/>
    <Route path="/formation/:mode" element={<FormationPage/>}/>
    <Route path="/draft" element={<DraftPage/>}/>
    <Route path="/squad" element={<Navigate to="/match" replace/>}/>
    <Route path="/match" element={<MatchPage/>}/>
    <Route path="/result" element={<ResultPage/>}/>
    <Route path="/leaderboard" element={<LeaderboardPage/>}/>
    <Route path="/credits" element={<CreditsPage/>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes>;
}
