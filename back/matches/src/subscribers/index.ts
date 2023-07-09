import {
  eventManager,
  assignPlayerToNextMatchEvent,
  assignPlayerToNextMatchCallback
} from './events';

const loadSubscribers = () => {
  assignPlayerToNextMatchEvent();
};

export { eventManager, loadSubscribers, assignPlayerToNextMatchCallback };
