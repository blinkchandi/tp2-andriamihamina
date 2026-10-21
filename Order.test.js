// L'entité se teste seule : ni serveur, ni base, ni adaptateur.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Order } from './domain/Order.js';

const commande = (lines, customerId = 'C-42') =>
  new Order({ id: 'CMD-1', customerId, lines, createdAt: '2026-10-21T16:00:00Z' });

const CLAVIER_SOURIS = [
  { sku: 'CLAVIER', qty: 2, unitPrice: 49 },
  { sku: 'SOURIS', qty: 1, unitPrice: 19 },
];

test('une commande neuve est EN_ATTENTE et calcule son total', () => {
  const o = commande(CLAVIER_SOURIS);
  assert.equal(o.total, 117);
  assert.equal(o.statut, 'EN_ATTENTE');
});

test('refuse une commande vide, sans client ou avec une quantité invalide', () => {
  assert.throws(() => commande([]), /au moins une ligne/);
  assert.throws(() => commande(CLAVIER_SOURIS, ''), /Client obligatoire/);
  assert.throws(() => commande([{ sku: 'CLAVIER', qty: 0, unitPrice: 49 }]), /Quantité invalide/);
  assert.throws(() => commande([{ sku: 'CLAVIER', qty: 1.5, unitPrice: 49 }]), /Quantité invalide/);
});

test("une commande ne change de statut qu'une fois", () => {
  const payee = commande(CLAVIER_SOURIS);
  payee.marquerPayee();
  assert.equal(payee.statut, 'PAYEE');
  assert.throws(() => payee.marquerRefusee('trop tard'), /Commande déjà traitée/);
  assert.equal(payee.statut, 'PAYEE');
});

test('une commande refusée retient son motif, visible dans toJSON', () => {
  const o = commande(CLAVIER_SOURIS);
  o.marquerRefusee('Paiement refusé');
  assert.equal(o.toJSON().statut, 'REFUSEE');
  assert.equal(o.toJSON().motif, 'Paiement refusé');
  assert.throws(() => o.marquerPayee(), /Commande déjà traitée/);
});

test("les lignes ne sont pas modifiables de l'extérieur", () => {
  const lignes = [{ sku: 'CLAVIER', qty: 2, unitPrice: 49 }];
  const o = commande(lignes);
  lignes[0].qty = 100; // on modifie le tableau d'origine
  o.lines[0].qty = 100; // on modifie la copie renvoyée par le getter
  assert.equal(o.total, 98);
});
