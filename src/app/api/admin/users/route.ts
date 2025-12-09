import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "gitara.zizu@gmail.com";

// GET - lista svih korisnika
export async function GET() {
  try {
    const { rows: users } = await query(
      `SELECT id, email, display_name, app_name, created_at, last_sign_in,
              ime_korisnika, broj_telefona, lokacija
       FROM users 
       ORDER BY created_at DESC`
    );

    // Za svakog korisnika dohvati subscription
    const usersWithSubs = await Promise.all(
      users.map(async (user: any) => {
        // Dohvati subscription
        const { rows: subs } = await query(
          `SELECT * FROM subscriptions WHERE user_id = $1`,
          [user.id]
        );

        let subscription = null;
        if (subs.length > 0) {
          const sub = subs[0];
          
          // Dohvati payment history
          const { rows: payments } = await query(
            `SELECT * FROM payment_history WHERE subscription_id = $1 ORDER BY date DESC`,
            [sub.id]
          );

          // Izračunaj status
          const now = new Date();
          const expiryDate = sub.expiry_date ? new Date(sub.expiry_date) : null;
          const trialEndDate = sub.trial_end_date ? new Date(sub.trial_end_date) : null;
          const graceEndDate = sub.grace_end_date ? new Date(sub.grace_end_date) : null;

          const isTrial = trialEndDate && now < trialEndDate;
          const isPremium = expiryDate && now < expiryDate && !isTrial;
          const isGracePeriod = graceEndDate && now < graceEndDate && !isPremium && !isTrial;

          let daysRemaining = 0;
          let daysUntilExpiry = 0;
          let daysInGrace = 0;

          if (isTrial && trialEndDate) {
            daysRemaining = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          } else if (isPremium && expiryDate) {
            daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            daysUntilExpiry = daysRemaining;
          } else if (isGracePeriod && graceEndDate) {
            daysInGrace = Math.ceil((graceEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          }

          subscription = {
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
            isTrial,
            isPremium,
            isGracePeriod,
            daysRemaining,
            daysUntilExpiry,
            daysInGrace,
            paymentPendingVerification: sub.payment_pending_verification,
            paymentRequestedAmount: sub.payment_requested_amount ? Number(sub.payment_requested_amount) : null,
            paymentRequestedMonths: sub.payment_requested_months,
            paymentReferenceNumber: sub.payment_reference_number,
            paymentRequestedAt: sub.payment_requested_at,
          };
        }

        return {
          id: user.id,
          email: user.email,
          appName: user.app_name || "Moja Aplikacija",
          createdAt: user.created_at,
          lastSignIn: user.last_sign_in,
          imeKorisnika: user.ime_korisnika,
          brojTelefona: user.broj_telefona,
          lokacija: user.lokacija,
          subscription,
        };
      })
    );

    return NextResponse.json({ users: usersWithSubs });
  } catch (err) {
    console.error("Greška u GET /api/admin/users:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST - ažuriraj korisnika
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, imeKorisnika, brojTelefona, lokacija, appName } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId je obavezan" }, { status: 400 });
    }

    // Ažuriraj korisnika
    await query(
      `UPDATE users 
       SET ime_korisnika = COALESCE($1, ime_korisnika),
           broj_telefona = COALESCE($2, broj_telefona),
           lokacija = COALESCE($3, lokacija),
           app_name = COALESCE($4, app_name)
       WHERE id = $5`,
      [imeKorisnika || null, brojTelefona || null, lokacija || null, appName || null, userId]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Greška u POST /api/admin/users:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE - obriši korisnika
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId je obavezan" }, { status: 400 });
    }

    // Obriši korisnika i sve povezane podatke (CASCADE će obrisati obracuni, itd.)
    await query(`DELETE FROM users WHERE id = $1`, [userId]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Greška u DELETE /api/admin/users:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

