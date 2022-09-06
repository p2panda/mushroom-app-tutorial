import React from 'react';
import { NavLink } from 'react-router-dom';

export const Navigation: React.FC = () => {
  return (
    <nav>
      <ul>
        <li>
          <NavLink
            className={({ isActive }) =>
              'navigation-link' + (isActive ? ' navigation-link-active' : '')
            }
            to="/"
          >
            Feed
          </NavLink>
        </li>
        <li>
          <NavLink
            className={({ isActive }) =>
              'navigation-link' + (isActive ? ' navigation-link-active' : '')
            }
            to="/mushrooms"
          >
            Mushrooms
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};
