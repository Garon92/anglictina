import { useStoreValue } from '../kit/react/hooks';
import { appStore } from './appStore';

/**
 * The learner's name — stored for THIS app only (`g92:anglictina:name`). The shared g92
 * "playerName" is the family default used by the kids' apps, so we never read it for the
 * greeting and never overwrite it from here.
 */
export function getAppName(): string {
  return appStore.get('name');
}

export function setAppName(name: string) {
  appStore.set('name', name.trim().slice(0, 40));
}

export function useAppName(): [string, (v: string) => void] {
  const [name, set] = useStoreValue(appStore, 'name');
  return [name, (v: string) => set(v.slice(0, 40))];
}
