import useBaseUrl from '@docusaurus/useBaseUrl';

export function useNavbarLogoSrc(src?: string) {
  return useBaseUrl(src || '/img/logo.png');
}
