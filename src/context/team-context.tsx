import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTeams } from '@/hooks/use-teams';

interface TeamContextType {
  activeTeamId: string | null;
  setActiveTeamId: (teamId: string) => void;
  activeTeam: any | null;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const [activeTeamId, setActiveTeamIdState] = useState<string | null>(null);
  const { data: teams } = useTeams();

  useEffect(() => {
    if (teams && teams.length > 0 && !activeTeamId) {
      setActiveTeamIdState(teams[0].id);
    }
  }, [teams, activeTeamId]);

  const activeTeam = teams?.find(team => team.id === activeTeamId) || null;

  const setActiveTeamId = (teamId: string) => {
    setActiveTeamIdState(teamId);
  };

  return (
    <TeamContext.Provider value={{ activeTeamId, setActiveTeamId, activeTeam }}>
      {children}
    </TeamContext.Provider>
  );
}

export function useActiveTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useActiveTeam must be used within a TeamProvider');
  }
  return context;
}