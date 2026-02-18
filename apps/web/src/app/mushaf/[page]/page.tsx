import TarteelMushafViewer from './TarteelMushafViewer';

export default async function Page({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page: pageParam } = await params;
  const page = Number(pageParam);
  const initialPage =
    Number.isInteger(page) && page >= 1 && page <= 604 ? page : 1;

  return <TarteelMushafViewer initialPage={initialPage} />;
}
