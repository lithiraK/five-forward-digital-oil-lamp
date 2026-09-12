import { useMemo } from 'react';
import { Logo } from './components/Logo';
import { DisplayScene } from './components/display/DisplayScene';
import { useCeremonyWebSocket } from './lib/websocket';
import {
  CEREMONY_OBJECTS,
  type CeremonyObject,
} from './types/ceremony';
import './styles.css';

function getMode(): 'display' | 'controller' | 'operator' {
  const path = window.location.pathname.replace(/^\//, '');
  if (path === 'controller' || path === 'operator') return path;
  return 'display';
}

const labels: Record<CeremonyObject, string> = {
  people: 'People',
  innovation: 'Innovation',
  intelligence: 'Intelligence',
  collaboration: 'Collaboration',
  learning: 'Learning',
  vision: 'Vision',
  technology: 'Technology',
  future: 'Future',
};

export default function App() {
  const mode = getMode();
  const { state, status, sendMessage, clientId } = useCeremonyWebSocket();

  const completedCount = useMemo(
    () => CEREMONY_OBJECTS.filter((key) => state[key] === 'completed').length,
    [state],
  );

  const completeObject = (key: CeremonyObject) => {
    if (status !== 'connected') return;
    sendMessage({ type: 'COMPLETE_OBJECT', object: key });
  };

  if (mode === 'controller') {
    return (
      <main className="screen controller-screen">
        <header className="topbar">
          <span>FIVE FORWARD</span>
          <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>WS: {status}</span>
          <span>{completedCount}/8 completed</span>
        </header>

        <section className="controller-layout">
          <div className="object-panel">
            <p className="eyebrow">TOUCH CONTROLLER</p>
            <h1>Drag the digital value to the logo.</h1>

            <div className="object-grid">
              {CEREMONY_OBJECTS.map((key) =>
                state[key] === 'completed' ? null : (
                  <button
                    key={key}
                    className="data-object"
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData('text/plain', key);
                    }}
                    onClick={() => completeObject(key)}
                  >
                    <span className="object-dot" />
                    <span>{labels[key]}</span>
                  </button>
                ),
              )}
            </div>
          </div>

          <div
            className="drop-zone"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              const key = event.dataTransfer.getData('text/plain') as CeremonyObject;
              if (CEREMONY_OBJECTS.includes(key)) completeObject(key);
            }}
          >
            <span>DROP</span>
            <Logo />
            <small>Prototype interaction</small>
          </div>
        </section>
      </main>
    );
  }

  if (mode === 'operator') {
    return (
      <main className="screen operator-screen">
        <header className="topbar">
          <span>FIVE FORWARD — OPERATOR</span>
          <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>WS: {status}</span>
          <span>Prototype</span>
        </header>

        <section className="operator-panel">
          <h1>Ceremony State</h1>
          <p className="muted">
            Development control only. This will become the live backup operator
            interface in a later phase.
          </p>

          <div className="state-list">
            {CEREMONY_OBJECTS.map((key) => (
              <div className="state-row" key={key}>
                <span>{labels[key]}</span>
                <strong className={`status ${state[key]}`}>{state[key]}</strong>
                <button
                  className="small-button"
                  onClick={() => completeObject(key)}
                  disabled={state[key] === 'completed' || status !== 'connected'}
                >
                  Complete
                </button>
              </div>
            ))}
          </div>

          <button
            className="reset-button"
            onClick={() => sendMessage({ type: 'RESET_CEREMONY' })}
            disabled={status !== 'connected'}
          >
            Reset Ceremony
          </button>
        </section>
      </main>
    );
  }

  return <DisplayScene state={state} sendMessage={sendMessage} clientId={clientId} />;
}
