import { Link } from 'react-router-dom';

export function Header() {
  return (
    <div id="header">
      <h1><Link to="/" id="logo">Kimmetrics</Link></h1>
      <nav id="nav">
        <ul>
          <li className="current"><Link to="/nhl">NHL</Link></li>
        </ul>
      </nav>
    </div>
  );
}
