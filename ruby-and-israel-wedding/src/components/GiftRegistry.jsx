import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  getDocs,
  writeBatch,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { ChevronDown, Search } from "lucide-react";
import { db } from "../firebase";
import { GIFT_REGISTRY_SEED } from "../data/giftRegistryData.js";
import Reveal from "./shared/Reveal.jsx";

const CATEGORY_ORDER = ["Major Gifts", "Mid-Range Gifts", "Small Gifts (under KES 2,500)"];

const STORES = [
  "Carrefour — Sarit Centre, Westgate, The Hub, Galleria, Junction",
  "Quickmart — Kileleshwa",
  "Home & Beyond — Sarit Centre, Rhapta Square (Westlands)",
];

function formatKES(amount) {
  if (amount == null) return null;
  return `KES ${Number(amount).toLocaleString("en-KE")}`;
}

// If the registryItems collection is completely empty, this writes the
// starting data in once, using deterministic IDs so it's safe even if two
// guests happen to load an empty registry at the same moment — both
// "seeds" just overwrite the same documents rather than duplicating them.
async function seedIfEmpty() {
  const snap = await getDocs(collection(db, "registryItems"));
  if (!snap.empty) return;
  const batch = writeBatch(db);
  GIFT_REGISTRY_SEED.forEach((item) => {
    batch.set(doc(db, "registryItems", item.id), item);
  });
  await batch.commit();
}

// For a registry that was already seeded before prices existed, this fills
// in the `price` field on any live item that's missing one, using the
// GIFT_REGISTRY_SEED values as the source of prices. It never touches
// purchased / purchasedBy / purchasedAt, so items already claimed (like the
// fridge-freezer) keep their purchase record exactly as-is — they just gain
// a price.
async function syncMissingPrices(liveItems) {
  const priceById = new Map(GIFT_REGISTRY_SEED.map((it) => [it.id, it.price]));
  const needsPrice = liveItems.filter(
    (it) => (it.price === undefined || it.price === null) && priceById.get(it.id) != null
  );
  if (needsPrice.length === 0) return;
  const batch = writeBatch(db);
  needsPrice.forEach((it) => {
    batch.update(doc(db, "registryItems", it.id), { price: priceById.get(it.id) });
  });
  await batch.commit();
}

function MarkPurchasedModal({ item, onClose, onDone }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    setSaving(true);
    setError("");
    try {
      await runTransaction(db, async (tx) => {
        const ref = doc(db, "registryItems", item.id);
        const snap = await tx.get(ref);
        if (snap.data()?.purchased) {
          throw new Error("ALREADY_PURCHASED");
        }
        tx.update(ref, {
          purchased: true,
          purchasedBy: name.trim() || "A guest",
          purchasedAt: serverTimestamp(),
        });
      });
      onDone();
    } catch (err) {
      if (err.message === "ALREADY_PURCHASED") {
        setError("Someone just got this one — sorry! Pick another gift.");
      } else {
        console.error(err);
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="gr-modal-backdrop" onClick={onClose}>
      <div className="gr-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Mark as purchased</h3>
        <p className="gr-modal-item-name">{item.name}</p>
        {item.price != null && (
          <p className="gr-modal-price">{formatKES(item.price)}</p>
        )}
        <p className="gr-modal-sub">
          This removes it from the list so no one else buys the same thing.
        </p>
        <label className="gr-modal-label">Your name (optional)</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Faith Wanjiru"
        />
        {error && <p className="gr-error">{error}</p>}
        <div className="gr-modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="btn-gold" onClick={handleConfirm} disabled={saving}>
            {saving ? "Saving..." : "Confirm purchase"}
          </button>
        </div>
      </div>
    </div>
  );
}

function RegistryItemRow({ item, onMark }) {
  return (
    <div className="gr-item">
      <div className="gr-item-main">
        <span className="gr-item-name">{item.name}</span>
        {item.notes && <span className="gr-item-notes">{item.notes}</span>}
        <div className="gr-item-meta">
          {item.price != null && (
            <span className="gr-item-price">{formatKES(item.price)}</span>
          )}
          {item.offer && <span className="gr-item-offer">{item.offer}</span>}
        </div>
      </div>
      <button type="button" className="gr-mark-btn" onClick={() => onMark(item)}>
        I'll get this
      </button>
    </div>
  );
}

function CategorySection({ category, items, openByDefault, onMark }) {
  const [open, setOpen] = useState(openByDefault);

  // Group this category's items by their "section" field, preserving the
  // order sections first appear in the source data.
  const sections = useMemo(() => {
    const map = new Map();
    items.forEach((it) => {
      if (!map.has(it.section)) map.set(it.section, []);
      map.get(it.section).push(it);
    });
    return Array.from(map.entries());
  }, [items]);

  if (items.length === 0 && !openByDefault) return null;

  return (
    <div className="gr-category">
      <button type="button" className="gr-category-header" onClick={() => setOpen((v) => !v)}>
        <span>{category}</span>
        <span className="gr-category-count">
          {items.length} left
          <ChevronDown size={16} className={`gr-chevron ${open ? "open" : ""}`} />
        </span>
      </button>
      {open && (
        <div className="gr-category-body">
          {items.length === 0 ? (
            <p className="gr-empty">Everything here has been claimed — thank you!</p>
          ) : (
            sections.map(([section, secItems]) => (
              <div className="gr-section" key={section}>
                <h4>{section}</h4>
                {secItems.map((item) => (
                  <RegistryItemRow key={item.id} item={item} onMark={onMark} />
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function GiftRegistry() {
  const [items, setItems] = useState(null); // null = loading
  const [search, setSearch] = useState("");
  const [showPurchased, setShowPurchased] = useState(false);
  const [markingItem, setMarkingItem] = useState(null);
  const hasSyncedPrices = useRef(false);

  useEffect(() => {
    seedIfEmpty().catch((err) => console.error("Could not seed registry:", err));
    const unsub = onSnapshot(collection(db, "registryItems"), (snap) => {
      const list = snap.docs.map((d) => d.data());
      list.sort((a, b) => a.no - b.no);
      setItems(list);

      // One-time catch-up: if this registry was seeded before prices
      // existed, fill in any missing prices from the current seed file.
      // Guarded so it only ever runs once per page load, no matter how
      // many snapshot events come through.
      if (!hasSyncedPrices.current) {
        hasSyncedPrices.current = true;
        syncMissingPrices(list).catch((err) =>
          console.error("Could not sync registry prices:", err)
        );
      }
    });
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    if (!items) return [];
    const q = search.trim().toLowerCase();
    return items.filter((it) => {
      if (!showPurchased && it.purchased) return false;
      if (!q) return true;
      return (
        it.name.toLowerCase().includes(q) ||
        (it.notes || "").toLowerCase().includes(q) ||
        it.section.toLowerCase().includes(q)
      );
    });
  }, [items, search, showPurchased]);

  const byCategory = useMemo(() => {
    const map = new Map();
    CATEGORY_ORDER.forEach((c) => map.set(c, []));
    filtered.forEach((it) => {
      if (!map.has(it.category)) map.set(it.category, []);
      map.get(it.category).push(it);
    });
    return map;
  }, [filtered]);

  const totalLeft = items ? items.filter((it) => !it.purchased).length : null;

  return (
    <section className="gift-registry" id="gift-registry">
      <Reveal className="gr-intro">
        <p className="eyebrow">Registry</p>
        <h2>Help us set up our home</h2>
        <p className="gr-intro-text">
          We've put together a registry at a few of our favourite stores.
          Tap "I'll get this" on anything that catches your eye — it'll come
          off the list right away so no one else buys the same thing.
        </p>
        <div className="gr-stores">
          {STORES.map((s) => (
            <span className="gr-store-chip" key={s}>
              {s}
            </span>
          ))}
        </div>
      </Reveal>

      <div className="gr-controls">
        <div className="gr-search">
          <Search size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for an item..."
          />
        </div>
        <label className="gr-toggle">
          <input
            type="checkbox"
            checked={showPurchased}
            onChange={(e) => setShowPurchased(e.target.checked)}
          />
          Show items already bought
        </label>
      </div>

      {items === null ? (
        <p className="gr-empty">Loading registry...</p>
      ) : (
        <>
          {totalLeft !== null && (
            <p className="gr-count-line">{totalLeft} gifts still available</p>
          )}
          {Array.from(byCategory.entries()).map(([category, catItems], i) => (
            <CategorySection
              key={category}
              category={category}
              items={catItems}
              openByDefault={i === 0 || search.trim().length > 0}
              onMark={setMarkingItem}
            />
          ))}
        </>
      )}

      {markingItem && (
        <MarkPurchasedModal
          item={markingItem}
          onClose={() => setMarkingItem(null)}
          onDone={() => setMarkingItem(null)}
        />
      )}
    </section>
  );
}
