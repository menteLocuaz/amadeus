import React from "react";
import { FiUsers, FiActivity, FiMapPin, FiShield } from "react-icons/fi";
import { USER_COLORS as C } from "../constants/usuarios";
import { StatsGrid, StatCard } from "../styles/UserStyles";

interface UserStatsProps {
  total: number;
  sucursalesCount: number;
  rolesCount: number;
}

const UserStats: React.FC<UserStatsProps> = ({ total, sucursalesCount, rolesCount }) => {
  const stats = [
    { label: 'Total Usuarios', value: total, color: C.accent, icon: FiUsers },
    { label: 'En Operación', value: total, color: C.success, icon: FiActivity },
    { label: 'Restaurantes', value: sucursalesCount, color: C.info, icon: FiMapPin },
    { label: 'Roles Definidos', value: rolesCount, color: '#a855f7', icon: FiShield },
  ];

  return (
    <StatsGrid>
      {stats.map(st => (
        <StatCard key={st.label} $color={st.color}>
          <div className="icon-box"><st.icon /></div>
          <div className="info">
            <div className="value">{st.value}</div>
            <div className="label">{st.label}</div>
          </div>
        </StatCard>
      ))}
    </StatsGrid>
  );
};

export default UserStats;
