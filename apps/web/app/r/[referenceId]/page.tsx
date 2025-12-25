import { redirect } from 'next/navigation';

export default function RedirectShort({ params, searchParams }: { params: { referenceId: string }; searchParams: Record<string, string> }) {
  const query = new URLSearchParams({ ref: params.referenceId, ...searchParams }).toString();
  redirect(`/redeem?${query}`);
}
