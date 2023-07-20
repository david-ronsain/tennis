import { config } from '../config/config';
import { TournamentCategory, MatchRound } from '../enums';

const getNbMatchesForRound = (round: MatchRound): number => {
  if (round === MatchRound.FINAL) return 1;
  else if (round === MatchRound.SEMI) return 2;
  else if (round === MatchRound.QUARTER) return 4;
  else if (round === MatchRound.EIGHTH) return 8;
  else if (round === MatchRound.R3) return 16;
  else if (round === MatchRound.R2) return 32;
  else if (round === MatchRound.R1) return 64;

  return 0;
};

const getRounds = (
  category: TournamentCategory,
  forceTest?: boolean
): MatchRound[] => {
  if (config.CORE.NODE_ENV === 'test' && !!forceTest) {
    return [MatchRound.QUARTER, MatchRound.SEMI, MatchRound.FINAL];
  } else if (category === TournamentCategory.MASTERS) {
    return [MatchRound.SEMI, MatchRound.FINAL];
  } else if (
    [TournamentCategory.GRAND_SLAM, TournamentCategory.MASTER1000].includes(
      category
    )
  ) {
    return [
      MatchRound.R1,
      MatchRound.R2,
      MatchRound.R3,
      MatchRound.EIGHTH,
      MatchRound.QUARTER,
      MatchRound.SEMI,
      MatchRound.FINAL
    ];
  }

  return [
    MatchRound.R3,
    MatchRound.EIGHTH,
    MatchRound.QUARTER,
    MatchRound.SEMI,
    MatchRound.FINAL
  ];
};

export { getNbMatchesForRound, getRounds };
