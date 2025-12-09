import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";

// GET - dohvat subscription za korisnika
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId je obavezan" }, { status: 400 });
    }

    const { rows } = await query(
      `SELECT * FROM subscriptions WHERE user_id = $1`,
      [userId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ subscription: null });
    }

    const sub = rows[0];

    // Dohvati payment history
    const { rows: payments } = await query(
      `SELECT * FROM payment_history WHERE subscription_id = $1 ORDER BY date DESC`,
      [sub.id]
    );

    return NextResponse.json({
      subscription: {
        isActive: sub.is_active,
        monthlyPrice: Number(sub.monthly_price),
        lastPaymentDate: sub.last_payment_date,
        expiryDate: sub.expiry_date,
        graceEndDate: sub.grace_end_date,
        trialEndDate: sub.trial_end_date,
        paymentHistory: payments.map((p: any) => ({
          date: p.date,
          amount: Number(p.amount),
          note: p.note || "",
          validUntil: p.valid_until,
        })),
        paymentPendingVerification: sub.payment_pending_verification,
        paymentRequestedAmount: sub.payment_requested_amount ? Number(sub.payment_requested_amount) : null,
        paymentRequestedMonths: sub.payment_requested_months,
        paymentReferenceNumber: sub.payment_reference_number,
        paymentRequestedAt: sub.payment_requested_at,
      },
    });
  } catch (err) {
    console.error("Greška u GET /api/admin/subscription:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST - ažuriraj subscription
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      isActive,
      monthlyPrice,
      expiryDate,
      graceEndDate,
      trialEndDate,
      paymentHistory,
      paymentPendingVerification,
      paymentRequestedAmount,
      paymentRequestedMonths,
      paymentReferenceNumber,
      paymentRequestedAt,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId je obavezan" }, { status: 400 });
    }

    // Provjeri da li subscription postoji
    const { rows: existing } = await query(
      `SELECT id FROM subscriptions WHERE user_id = $1`,
      [userId]
    );

    if (existing.length === 0) {
      // Kreiraj novi subscription
      const { rows } = await query(
        `INSERT INTO subscriptions (
          user_id, is_active, monthly_price, expiry_date, grace_end_date, trial_end_date,
          payment_pending_verification, payment_requested_amount, payment_requested_months,
          payment_reference_number, payment_requested_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id`,
        [
          userId,
          isActive || false,
          monthlyPrice || 12,
          expiryDate || null,
          graceEndDate || null,
          trialEndDate || null,
          paymentPendingVerification || false,
          paymentRequestedAmount || null,
          paymentRequestedMonths || null,
          paymentReferenceNumber || null,
          paymentRequestedAt || null,
        ]
      );

      const subscriptionId = rows[0].id;

      // Dodaj payment history ako postoji
      if (paymentHistory && Array.isArray(paymentHistory)) {
        for (const payment of paymentHistory) {
          await query(
            `INSERT INTO payment_history (subscription_id, date, amount, note, valid_until)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              subscriptionId,
              payment.date || new Date(),
              payment.amount || 0,
              payment.note || "",
              payment.validUntil || null,
            ]
          );
        }
      }
    } else {
      // Ažuriraj postojeći subscription
      const subscriptionId = existing[0].id;

      await query(
        `UPDATE subscriptions SET
          is_active = COALESCE($1, is_active),
          monthly_price = COALESCE($2, monthly_price),
          expiry_date = COALESCE($3, expiry_date),
          grace_end_date = COALESCE($4, grace_end_date),
          trial_end_date = COALESCE($5, trial_end_date),
          payment_pending_verification = COALESCE($6, payment_pending_verification),
          payment_requested_amount = COALESCE($7, payment_requested_amount),
          payment_requested_months = COALESCE($8, payment_requested_months),
          payment_reference_number = COALESCE($9, payment_reference_number),
          payment_requested_at = COALESCE($10, payment_requested_at),
          updated_at = NOW()
        WHERE id = $11`,
        [
          isActive,
          monthlyPrice,
          expiryDate,
          graceEndDate,
          trialEndDate,
          paymentPendingVerification,
          paymentRequestedAmount,
          paymentRequestedMonths,
          paymentReferenceNumber,
          paymentRequestedAt,
          subscriptionId,
        ]
      );

      // Ažuriraj payment history ako je priložen
      if (paymentHistory && Array.isArray(paymentHistory)) {
        // Obriši postojeću historiju
        await query(`DELETE FROM payment_history WHERE subscription_id = $1`, [subscriptionId]);

        // Dodaj novu historiju
        for (const payment of paymentHistory) {
          await query(
            `INSERT INTO payment_history (subscription_id, date, amount, note, valid_until)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              subscriptionId,
              payment.date || new Date(),
              payment.amount || 0,
              payment.note || "",
              payment.validUntil || null,
            ]
          );
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Greška u POST /api/admin/subscription:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

