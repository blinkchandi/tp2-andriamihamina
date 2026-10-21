// domain/Order.js : DOMAINE, aucun import
// L'entité Order, ses invariants et son cycle de vie : EN_ATTENTE -> PAYEE ou REFUSEE.
export class Order {
  #lines;
  #statut = 'EN_ATTENTE';
  #motif;

  constructor({ id, customerId, lines, createdAt }) {
    if (!customerId) throw new Error('Client obligatoire');
    if (!lines?.length) throw new Error('Une commande doit contenir au moins une ligne');
    for (const l of lines)
      if (!Number.isInteger(l.qty) || l.qty <= 0)
        throw new Error(`Quantité invalide pour ${l.sku} : entier supérieur à 0 attendu`);
    this.id = id;
    this.customerId = customerId;
    this.#lines = lines.map(l => ({ ...l })); // copie : l'appelant ne garde pas la main
    this.createdAt = createdAt;
  }
  get statut() {
    return this.#statut;
  }
  get motif() {
    return this.#motif;
  }
  get lines() {
    return this.#lines.map(l => ({ ...l })); // copie défensive
  }
  get total() {
    return this.#lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);
  }
  marquerPayee() {
    this.#verifierEnAttente();
    this.#statut = 'PAYEE';
  }
  marquerRefusee(motif) {
    this.#verifierEnAttente();
    this.#statut = 'REFUSEE';
    this.#motif = motif;
  }
  #verifierEnAttente() {
    if (this.#statut !== 'EN_ATTENTE') throw new Error('Commande déjà traitée');
  }
  toJSON() {
    return {
      id: this.id,
      customerId: this.customerId,
      lines: this.lines,
      total: this.total,
      statut: this.statut,
      motif: this.motif,
      createdAt: this.createdAt,
    };
  }
}
