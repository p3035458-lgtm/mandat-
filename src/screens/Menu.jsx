import { A, IMG, loadSave } from '../game.js';

const PHASE = {
  campaign: 'Предвыборная кампания', eday: 'День выборов', night: 'Ночь выборов', victory: 'Победа на выборах',
  defeat: 'Поражение', cabinet: 'Формирование правительства', presidency: 'Президентство', legacy: 'Итоги карьеры', coup: 'Переворот',
};

// Главная страница: только меню. Создание кандидата вынесено на отдельный экран «setup».
export default function Menu() {
  const sv = loadSave();
  const has = !!(sv && sv.phase);
  const where = has ? `${PHASE[sv.phase] || 'Игра'}${sv.camp && sv.phase === 'campaign' ? `, неделя ${sv.camp.week}` : ''}` : '';
  return (
    <section className="home">
      <img className="home-bg" src={IMG.menu} alt="" />
      <div className="home-shade" />
      <div className="home-in">
        <div className="home-logo">Mandate</div>
        <p className="home-tag">Политический симулятор: выборы, деньги, лобби и власть</p>
        <div className="home-actions">
          <button className="hbtn primary" onClick={() => A.goSetup()}>
            <span className="hic">⌂</span><span><b>Новая игра</b><small>Создать кандидата и начать кампанию</small></span>
          </button>
          <button className="hbtn" disabled={!has} onClick={() => A.continue()}>
            <span className="hic">↻</span><span><b>Продолжить</b><small>{has ? `${sv.name} · ${where}` : 'Нет сохранённой игры'}</small></span>
          </button>
          <button className="hbtn" onClick={() => A.quick()}>
            <span className="hic">⚡</span><span><b>Быстрый старт</b><small>Случайный кандидат, сразу в бой</small></span>
          </button>
        </div>
        <div className="home-links">
          <button className="hlink" onClick={() => A.settings()}>⚙ Настройки</button>
          <button className="hlink" onClick={() => A.achievements()}>★ Достижения</button>
          <button className="hlink" onClick={() => A.howto()}>? Как играть</button>
        </div>
      </div>
    </section>
  );
}
