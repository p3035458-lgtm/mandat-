import { useEffect, useLayoutEffect, useRef, useSyncExternalStore } from 'react';
import { boot, subscribe, getView, SCREENS } from './game.js';

// Экран без JSX-версии: старая HTML-строка, пересоздаётся при каждом render()
function LegacyScreen({ view, entering }) {
  useLayoutEffect(() => { if (view.post) view.post(); }, []);
  return <div className={'wrap' + (entering ? ' screen-enter' : '')} id="app"
              dangerouslySetInnerHTML={{ __html: view.html || '' }} />;
}

export default function App() {
  const view = useSyncExternalStore(subscribe, getView);
  const prevKey = useRef(null);
  useEffect(() => { boot(); }, []);
  useEffect(() => { if (view) prevKey.current = view.key; });

  // анимация входа проигрывается только при смене экрана, а не при каждом клике
  const entering = !!view && prevKey.current !== view.key;
  const Screen = view && SCREENS[view.key];
  return (
    <>
      {view && (Screen
        ? <div className={'wrap' + (entering ? ' screen-enter' : '')} id="app"><Screen key={view.rev} /></div>
        : <LegacyScreen key={view.rev} view={view} entering={entering} />)}
      <div id="modal" />
      <div id="toastbox" />
      <canvas id="confetti" hidden />
    </>
  );
}
