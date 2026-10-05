import { A, IMG, loadSave, setupInner } from '../game.js';

// Главное меню. Форма «Новая игра» (setupInner) пока остаётся HTML-строкой — следующий шаг миграции.
export default function Menu() {
  const sv = loadSave();
  const hasSave = !!(sv && sv.phase);
  return (
    <>
      <section className="menu1">
        <img className="menu-bg" src={IMG.menu} alt="" loading="lazy" />
        <div className="menu-shade" />
        <div className="menu-in">
          <div className="logo">Mandate</div>
          <nav className="menu-nav">
            <button className="mbtn" onClick={() => A.goSetup()}><span className="ic">⌂</span>Новая игра</button>
            <button className="mbtn" disabled={!hasSave} onClick={() => A.continue()}>
              <span className="ic">↻</span>Продолжить{hasSave && <small>{sv.name}</small>}
            </button>
            <button className="mbtn" onClick={() => A.settings()}><span className="ic">⚙</span>Настройки</button>
            <button className="mbtn" onClick={() => A.achievements()}><span className="ic">★</span>Достижения</button>
            <button className="mbtn" onClick={() => A.howto()}><span className="ic">?</span>Как играть</button>
          </nav>
        </div>
      </section>
      <section id="setup" className="card setup2" dangerouslySetInnerHTML={{ __html: setupInner() }} />
    </>
  );
}
