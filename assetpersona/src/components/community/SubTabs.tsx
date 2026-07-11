import { NavLink } from 'react-router-dom';

interface TabItem {
  to: string;
  label: string;
  end?: boolean;
}

interface SubTabsProps {
  tabs: TabItem[];
}

export default function SubTabs({ tabs }: SubTabsProps) {
  return (
    <nav className="community-sub-tabs">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) => `community-sub-tab ${isActive ? 'community-sub-tab--active' : ''}`}
        >
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
