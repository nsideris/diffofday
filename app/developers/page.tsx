import { InfoPageView, infoMetadata } from '../info-page';

export const metadata = infoMetadata('/developers');

export default function Page() {
  return <InfoPageView path="/developers" />;
}
