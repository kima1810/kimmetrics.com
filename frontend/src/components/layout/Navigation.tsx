import React from 'react';
import { Link } from 'react-router-dom';

export function Navigation() {
  return (
    <nav id="menu">
      <ul className="links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/nhl">NHL Standings</Link></li>
        <li>
          <Link to="/nhl">NHL</Link>
          <ul>
            <li><Link to="/nhl/standings">Standings</Link></li>
            <li><Link to="/nhl/teams">Teams</Link></li>
          </ul>
        </li>
      </ul>
    </nav>
  );
}