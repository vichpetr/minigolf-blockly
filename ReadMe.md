# Blockly Minigolf

Blockly Minigolf je interaktivní hra, která kombinuje programování pomocí Blockly a simulaci minigolfu. Hráči mohou vytvářet programy pomocí bloků a ovládat míček na herním plánu s cílem dostat ho do jamky.

---

## Obsah
1. [Popis hry](#popis-hry)
2. [Implementace](#implementace)
3. [Definice herního pole](#definice-herního-pole)
4. [Použití](#použití)
5. [Technologie](#technologie)
6. [Odkazy](#odkazy)

---

## Popis hry

Hra umožňuje hráčům:
- Používat Blockly bloky k programování pohybu míčku.
- Interagovat s herním plánem, který obsahuje překážky a jamku.
- Vizualizovat směr pohybu míčku pomocí kompasu.
- Postupovat mezi úrovněmi a sledovat výsledky.

Cílem hry je dostat míček do jamky s co nejmenším počtem tahů.

---

## Implementace

### Struktura projektu
- **`index.html`**: Obsahuje základní strukturu aplikace, včetně herního plátna, Blockly editoru a kompasu.
- **`main.css`**: Definuje styly pro rozvržení aplikace, včetně herního plátna, Blockly editoru a kompasu.
- **`game-logic.js`**: Obsahuje hlavní logiku hry, včetně detekce kolizí, vykreslování herních prvků a správy úrovní.
- **`custom-blocks.js`**: Definuje vlastní Blockly bloky pro ovládání hry.
- **`courses.json`**: Obsahuje definice herních polí (úrovní).

### Hlavní funkce
1. **Vykreslení herního plánu**:
   - Herní plán obsahuje překážky, jamku a míček.
   - Překážky mohou být obdélníkové nebo kruhové a mohou být rotované.

2. **Detekce kolizí**:
   - Míček detekuje kolize s překážkami a reaguje odrazem.
   - Kolize jsou počítány s ohledem na rotaci překážek.

3. **Kompas**:
   - Kompas zobrazuje aktuální směr pohybu míčku.
   - Uživatel může ručně otáčet ručičku kompasu a nastavovat úhel.

4. **Blockly integrace**:
   - Hráči mohou vytvářet programy pomocí Blockly bloků, které ovládají pohyb míčku.

---

## Definice herního pole

Herní pole je definováno v souboru `courses.json`. Každé pole obsahuje:
- **`obstacles`**: Pole překážek na herním plánu.
  - **`type`**: Typ překážky (`rect` nebo `circle`).
  - **`x`, `y`**: Souřadnice překážky.
  - **`width`, `height`**: Rozměry překážky (pro obdélníky).
  - **`radius`**: Poloměr překážky (pro kruhy).
  - **`rotation`**: Úhel rotace překážky (pro obdélníky).
- **`hole`**: Definice jamky.
  - **`x`, `y`**: Souřadnice jamky.
  - **`radius`**: Poloměr jamky.
- **`start`**: Startovní pozice míčku.
  - **`x`, `y`**: Souřadnice startovní pozice.

### Příklad definice úrovně:
```json
{
    "courses": [
        {
            "obstacles": [
                { "type": "rect", "x": 50, "y": 50, "width": 100, "height": 10, "rotation": 0 },
                { "type": "circle", "x": 300, "y": 300, "radius": 50 }
            ],
            "hole": { "x": 700, "y": 500, "radius": 20 },
            "start": { "x": 100, "y": 100 }
        }
    ]
}
```

---

## Odkazy

- [Blockly](https://developers.google.com/blockly)
- [Minigolf demo](https://minigolf-blockly.petrvich.eu/)
- [Zdrojové kódy](https://github.com/vichpetr/minigolf-blockly)