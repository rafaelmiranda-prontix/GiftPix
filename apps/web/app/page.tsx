import { Button } from '@giftpix/ui';

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">GiftPix</p>
        <h1 className="text-3xl font-bold sm:text-4xl">Presenteie com Pix com experiência de gift card</h1>
        <p className="text-slate-600">
          Crie um GiftPix, compartilhe o QR e o destinatário resgata com código secreto. Liquidado via Pix.
        </p>
      </div>
      <div className="flex gap-3">
        <Button intent="primary" size="lg">
          Criar GiftPix
        </Button>
        <Button intent="secondary" size="lg">
          Resgatar GiftPix
        </Button>
      </div>
    </main>
  );
}
