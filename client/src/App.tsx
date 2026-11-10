import Humidite from "../pages/humidite/humidite";

function App() {
  const path = window.location.pathname.replace(/\/$/, "") || "/";

  if (path === "/humidite") {
    return <Humidite />;
  }

  if (path === "/") {
    return (
      <main>
        <h1>Monitoring de la serre</h1>
        <nav aria-label="Pages">
          <a href="/humidite">Humidité</a>
        </nav>
      </main>
    );
  }

  return (
    <main>
      <h1>Page introuvable</h1>
      <a href="/">Retour à l’accueil</a>
    </main>
  );
}

export default App;