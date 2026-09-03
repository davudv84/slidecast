"use client";

import { useState } from "react";
import { Instagram, Trash2 } from "lucide-react";
import { useApp } from "./app-provider";
import { Modal, ModalHeader } from "./ui/dialog";
import { Button } from "./ui/button";
import { Field, Input } from "./ui/input";
import type { Channel } from "@/lib/types";

/** "Connect Instagram" dialog — handle in, connected channel out. */
export function ConnectChannelDialog({ onConnected }: { onConnected?: (channel: Channel) => void }) {
  const app = useApp();
  const [handle, setHandle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const close = () => {
    if (busy) return;
    app.setConnectOpen(false);
    setHandle("");
    setError("");
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const clean = handle.trim().replace(/^@/, "");
    if (!/^[a-z0-9._]{1,30}$/i.test(clean)) {
      setError("Enter your Instagram username, like @marisol.writes.");
      return;
    }
    setBusy(true);
    const channel = await app.connectChannel(clean);
    setBusy(false);
    app.setConnectOpen(false);
    setHandle("");
    onConnected?.(channel);
  };

  return (
    <Modal
      open={app.connectOpen}
      onOpenChange={(o) => !o && close()}
      label="Connect Instagram"
      zIndex={65}
      className="w-full max-w-110 rounded-modal border border-line bg-surface p-5 shadow-float sm:p-6"
    >
      <div className="flex flex-col gap-4">
        <ModalHeader title="Connect Instagram" onClose={close} />
        <p className="m-0 text-sm leading-relaxed text-t2">
          Slidecast publishes carousels straight to your account with the caption you approve.
          You stay in control: nothing posts until you press Publish.
        </p>
        <form onSubmit={submit} className="flex flex-col gap-3.5">
          <Field label="Instagram username">
            <Input
              value={handle}
              onChange={(e) => {
                setHandle(e.target.value);
                setError("");
              }}
              placeholder="@yourhandle"
              autoComplete="off"
              spellCheck={false}
              autoFocus
            />
          </Field>
          {error ? (
            <p className="anim-fade m-0 text-[13px] text-danger" role="alert">
              {error}
            </p>
          ) : null}
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-[13px] text-t2">
            <li>· Professional or Creator accounts can publish carousels.</li>
            <li>· You approve Slidecast once in Instagram, then every post from here.</li>
            <li>· Disconnect any time from Settings.</li>
          </ul>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={close} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={busy}>
              {busy ? "Connecting…" : (
                <>
                  <Instagram size={16} strokeWidth={1.5} />
                  Continue with Instagram
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

/** Connected accounts list with connect / disconnect — used in Settings. */
export function ChannelList() {
  const app = useApp();

  const disconnect = (channel: Channel) =>
    app.requestConfirm({
      title: "Disconnect Instagram?",
      body: `${channel.handle} will be removed. Carousels already published stay on Instagram.`,
      cta: "Disconnect",
      run: () => app.disconnectChannel(channel.id),
    });

  return (
    <div className="flex flex-col gap-2">
      {app.channels.map((c) => (
        <div key={c.id} className="flex items-center gap-3 rounded-control border border-line p-2.5">
          <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-inv text-inv-t">
            <Instagram size={16} strokeWidth={1.5} />
          </span>
          <div className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-sm font-medium text-t1">{c.handle}</span>
            <span className="text-xs text-t3">
              Instagram · connected {new Date(c.connectedAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
            </span>
          </div>
          <Button variant="ghost" size="iconSm" aria-label={`Disconnect ${c.handle}`} className="hover:text-danger" onClick={() => disconnect(c)}>
            <Trash2 size={14} strokeWidth={1.5} />
          </Button>
        </div>
      ))}
      {app.channels.length === 0 ? (
        <p className="m-0 text-[13px] text-t3">
          No accounts yet. Connect Instagram to publish carousels with their caption in one step.
        </p>
      ) : null}
      <Button variant="secondary" size="sm" className="w-fit" onClick={() => app.setConnectOpen(true)}>
        <Instagram size={14} strokeWidth={1.5} />
        Connect Instagram
      </Button>
    </div>
  );
}
