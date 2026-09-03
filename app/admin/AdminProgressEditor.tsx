'use client';

import { useMemo, useState } from 'react';

type AccessCard = {
  id: string;
  name: string | null;
  email: string | null;
  private_id: string;
  is_active: boolean;
};

type ProgressRow = {
  id: string;
  access_card_id: string;
  stage_key: string;
  stage_name: string;
  stage_order: number;
  status: string;
  client_message: string | null;
  target_date: string | null;
};

const STATUS_OPTIONS = [
  { value: 'completed', label: 'Completed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'no_action_needed', label: 'No action needed' },
  { value: 'locked', label: 'Locked' },
];

function getStatusLabel(status: string) {
  return (
    STATUS_OPTIONS.find((option) => option.value === status)?.label ||
    status
  );
}

function getStatusSymbol(status: string) {
  switch (status) {
    case 'completed':
      return '✓';
    case 'preparing':
      return '◐';
    case 'no_action_needed':
      return '—';
    case 'locked':
      return '·';
    default:
      return '·';
  }
}

export default function AdminProgressEditor({
  accessCards,
  progress,
}: {
  accessCards: AccessCard[];
  progress: ProgressRow[];
}) {
  const [selectedClientId, setSelectedClientId] = useState(
    accessCards[0]?.id ?? ''
  );

  const [rows, setRows] = useState(progress);
  const [openStageId, setOpenStageId] = useState<string | null>(null);

  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedClient = useMemo(
    () => accessCards.find((client) => client.id === selectedClientId),
    [accessCards, selectedClientId]
  );

  const clientProgress = useMemo(
    () =>
      rows
        .filter((row) => row.access_card_id === selectedClientId)
        .sort((a, b) => a.stage_order - b.stage_order),
    [rows, selectedClientId]
  );

  function updateLocalRow(
    id: string,
    field: 'status' | 'client_message' | 'target_date',
    value: string
  ) {
    setRows((current) =>
      current.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: value,
            }
          : row
      )
    );

    setSavedId(null);
    setError(null);
  }

  async function saveRow(row: ProgressRow) {
    setSavingId(row.id);
    setSavedId(null);
    setError(null);

    try {
      const response = await fetch('/api/admin/track-progress', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: row.id,
          status: row.status,
          client_message: row.client_message?.trim() || null,
          target_date: row.target_date || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to save progress.');
      }

      setRows((current) =>
        current.map((item) =>
          item.id === row.id ? data.progress : item
        )
      );

      setSavedId(row.id);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to save progress.'
      );
    } finally {
      setSavingId(null);
    }
  }

  if (accessCards.length === 0) {
    return (
      <div className="border border-white/15 px-6 py-10">
        <p className="text-base text-white/60">
          No active clients found.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* CLIENT HEADER */}
      <section className="border-y border-white/15 py-10 sm:py-12">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.28em] text-white/50">
              Active Client
            </p>

            <h2 className="text-4xl font-light italic text-white sm:text-5xl">
              {selectedClient?.name || 'Client'}
            </h2>

            <p className="mt-3 text-base text-white/55">
              {selectedClient?.email}
            </p>
          </div>

          <div className="w-full md:w-80">
            <label
              htmlFor="client"
              className="mb-3 block text-xs uppercase tracking-[0.25em] text-white/50"
            >
              Switch Client
            </label>

            <select
              id="client"
              value={selectedClientId}
              onChange={(event) => {
                setSelectedClientId(event.target.value);
                setOpenStageId(null);
                setError(null);
                setSavedId(null);
              }}
              className="w-full appearance-none border-b border-white/30 bg-transparent px-0 py-3 text-base text-white outline-none transition focus:border-white/80"
            >
              {accessCards.map((client) => (
                <option
                  key={client.id}
                  value={client.id}
                  className="bg-black text-white"
                >
                  {client.name || client.email || 'Unnamed client'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* PROGRESS HEADER */}
      <section className="pt-20 pb-12">
        <div className="flex items-end justify-between">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.28em] text-white/50">
              Studio Control
            </p>

            <h2 className="text-3xl font-light italic text-white sm:text-4xl">
              Track Progress
            </h2>
          </div>

          <p className="hidden text-xs uppercase tracking-[0.22em] text-white/40 sm:block">
            {clientProgress.length} Stages
          </p>
        </div>
      </section>

      {/* TIMELINE */}
      {clientProgress.length === 0 ? (
        <div className="border-y border-white/15 py-12">
          <p className="text-base text-white/55">
            No progress stages exist for this client.
          </p>
        </div>
      ) : (
        <div className="border-t border-white/15">
          {clientProgress.map((row, index) => {
            const isOpen = openStageId === row.id;
            const isSaving = savingId === row.id;
            const isSaved = savedId === row.id;

            return (
              <div key={row.id} className="border-b border-white/15">
                {/* STAGE ROW */}
                <button
                  type="button"
                  onClick={() => {
                    setOpenStageId(isOpen ? null : row.id);
                    setError(null);
                    setSavedId(null);
                  }}
                  className="group flex w-full items-center gap-5 py-8 text-left transition hover:bg-white/[0.035] sm:gap-9 sm:py-9"
                >
                  {/* NUMBER */}
                  <div className="w-9 shrink-0 text-center">
                    <span className="text-xs tracking-[0.2em] text-white/40">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  {/* STATUS MARK */}
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm ${
                      row.status === 'completed'
                        ? 'border-white/70 text-white'
                        : row.status === 'locked'
                          ? 'border-white/20 text-white/30'
                          : 'border-white/35 text-white/65'
                    }`}
                  >
                    {getStatusSymbol(row.status)}
                  </div>

                  {/* NAME */}
                  <div className="min-w-0 flex-1">
                    <h3
                      className={`text-xl font-light italic transition sm:text-2xl ${
                        row.status === 'locked'
                          ? 'text-white/50'
                          : 'text-white/90 group-hover:text-white'
                      }`}
                    >
                      {row.stage_name}
                    </h3>

                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/50">
                      {getStatusLabel(row.status)}
                    </p>
                  </div>

                  {/* DATE */}
                  <div className="hidden shrink-0 text-right sm:block">
                    {row.target_date ? (
                      <>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                          Expected
                        </p>

                        <p className="mt-2 text-sm text-white/60">
                          {row.target_date}
                        </p>
                      </>
                    ) : (
                      <p className="text-[10px] uppercase tracking-[0.18em] text-white/25">
                        No date
                      </p>
                    )}
                  </div>

                  {/* ARROW */}
                  <div
                    className={`w-6 shrink-0 text-center text-base text-white/45 transition-transform ${
                      isOpen ? 'rotate-90' : ''
                    }`}
                  >
                    →
                  </div>
                </button>

                {/* EDITOR */}
                {isOpen && (
                  <div className="border-t border-white/15 bg-white/[0.02] px-5 py-10 sm:px-16 sm:py-12">
                    <div className="max-w-3xl">
                      <div className="mb-10">
                        <p className="text-xs uppercase tracking-[0.25em] text-white/45">
                          Edit Stage
                        </p>

                        <h4 className="mt-3 text-2xl font-light italic text-white/85 sm:text-3xl">
                          {row.stage_name}
                        </h4>
                      </div>

                      <div className="grid gap-10 md:grid-cols-2">
                        {/* STATUS */}
                        <div>
                          <label
                            htmlFor={`status-${row.id}`}
                            className="mb-3 block text-xs uppercase tracking-[0.22em] text-white/50"
                          >
                            Status
                          </label>

                          <select
                            id={`status-${row.id}`}
                            value={row.status}
                            onChange={(event) =>
                              updateLocalRow(
                                row.id,
                                'status',
                                event.target.value
                              )
                            }
                            className="w-full border-b border-white/30 bg-transparent px-0 py-4 text-base text-white outline-none transition focus:border-white/80"
                          >
                            {STATUS_OPTIONS.map((option) => (
                              <option
                                key={option.value}
                                value={option.value}
                                className="bg-black text-white"
                              >
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* DATE */}
                        <div>
                          <label
                            htmlFor={`date-${row.id}`}
                            className="mb-3 block text-xs uppercase tracking-[0.22em] text-white/50"
                          >
                            Expected by
                          </label>

                          <input
                            id={`date-${row.id}`}
                            type="date"
                            value={row.target_date ?? ''}
                            onChange={(event) =>
                              updateLocalRow(
                                row.id,
                                'target_date',
                                event.target.value
                              )
                            }
                            className="w-full border-b border-white/30 bg-transparent px-0 py-4 text-base text-white outline-none transition focus:border-white/80"
                          />
                        </div>

                        {/* MESSAGE */}
                        <div className="md:col-span-2">
                          <label
                            htmlFor={`message-${row.id}`}
                            className="mb-3 block text-xs uppercase tracking-[0.22em] text-white/50"
                          >
                            Client Message
                          </label>

                          <textarea
                            id={`message-${row.id}`}
                            value={row.client_message ?? ''}
                            onChange={(event) =>
                              updateLocalRow(
                                row.id,
                                'client_message',
                                event.target.value
                              )
                            }
                            maxLength={500}
                            rows={3}
                            placeholder={`Leave empty to show "${getStatusLabel(row.status)}"`}
                            className="w-full resize-none border-b border-white/30 bg-transparent px-0 py-4 text-base leading-relaxed text-white placeholder:text-white/30 outline-none transition focus:border-white/80"
                          />

                          <p className="mt-3 text-xs leading-relaxed tracking-[0.04em] text-white/35">
                            Optional. A custom message overrides the
                            default status text.
                          </p>
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div className="mt-12 flex items-center gap-6">
                        <button
                          type="button"
                          onClick={() => saveRow(row)}
                          disabled={isSaving}
                          className="border border-white/40 px-8 py-4 text-xs uppercase tracking-[0.2em] text-white transition hover:border-white hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {isSaving ? 'Saving' : 'Save Changes'}
                        </button>

                        {isSaved && (
                          <span className="text-xs uppercase tracking-[0.2em] text-white/50">
                            Saved
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => setOpenStageId(null)}
                          className="text-xs uppercase tracking-[0.2em] text-white/40 transition hover:text-white/80"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {error && (
        <div className="mt-10 border-l border-red-400/50 pl-5">
          <p className="text-sm text-red-400/90">{error}</p>
        </div>
      )}
    </div>
  );
}