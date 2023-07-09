import { IMatch } from 'core/interfaces';
import { Service } from 'typedi';

@Service()
export class MatchService {
  scoreUpdate(token: any, match: IMatch): void {
    //console.log(token, match);
  }
}
