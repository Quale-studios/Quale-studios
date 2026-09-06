import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

function formatAnswer(answer: unknown): string {
  if (Array.isArray(answer)) {
    return answer.join(', ');
  }

  if (typeof answer === 'string') {
    return answer;
  }

  if (answer === null || answer === undefined) {
    return 'No answer';
  }

  return JSON.stringify(answer, null, 2);
}

function sanitizeFileName(value: string) {
  return (
    value
      .trim()
      .replace(/[^a-zA-Z0-9-_]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'client'
  );
}

function pdfSafeText(value: string) {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, '?');
}

function wrapText(
  text: string,
  font: Awaited<ReturnType<PDFDocument['embedFont']>>,
  fontSize: number,
  maxWidth: number
) {
  const paragraphs = pdfSafeText(text).split('\n');
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push('');
      continue;
    }

    const words = paragraph.split(/\s+/);
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine
        ? `${currentLine} ${word}`
        : word;

      const width = font.widthOfTextAtSize(
        testLine,
        fontSize
      );

      if (width <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }

        currentLine = word;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }
  }

  return lines;
}

export async function GET(request: Request) {
  const { authorized } = await requireAdmin();

  if (!authorized) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);

  const accessCardId =
    searchParams.get('access_card_id');

  const download =
    searchParams.get('download') === 'true' ||
    searchParams.get('format') === 'pdf';

  if (!accessCardId) {
    return NextResponse.json(
      { error: 'Access card ID is required.' },
      { status: 400 }
    );
  }

  const { data: accessCard, error: accessCardError } =
    await supabaseAdmin
      .from('access_cards')
      .select('id, name, email')
      .eq('id', accessCardId)
      .single();

  if (accessCardError || !accessCard) {
    return NextResponse.json(
      { error: 'Client not found.' },
      { status: 404 }
    );
  }

  const { data: session, error: sessionError } =
    await supabaseAdmin
      .from('creative_sessions')
      .select('id, status, submitted_at')
      .eq('access_card_id', accessCardId)
      .single();

  if (sessionError || !session) {
    return NextResponse.json(
      { error: 'Creative Session not found.' },
      { status: 404 }
    );
  }

  const { data: answers, error: answersError } =
    await supabaseAdmin
      .from('creative_answers')
      .select(
        'id, question_key, answer, created_at, updated_at'
      )
      .eq('creative_session_id', session.id);

  if (answersError) {
    console.error(
      'ADMIN CREATIVE ANSWERS ERROR:',
      answersError
    );

    return NextResponse.json(
      { error: 'Unable to load creative answers.' },
      { status: 500 }
    );
  }

  const questionKeys = [
    ...new Set(
      (answers ?? [])
        .map((answer) => answer.question_key)
        .filter(Boolean)
    ),
  ];

  const { data: questions, error: questionsError } =
    questionKeys.length > 0
      ? await supabaseAdmin
          .from('creative_questions')
          .select(
            'question_key, question, question_type, options, display_order'
          )
          .in('question_key', questionKeys)
      : { data: [], error: null };

  if (questionsError) {
    console.error(
      'ADMIN CREATIVE QUESTIONS ERROR:',
      questionsError
    );

    return NextResponse.json(
      { error: 'Unable to load creative questions.' },
      { status: 500 }
    );
  }

  const questionMap = new Map(
    (questions ?? []).map((question) => [
      question.question_key,
      question,
    ])
  );

  const combinedAnswers = (answers ?? [])
    .map((answer) => ({
      ...answer,
      question:
        questionMap.get(answer.question_key) ?? null,
    }))
    .sort(
      (a, b) =>
        (a.question?.display_order ?? 9999) -
        (b.question?.display_order ?? 9999)
    );

  /*
   * NORMAL JSON RESPONSE
   */

  if (!download) {
    return NextResponse.json({
      success: true,
      client: accessCard,
      session: {
        id: session.id,
        status: session.status,
        submitted_at: session.submitted_at,
      },
      answers: combinedAnswers,
    });
  }

  /*
   * PDF RESPONSE
   */

  const pdfDoc = await PDFDocument.create();

  const regularFont = await pdfDoc.embedFont(
    StandardFonts.Helvetica
  );

  const italicFont = await pdfDoc.embedFont(
    StandardFonts.HelveticaOblique
  );

  const boldFont = await pdfDoc.embedFont(
    StandardFonts.HelveticaBold
  );

  const PAGE_WIDTH = 595.28;
  const PAGE_HEIGHT = 841.89;

  const MARGIN_X = 54;
  const TOP_MARGIN = 58;
  const BOTTOM_MARGIN = 58;

  const BODY_WIDTH =
    PAGE_WIDTH - MARGIN_X * 2;

  let page = pdfDoc.addPage([
    PAGE_WIDTH,
    PAGE_HEIGHT,
  ]);

  let y = PAGE_HEIGHT - TOP_MARGIN;

  function drawFooter() {
    page.drawText(
      'QUALE STUDIOS  /  CREATIVE SESSION',
      {
        x: MARGIN_X,
        y: 28,
        size: 7,
        font: regularFont,
        color: rgb(0.55, 0.55, 0.55),
      }
    );

    page.drawText(
      String(pdfDoc.getPageCount()),
      {
        x: PAGE_WIDTH - MARGIN_X - 10,
        y: 28,
        size: 7,
        font: regularFont,
        color: rgb(0.55, 0.55, 0.55),
      }
    );
  }

  function addPage() {
    page = pdfDoc.addPage([
      PAGE_WIDTH,
      PAGE_HEIGHT,
    ]);

    y = PAGE_HEIGHT - TOP_MARGIN;
  }

  function ensureSpace(requiredHeight: number) {
    if (y - requiredHeight < BOTTOM_MARGIN) {
      drawFooter();
      addPage();
    }
  }

  /*
   * HEADER
   */

  page.drawText('QUALE', {
    x: MARGIN_X,
    y,
    size: 14,
    font: italicFont,
    color: rgb(0.15, 0.15, 0.15),
  });

  y -= 62;

  page.drawText('Creative Session', {
    x: MARGIN_X,
    y,
    size: 28,
    font: italicFont,
    color: rgb(0.08, 0.08, 0.08),
  });

  y -= 22;

  page.drawText('Client Creative Brief', {
    x: MARGIN_X,
    y,
    size: 10,
    font: regularFont,
    color: rgb(0.45, 0.45, 0.45),
  });

  y -= 48;

  page.drawLine({
    start: {
      x: MARGIN_X,
      y,
    },
    end: {
      x: PAGE_WIDTH - MARGIN_X,
      y,
    },
    thickness: 0.7,
    color: rgb(0.82, 0.82, 0.82),
  });

  y -= 38;

  page.drawText(
    pdfSafeText(accessCard.name || 'Client'),
    {
      x: MARGIN_X,
      y,
      size: 19,
      font: boldFont,
      color: rgb(0.08, 0.08, 0.08),
    }
  );

  y -= 20;

  if (accessCard.email) {
    page.drawText(
      pdfSafeText(accessCard.email),
      {
        x: MARGIN_X,
        y,
        size: 9,
        font: regularFont,
        color: rgb(0.42, 0.42, 0.42),
      }
    );

    y -= 22;
  }

  page.drawText(
    `Session status: ${pdfSafeText(session.status)}`,
    {
      x: MARGIN_X,
      y,
      size: 8,
      font: regularFont,
      color: rgb(0.42, 0.42, 0.42),
    }
  );

  if (session.submitted_at) {
    y -= 15;

    const submittedDate = new Date(
      session.submitted_at
    ).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    page.drawText(
      `Submitted: ${pdfSafeText(submittedDate)}`,
      {
        x: MARGIN_X,
        y,
        size: 8,
        font: regularFont,
        color: rgb(0.42, 0.42, 0.42),
      }
    );
  }

  y -= 55;

  /*
   * ANSWERS
   */

  if (combinedAnswers.length === 0) {
    page.drawText(
      'No answers have been submitted.',
      {
        x: MARGIN_X,
        y,
        size: 11,
        font: regularFont,
        color: rgb(0.4, 0.4, 0.4),
      }
    );
  } else {
    for (
      let index = 0;
      index < combinedAnswers.length;
      index++
    ) {
      const item = combinedAnswers[index];

      const questionText =
        item.question?.question ||
        item.question_key;

      const answerText =
        formatAnswer(item.answer);

      const questionLines = wrapText(
        questionText,
        italicFont,
        13,
        BODY_WIDTH
      );

      const answerLines = wrapText(
        answerText,
        regularFont,
        10.5,
        BODY_WIDTH
      );

      const estimatedHeight =
        18 +
        questionLines.length * 17 +
        13 +
        answerLines.length * 15 +
        30;

      ensureSpace(
        Math.min(
          estimatedHeight,
          PAGE_HEIGHT -
            TOP_MARGIN -
            BOTTOM_MARGIN
        )
      );

      page.drawText(
        String(index + 1).padStart(2, '0'),
        {
          x: MARGIN_X,
          y,
          size: 8,
          font: boldFont,
          color: rgb(0.58, 0.58, 0.58),
        }
      );

      y -= 17;

      for (const line of questionLines) {
        page.drawText(line, {
          x: MARGIN_X,
          y,
          size: 13,
          font: italicFont,
          color: rgb(0.1, 0.1, 0.1),
        });

        y -= 17;
      }

      y -= 7;

      for (const line of answerLines) {
        page.drawText(line, {
          x: MARGIN_X,
          y,
          size: 10.5,
          font: regularFont,
          color: rgb(0.32, 0.32, 0.32),
        });

        y -= 15;
      }

      y -= 23;

      if (
        index <
        combinedAnswers.length - 1
      ) {
        page.drawLine({
          start: {
            x: MARGIN_X,
            y,
          },
          end: {
            x: PAGE_WIDTH - MARGIN_X,
            y,
          },
          thickness: 0.45,
          color: rgb(0.87, 0.87, 0.87),
        });

        y -= 25;
      }
    }
  }

  drawFooter();

  const pdfBytes = await pdfDoc.save();

  const pdfBuffer = new ArrayBuffer(
    pdfBytes.byteLength
  );

  new Uint8Array(pdfBuffer).set(pdfBytes);

  const fileName = `${sanitizeFileName(
    accessCard.name || 'client'
  )}-creative-session.pdf`;

  return new Response(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'no-store',
    },
  });
}