// ADAPTATEUR SECONDAIRE : port Payment, faux prestataire de paiement.
// Le plafond de 500 € est une règle DU PRESTATAIRE, pas du métier : elle vit ici,
// et un vrai prestataire branché demain appliquera ses propres règles.
export class FakePayment {
  async charge({ amount }) {
    if (amount > 500)
      return { ok: false, reason: 'Paiement refusé : montant supérieur à 500 €' };
    return { ok: true };
  }
}
