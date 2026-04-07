import React from "react";
import { FiUsers, FiActivity, FiGlobe, FiKey } from "react-icons/fi";
import { USER_COLORS as C } from "../constants/usuarios";
import { StatsGrid, StatCard } from "../styles/UserStyles";

interface UserStatsProps {
  total: number;
  sucursalesCount: number;
  rolesCount: number;
}

/**
 * UserStats - Digital Ledger Statistics
 * 
 * Visualization of high-level agent data using a command-center layout.
 */
const UserStats: React.FC<UserStatsProps> = ({ total, sucursalesCount, rolesCount }) => {
  const stats = [
    { label: 'TOTAL_AGENTS', value: total, color: C.accent, icon: FiUsers },
    { label: 'ACTIVE_SESSIONS', value: total, color: C.success, icon: FiActivity },
    { label: 'NETWORK_NODES', value: sucursalesCount, color: C.info, icon: FiGlobe },
    { label: 'SECURITY_ROLES', value: rolesCount, color: C.warning, icon: FiKey },
  ];

  return (
    <StatsGrid>
      {stats.map(st => (
        <StatCard key={st.label} $color={st.color}>
          <div className="icon-box">
            <st.icon />
          </div>
          <div className="info">
            <div className="value">
              {st.value.toString().padStart(2, '0')}
            </div>
            <div className="label">{st.label}</div>
          </div>
        </StatCard>
      ))}
    </StatsGrid>
  );
};

export default UserStats;
